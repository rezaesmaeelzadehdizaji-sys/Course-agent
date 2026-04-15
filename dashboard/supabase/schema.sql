-- ============================================================
-- T-FLAWS Course Dashboard — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- COURSES
-- Registry of all 17 courses
-- ============================================================
create table if not exists courses (
  id              uuid primary key default gen_random_uuid(),
  course_number   smallint not null unique check (course_number between 1 and 17),
  slug            text not null unique,
  status          text not null default 'Planned'
                    check (status in ('Complete', 'In Progress', 'Planned')),
  progress_pct    smallint not null default 0
                    check (progress_pct between 0 and 100),
  meta            jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- INTRODUCTIONS
-- One row per course
-- ============================================================
create table if not exists introductions (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid not null references courses(id) on delete cascade unique,
  title           text not null default '',
  paragraphs      text[] not null default '{}',
  subsections     jsonb not null default '[]',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- SECTIONS
-- T-FLAWS component sections — 6 per course
-- subsections jsonb shape:
--   {
--     whatItIs:            { heading, paragraphs[] }
--     whyItMatters:        { heading, paragraphs[] }
--     howToAssess:         { heading, paragraphs[] }
--     abnormalFindings:    { heading, paragraphs[] }
--     managementResponses: { heading, paragraphs[], imagePlaceholder: { caption, description } }
--   }
-- ============================================================
create table if not exists sections (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid not null references courses(id) on delete cascade,
  section_key     text not null,
  letter          char(1) not null,
  title           text not null default '',
  full_title      text not null default '',
  sort_order      smallint not null default 0,
  subsections     jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (course_id, section_key)
);

-- ============================================================
-- JOURNAL_SECTIONS
-- One row per course
-- journals jsonb: [{ name, publisher, scope, issn }]
-- ============================================================
create table if not exists journal_sections (
  id                      uuid primary key default gen_random_uuid(),
  course_id               uuid not null references courses(id) on delete cascade unique,
  title                   text not null default '',
  intro                   text not null default '',
  journals                jsonb not null default '[]',
  institutional_resources text[] not null default '{}',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ============================================================
-- REFERENCES
-- One row per citation; each course has its own set
-- ============================================================
create table if not exists "references" (
  id              uuid primary key default gen_random_uuid(),
  course_id       uuid not null references courses(id) on delete cascade,
  ref_key         text not null,
  apa             text not null default '',
  short           text not null default '',
  sort_order      smallint not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (course_id, ref_key)
);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_courses_updated_at
  before update on courses
  for each row execute procedure update_updated_at();

create or replace trigger trg_introductions_updated_at
  before update on introductions
  for each row execute procedure update_updated_at();

create or replace trigger trg_sections_updated_at
  before update on sections
  for each row execute procedure update_updated_at();

create or replace trigger trg_journal_sections_updated_at
  before update on journal_sections
  for each row execute procedure update_updated_at();

create or replace trigger trg_references_updated_at
  before update on "references"
  for each row execute procedure update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- Single-user app: authenticated users have full access
-- ============================================================
alter table courses           enable row level security;
alter table introductions     enable row level security;
alter table sections          enable row level security;
alter table journal_sections  enable row level security;
alter table "references"      enable row level security;

-- Drop policies if they already exist (for re-runs)
drop policy if exists "auth_full_access" on courses;
drop policy if exists "auth_full_access" on introductions;
drop policy if exists "auth_full_access" on sections;
drop policy if exists "auth_full_access" on journal_sections;
drop policy if exists "auth_full_access" on "references";

create policy "auth_full_access" on courses
  for all using (auth.role() = 'authenticated');

create policy "auth_full_access" on introductions
  for all using (auth.role() = 'authenticated');

create policy "auth_full_access" on sections
  for all using (auth.role() = 'authenticated');

create policy "auth_full_access" on journal_sections
  for all using (auth.role() = 'authenticated');

create policy "auth_full_access" on "references"
  for all using (auth.role() = 'authenticated');
