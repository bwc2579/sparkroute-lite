-- SparkRoute Lite Supabase Tables & Policies

create table if not exists sparkroute_tree_notes (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists sparkroute_tasks (
  id text primary key,
  title text not null,
  status text not null,
  priority text not null default 'medium',
  due_date text,
  subtasks jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table sparkroute_tree_notes enable row level security;
alter table sparkroute_tasks enable row level security;

-- Drop existing policies if any to avoid collision
drop policy if exists "Allow public select on sparkroute_tree_notes" on sparkroute_tree_notes;
drop policy if exists "Allow public insert on sparkroute_tree_notes" on sparkroute_tree_notes;
drop policy if exists "Allow public update on sparkroute_tree_notes" on sparkroute_tree_notes;
drop policy if exists "Allow public delete on sparkroute_tree_notes" on sparkroute_tree_notes;

drop policy if exists "Allow public select on sparkroute_tasks" on sparkroute_tasks;
drop policy if exists "Allow public insert on sparkroute_tasks" on sparkroute_tasks;
drop policy if exists "Allow public update on sparkroute_tasks" on sparkroute_tasks;
drop policy if exists "Allow public delete on sparkroute_tasks" on sparkroute_tasks;

-- Create Policies for Anon / Public Access
create policy "Allow public select on sparkroute_tree_notes" on sparkroute_tree_notes for select using (true);
create policy "Allow public insert on sparkroute_tree_notes" on sparkroute_tree_notes for insert with check (true);
create policy "Allow public update on sparkroute_tree_notes" on sparkroute_tree_notes for update using (true);
create policy "Allow public delete on sparkroute_tree_notes" on sparkroute_tree_notes for delete using (true);

create policy "Allow public select on sparkroute_tasks" on sparkroute_tasks for select using (true);
create policy "Allow public insert on sparkroute_tasks" on sparkroute_tasks for insert with check (true);
create policy "Allow public update on sparkroute_tasks" on sparkroute_tasks for update using (true);
create policy "Allow public delete on sparkroute_tasks" on sparkroute_tasks for delete using (true);
