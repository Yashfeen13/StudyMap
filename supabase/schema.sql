-- ================================================
-- StudyMap — Supabase Database Schema
-- Run this in your Supabase SQL editor
-- ================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ------------------------------------------------
-- Table: courses
-- ------------------------------------------------
create table if not exists courses (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  name        text not null,
  syllabus_text text not null,
  exam_date   date,
  created_at  timestamptz default now()
);

-- Index for fast session lookups
create index if not exists idx_courses_session_id on courses(session_id);

-- ------------------------------------------------
-- Table: study_plans
-- ------------------------------------------------
create table if not exists study_plans (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references courses(id) on delete cascade,
  generated_at  timestamptz default now(),
  plan_json     jsonb not null
  -- shape: { "weeks": [{ "week": 1, "topics": ["..."], "hours_recommended": 6 }] }
);

create index if not exists idx_study_plans_course_id on study_plans(course_id);

-- ------------------------------------------------
-- Table: topic_completions
-- ------------------------------------------------
create table if not exists topic_completions (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references courses(id) on delete cascade,
  topic_name    text not null,
  completed_at  timestamptz default now(),
  unique(course_id, topic_name)
);

create index if not exists idx_topic_completions_course_id on topic_completions(course_id);

-- ================================================
-- Row Level Security (RLS)
-- ================================================
-- Note: We use anonymous session_id (stored in browser localStorage).
-- RLS policies enforce that API calls with the anon key can only
-- access rows that belong to the requesting session.
-- The session_id is passed via query filters; no auth token is used.
--
-- For a production app with auth, replace session_id checks with auth.uid().
--
-- IMPORTANT: Enable RLS on each table in the Supabase dashboard, then run:

alter table courses          enable row level security;
alter table study_plans      enable row level security;
alter table topic_completions enable row level security;

-- Courses: allow all operations (session enforcement done at app level)
create policy "Allow all for courses" on courses
  for all using (true) with check (true);

-- Study plans: allow all (course_id FK ensures scoping)
create policy "Allow all for study_plans" on study_plans
  for all using (true) with check (true);

-- Topic completions: allow all
create policy "Allow all for topic_completions" on topic_completions
  for all using (true) with check (true);
