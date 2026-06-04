-- ============================================================
-- CampusCast: 003_rpc_functions.sql
-- RPC functions called from backend via supabase.rpc()
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- create_registration: atomically validates and registers a student
-- Returns the new registration row or raises an exception.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_registration(
  p_student_id UUID,
  p_event_id   UUID
)
RETURNS public.registrations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event         public.events%ROWTYPE;
  v_registration  public.registrations%ROWTYPE;
BEGIN
  -- Lock the event row to prevent race conditions
  SELECT * INTO v_event
  FROM public.events
  WHERE id = p_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  -- Check registration deadline
  IF v_event.registration_deadline IS NOT NULL
     AND NOW() > v_event.registration_deadline THEN
    RAISE EXCEPTION 'Registration deadline has passed';
  END IF;

  -- Check seat availability
  IF v_event.remaining_seats <= 0 THEN
    RAISE EXCEPTION 'No seats available';
  END IF;

  -- Check duplicate registration
  IF EXISTS (
    SELECT 1 FROM public.registrations
    WHERE student_id = p_student_id AND event_id = p_event_id
  ) THEN
    RAISE EXCEPTION 'Already registered for this event';
  END IF;

  -- Insert registration
  INSERT INTO public.registrations (student_id, event_id, status)
  VALUES (p_student_id, p_event_id, 'registered')
  RETURNING * INTO v_registration;

  -- Atomically decrement remaining_seats
  UPDATE public.events
  SET remaining_seats = remaining_seats - 1
  WHERE id = p_event_id;

  RETURN v_registration;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- increment_seats: safely adds 1 back to remaining_seats
-- Called when a registration is cancelled
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_seats(p_event_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.events
  SET remaining_seats = remaining_seats + 1
  WHERE id = p_event_id
    AND remaining_seats < total_seats;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- get_dashboard_stats: aggregated counts for admin analytics
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_events        INTEGER;
  v_total_registrations INTEGER;
  v_total_teams         INTEGER;
  v_total_attendance    INTEGER;
  v_total_present       INTEGER;
  v_attendance_rate     NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_total_events FROM public.events;
  SELECT COUNT(*) INTO v_total_registrations FROM public.registrations;
  SELECT COUNT(*) INTO v_total_teams FROM public.teams;
  SELECT COUNT(*) INTO v_total_attendance FROM public.attendance;
  SELECT COUNT(*) INTO v_total_present
    FROM public.attendance WHERE status = 'present';

  IF v_total_registrations > 0 THEN
    v_attendance_rate := ROUND((v_total_present::NUMERIC / v_total_registrations) * 100, 1);
  ELSE
    v_attendance_rate := 0;
  END IF;

  RETURN json_build_object(
    'totalEvents',         v_total_events,
    'totalRegistrations',  v_total_registrations,
    'totalTeams',          v_total_teams,
    'totalAttendance',     v_total_attendance,
    'attendanceRate',      v_attendance_rate
  );
END;
$$;

-- ────────────────────────────────────────────────────────────
-- get_registration_analytics: per-event registration counts
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_registration_analytics()
RETURNS TABLE (event_title TEXT, registrations BIGINT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT e.title AS event_title, COUNT(r.id) AS registrations
  FROM public.events e
  LEFT JOIN public.registrations r ON r.event_id = e.id
  GROUP BY e.id, e.title
  ORDER BY e.title;
$$;

-- ────────────────────────────────────────────────────────────
-- get_attendance_analytics: per-event attendance vs registered
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_attendance_analytics()
RETURNS TABLE (
  event_title TEXT,
  registered  BIGINT,
  present     BIGINT,
  absent      BIGINT,
  percentage  NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    e.title AS event_title,
    COUNT(DISTINCT r.id) AS registered,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'present') AS present,
    COUNT(DISTINCT r.id) - COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'present') AS absent,
    CASE
      WHEN COUNT(DISTINCT r.id) > 0 THEN
        ROUND((COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'present')::NUMERIC / COUNT(DISTINCT r.id)) * 100, 1)
      ELSE 0
    END AS percentage
  FROM public.events e
  LEFT JOIN public.registrations r ON r.event_id = e.id
  LEFT JOIN public.attendance a ON a.event_id = e.id AND a.student_id = r.student_id
  GROUP BY e.id, e.title
  ORDER BY e.title;
$$;

-- ────────────────────────────────────────────────────────────
-- get_team_analytics: team count and average size
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_team_analytics()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'totalTeams',  COUNT(DISTINCT t.id),
    'averageSize', COALESCE(ROUND(AVG(member_counts.cnt), 1), 0)
  )
  FROM public.teams t
  LEFT JOIN (
    SELECT team_id, COUNT(*) AS cnt
    FROM public.team_members
    GROUP BY team_id
  ) member_counts ON member_counts.team_id = t.id;
$$;

-- ────────────────────────────────────────────────────────────
-- get_feedback_analytics: average rating and distribution
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_feedback_analytics()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'averageRating', COALESCE(ROUND(AVG(rating)::NUMERIC, 1), 0),
    'total',         COUNT(*),
    'distribution',  json_build_array(
      COUNT(*) FILTER (WHERE rating = 1),
      COUNT(*) FILTER (WHERE rating = 2),
      COUNT(*) FILTER (WHERE rating = 3),
      COUNT(*) FILTER (WHERE rating = 4),
      COUNT(*) FILTER (WHERE rating = 5)
    )
  )
  FROM public.feedback;
$$;
