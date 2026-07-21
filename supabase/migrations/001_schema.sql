-- EIA Survey schema
-- Normalized tables for adaptive interview templates

create extension if not exists "pgcrypto";

-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  thank_you_message text default 'Thank you for sharing your insights.',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  title text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create type public.question_type as enum (
  'short_text',
  'long_text',
  'multiple_choice',
  'multiple_select',
  'dropdown',
  'yes_no',
  'rating'
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  section_id uuid references public.sections(id) on delete set null,
  key text not null,
  type public.question_type not null,
  title text not null,
  description text,
  required boolean not null default true,
  order_index integer not null default 0,
  -- rating scale, optionsFromQuestionKey, etc.
  config jsonb not null default '{}'::jsonb,
  -- For follow-up loops: expand once per selected option of source question
  repeat_source_question_id uuid references public.questions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (template_id, key)
);

create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  label text not null,
  value text not null,
  order_index integer not null default 0,
  unique (question_id, value)
);

create type public.branch_operator as enum (
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'is_answered',
  'is_empty'
);

create type public.branch_action as enum (
  'goto',
  'show',
  'hide',
  'end'
);

create table if not exists public.branch_rules (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  source_question_id uuid not null references public.questions(id) on delete cascade,
  operator public.branch_operator not null default 'equals',
  value text,
  target_question_id uuid references public.questions(id) on delete cascade,
  action public.branch_action not null default 'goto',
  priority integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  respondent_token text not null unique,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  current_question_key text,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  last_saved_at timestamptz not null default now()
);

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  -- Distinguishes loop instances, e.g. device=ECG (empty string = no instance)
  instance_key text not null default '',
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, question_id, instance_key)
);

create index if not exists idx_sections_template on public.sections(template_id, order_index);
create index if not exists idx_questions_template on public.questions(template_id, order_index);
create index if not exists idx_options_question on public.question_options(question_id, order_index);
create index if not exists idx_branch_template on public.branch_rules(template_id, priority);
create index if not exists idx_sessions_template on public.interview_sessions(template_id, status);
create index if not exists idx_responses_session on public.responses(session_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.templates enable row level security;
alter table public.sections enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.branch_rules enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.responses enable row level security;

-- Public can read published templates and related structure
create policy "Published templates are readable"
  on public.templates for select
  using (status = 'published' or auth.role() = 'authenticated');

create policy "Admins manage templates"
  on public.templates for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Public read sections of readable templates"
  on public.sections for select
  using (
    exists (
      select 1 from public.templates t
      where t.id = sections.template_id
        and (t.status = 'published' or auth.role() = 'authenticated')
    )
  );

create policy "Admins manage sections"
  on public.sections for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Public read questions of readable templates"
  on public.questions for select
  using (
    exists (
      select 1 from public.templates t
      where t.id = questions.template_id
        and (t.status = 'published' or auth.role() = 'authenticated')
    )
  );

create policy "Admins manage questions"
  on public.questions for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Public read options"
  on public.question_options for select
  using (
    exists (
      select 1 from public.questions q
      join public.templates t on t.id = q.template_id
      where q.id = question_options.question_id
        and (t.status = 'published' or auth.role() = 'authenticated')
    )
  );

create policy "Admins manage options"
  on public.question_options for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Public read branch rules"
  on public.branch_rules for select
  using (
    exists (
      select 1 from public.templates t
      where t.id = branch_rules.template_id
        and (t.status = 'published' or auth.role() = 'authenticated')
    )
  );

create policy "Admins manage branch rules"
  on public.branch_rules for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Anonymous respondents can create/update their own sessions by token (handled via service role in API)
create policy "Authenticated read all sessions"
  on public.interview_sessions for select
  using (auth.role() = 'authenticated');

create policy "Authenticated read all responses"
  on public.responses for select
  using (auth.role() = 'authenticated');

create policy "Profiles readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
