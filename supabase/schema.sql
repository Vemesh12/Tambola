create extension if not exists "pgcrypto";

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_name text not null,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  called_numbers integer[] not null default '{}',
  created_at timestamp with time zone not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  session_id text not null,
  ticket jsonb not null,
  marked integer[] not null default '{}',
  joined_at timestamp with time zone not null default now(),
  unique (room_id, session_id)
);

create table if not exists public.winners (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  player_name text not null,
  prize_type text not null check (
    prize_type in (
      'early_five',
      'corners',
      'top',
      'middle',
      'bottom',
      'full_house'
    )
  ),
  claimed_at timestamp with time zone not null default now(),
  unique (room_id, prize_type)
);

create index if not exists rooms_code_idx on public.rooms(code);
create index if not exists players_room_id_idx on public.players(room_id);
create index if not exists winners_room_id_idx on public.winners(room_id);
