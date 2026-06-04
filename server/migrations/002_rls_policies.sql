-- ============================================================
-- CampusCast: 002_rls_policies.sql
-- Enable RLS and define access policies.
-- NOTE: Backend uses service_role key which bypasses RLS.
--       These policies protect direct client-side access.
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins have full profile access"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── events ───────────────────────────────────────────────────
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read events"
  ON public.events FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── registrations ────────────────────────────────────────────
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see own registrations"
  ON public.registrations FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert own registrations"
  ON public.registrations FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can cancel own registrations"
  ON public.registrations FOR DELETE
  USING (student_id = auth.uid());

CREATE POLICY "Admins have full registration access"
  ON public.registrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── teams ────────────────────────────────────────────────────
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read teams"
  ON public.teams FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Students can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (leader_id = auth.uid());

CREATE POLICY "Leaders can update own teams"
  ON public.teams FOR UPDATE
  USING (leader_id = auth.uid());

CREATE POLICY "Admins have full team access"
  ON public.teams FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── team_members ─────────────────────────────────────────────
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read team_members"
  ON public.team_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Students can join teams"
  ON public.team_members FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins have full team_members access"
  ON public.team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── announcements ─────────────────────────────────────────────
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read announcements"
  ON public.announcements FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── attendance_codes ─────────────────────────────────────────
ALTER TABLE public.attendance_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage attendance codes"
  ON public.attendance_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can read active codes"
  ON public.attendance_codes FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = TRUE);

-- ── attendance ────────────────────────────────────────────────
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see own attendance"
  ON public.attendance FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can mark attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins have full attendance access"
  ON public.attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── certificates ──────────────────────────────────────────────
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see own certificates"
  ON public.certificates FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admins have full certificate access"
  ON public.certificates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── feedback ──────────────────────────────────────────────────
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see own feedback"
  ON public.feedback FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can submit feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins have full feedback access"
  ON public.feedback FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── admin_logs ────────────────────────────────────────────────
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin_logs"
  ON public.admin_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role inserts admin_logs"
  ON public.admin_logs FOR INSERT
  WITH CHECK (TRUE); -- backend uses service role key
