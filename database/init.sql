-- Tabulka pro tipy uživatelů
create table tips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  match_id uuid references matches not null,
  score_home integer not null,
  score_away integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, match_id)
);

-- Tabulka pro výsledky zápasů
create table results (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references matches not null unique,
  final_score_home integer not null,
  final_score_away integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabulka pro body za tipy
create table points (
  id uuid default uuid_generate_v4() primary key,
  tip_id uuid references tips not null unique,
  points integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Triggery pro aktualizaci updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tips_updated_at
  before update on tips
  for each row
  execute function update_updated_at_column();
