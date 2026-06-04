-- Adds the event time column for projects that already ran 001_create_tables.sql.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS time TEXT;
