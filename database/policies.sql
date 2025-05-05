-- Profiles policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Uživatelé mohou číst všechny profily"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Uživatelé mohou upravovat vlastní profil"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Tips policies
alter table tips enable row level security;

create policy "Uživatelé mohou číst všechny tipy"
  on tips for select
  to authenticated
  using (true);

create policy "Uživatelé mohou vkládat vlastní tipy"
  on tips for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Uživatelé mohou upravovat vlastní tipy"
  on tips for update
  to authenticated
  using (auth.uid() = user_id);

-- Results policies 
alter table results enable row level security;

create policy "Všichni mohou číst výsledky"
  on results for select
  to authenticated
  using (true);

create policy "Pouze admini mohou spravovat výsledky"
  on results for all
  to authenticated
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Points policies
alter table points enable row level security;

create policy "Všichni mohou číst body"
  on points for select
  to authenticated
  using (true);
