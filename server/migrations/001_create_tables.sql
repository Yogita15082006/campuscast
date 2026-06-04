-- ============================================================
-- CampusCast: 001_create_tables.sql
-- Run this in Supabase SQL Editor before starting the server.
-- ============================================================

-- Enable UUID extension (already enabled on Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 1. profiles (extends Supabase auth.users)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatically create a profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 2. events
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                 TEXT NOT NULL,
  description           TEXT,
  category              TEXT NOT NULL DEFAULT 'general',
  date                  TIMESTAMPTZ NOT NULL,
  time                  TEXT,
  registration_deadline TIMESTAMPTZ,
  venue                 TEXT,
  total_seats           INTEGER NOT NULL DEFAULT 100,
  remaining_seats       INTEGER NOT NULL DEFAULT 100,
  status                TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  is_team_event         BOOLEAN NOT NULL DEFAULT FALSE,
  team_size_limit       INTEGER NOT NULL DEFAULT 4,
  poster_image          TEXT,
  created_by            UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 3. registrations
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.registrations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id   UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  team_id    UUID, -- FK added after teams table
  status     TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, event_id)
);

-- ────────────────────────────────────────────────────────────
-- 4. teams
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teams (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_name  TEXT NOT NULL,
  team_code  TEXT NOT NULL UNIQUE,
  event_id   UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  leader_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_size   INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK from registrations to teams now that teams exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_registrations_team'
      AND conrelid = 'public.registrations'::regclass
  ) THEN
    ALTER TABLE public.registrations
      ADD CONSTRAINT fk_registrations_team
      FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;
  END IF;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 5. team_members
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id    UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (team_id, student_id)
);

-- ────────────────────────────────────────────────────────────
-- 6. announcements
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message     TEXT NOT NULL,
  event_id    UUID REFERENCES public.events(id) ON DELETE SET NULL,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 7. attendance_codes
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attendance_codes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        TEXT NOT NULL UNIQUE,
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 8. attendance
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attendance (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id   UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent')),
  code_used  TEXT,
  marked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, event_id)
);

-- ────────────────────────────────────────────────────────────
-- 9. certificates
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.certificates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_id  TEXT NOT NULL UNIQUE,
  student_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  download_url    TEXT,
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, event_id)
);

-- ────────────────────────────────────────────────────────────
-- 10. feedback
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  suggestions TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, event_id)
);

-- ────────────────────────────────────────────────────────────
-- 11. admin_logs (activity log)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  entity     TEXT,
  entity_id  TEXT,
  details    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- Updated_at auto-set trigger (for events)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS events_updated_at ON public.events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
