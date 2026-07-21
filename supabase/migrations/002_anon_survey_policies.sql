-- Allow anonymous survey participants to create sessions and save answers
-- using the publishable/anon key (no login required).

create policy "Anon can insert interview sessions"
  on public.interview_sessions for insert
  to anon, authenticated
  with check (true);

create policy "Anon can update interview sessions"
  on public.interview_sessions for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Anon can select own-shaped sessions"
  on public.interview_sessions for select
  to anon, authenticated
  using (true);

create policy "Anon can insert responses"
  on public.responses for insert
  to anon, authenticated
  with check (true);

create policy "Anon can update responses"
  on public.responses for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Anon can select responses"
  on public.responses for select
  to anon, authenticated
  using (true);

-- Template structure already readable when published; ensure anon can seed/manage via service role preferably.
-- Allow authenticated admins full access remains from 001.
