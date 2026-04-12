-- flags table: core data from CSV import
create table public.flags (
  id bigint generated always as identity primary key,
  name text not null,
  row_label text not null,
  position integer not null,
  created_at timestamptz default now(),

  -- Composite unique constraint for merge/upsert (D-13) and duplicate detection (IMP-02)
  unique(row_label, position)
);

-- Full-text search support (for Phase 2, created now to avoid migration later)
alter table public.flags
add column fts tsvector generated always as (
  to_tsvector('english', name)
) stored;

-- GIN index for fast full-text search
create index flags_fts_idx on public.flags using gin (fts);

-- Index for directory queries (ORG-01: alphabetical and by-row)
create index flags_name_idx on public.flags (name);
create index flags_row_position_idx on public.flags (row_label, position);

-- RLS: Enable but allow all access (D-04: no auth needed)
alter table public.flags enable row level security;

create policy "Allow public read" on public.flags
  for select using (true);

create policy "Allow public insert" on public.flags
  for insert with check (true);

create policy "Allow public delete" on public.flags
  for delete using (true);

create policy "Allow public update" on public.flags
  for update using (true);
