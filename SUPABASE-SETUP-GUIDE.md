# Supabase Setup Guide - Step by Step

This guide walks you through creating a Supabase project and connecting it to the Gravestone Finder app. Every click is documented.

---

## STEP 1: Create a Supabase Account (skip if you already have one)

1. Open your browser and go to **https://supabase.com**
2. Click the green **"Start your project"** button (top right)
3. Sign up using one of these options:
   - **GitHub** (recommended - one click if you have a GitHub account)
   - **Email** - enter your email and a password, then check your inbox for a confirmation link
4. After signing up, you land on the Supabase Dashboard at **https://supabase.com/dashboard**

---

## STEP 2: Create a New Supabase Project

1. On the dashboard, click the green **"New Project"** button
2. Fill in the form:
   - **Organization**: Select your default org (it was created when you signed up). If none exists, create one with any name like "Personal"
   - **Project name**: Type `gravestone-finder`
   - **Database password**: Click **"Generate a password"** to auto-generate a strong password. **IMPORTANT: You do NOT need to save this password anywhere for our app** -- we use the anon key, not the database password directly. But if you want to save it somewhere safe just in case, you can.
   - **Region**: Pick the region closest to where the event will be held (e.g., "East US (N. Virginia)" for east coast US events)
   - **Plan**: Make sure **"Free"** is selected (it is by default)
3. Click **"Create new project"**
4. **Wait 1-2 minutes** while Supabase provisions your database. You'll see a loading screen. Don't close the tab.
5. When it finishes, you'll see your project dashboard with a "Welcome to your new project" page

---

## STEP 3: Get Your API Credentials

You need two values from the dashboard. Here's exactly where to find them:

1. In your project dashboard, look at the **left sidebar**
2. Click **"Settings"** (the gear icon near the bottom of the sidebar)
3. In the Settings page, click **"API"** in the left sub-menu (under "Configuration")
4. You are now on the **API Settings** page. You need two things from here:

### Value 1: Project URL
- Look for the section labeled **"Project URL"**
- It shows a URL that looks like: `https://abcdefghijklmnop.supabase.co`
- Click the **"Copy"** button next to it (clipboard icon)
- **Paste this somewhere temporarily** (notepad, sticky note, etc.) -- you'll need it in Step 5
- This is your `NEXT_PUBLIC_SUPABASE_URL`

### Value 2: Anon Public Key
- Scroll down slightly to the section labeled **"Project API keys"**
- You'll see two keys listed:
  - `anon` `public` -- this is the one you want
  - `service_role` `secret` -- DO NOT use this one
- Click the **"Copy"** button next to the **`anon public`** key
- It's a long string that starts with `eyJ...`
- **Paste this somewhere temporarily** too -- you'll need it in Step 5
- This is your `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

---

## STEP 4: Create the Database Table

The app needs a `flags` table in your database. Here's how to create it:

1. Go back to your project dashboard (click the Supabase logo or your project name at the top)
2. In the **left sidebar**, click **"SQL Editor"** (it has a terminal/code icon)
3. You'll see a blank SQL editor. Click **"New query"** if one isn't already open
4. **Copy the ENTIRE SQL block below** and paste it into the SQL editor:

```sql
-- flags table: core data from CSV import
create table public.flags (
  id bigint generated always as identity primary key,
  name text not null,
  row_label text not null,
  position integer not null,
  created_at timestamptz default now(),

  -- Composite unique constraint for merge/upsert and duplicate detection
  unique(row_label, position)
);

-- Full-text search support (for search feature)
alter table public.flags
add column fts tsvector generated always as (
  to_tsvector('english', name)
) stored;

-- GIN index for fast full-text search
create index flags_fts_idx on public.flags using gin (fts);

-- Index for directory queries (alphabetical and by-row)
create index flags_name_idx on public.flags (name);
create index flags_row_position_idx on public.flags (row_label, position);

-- RLS: Enable but allow all access (no auth needed for this app)
alter table public.flags enable row level security;

create policy "Allow public read" on public.flags
  for select using (true);

create policy "Allow public insert" on public.flags
  for insert with check (true);

create policy "Allow public delete" on public.flags
  for delete using (true);

create policy "Allow public update" on public.flags
  for update using (true);
```

5. Click the green **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
6. You should see a message like **"Success. No rows returned"** at the bottom -- this is correct! The SQL created a table, it doesn't return rows.
7. If you see an error instead, read the error message:
   - **"relation 'flags' already exists"** = the table was already created, you're fine, skip to verification
   - Anything else = copy the error and share it with me

---

## STEP 5: Verify the Table Was Created

1. In the **left sidebar**, click **"Table Editor"** (it has a grid/table icon)
2. You should see **`flags`** listed in the left panel under "Tables"
3. Click on **`flags`**
4. You should see these columns listed across the top:
   - `id` (int8)
   - `name` (text)
   - `row_label` (text)
   - `position` (int4)
   - `created_at` (timestamptz)
   - `fts` (tsvector)
5. The table will be empty (0 rows) -- that's correct. Data comes from CSV import later.

If you see all 6 columns, the database is ready.

---

## STEP 6: Create the .env.local File

Now connect the app to your Supabase project:

1. Open your project folder: `C:\Users\2fire\All Coding\gravestone finder`
2. Find the file called **`.env.local.example`**
3. **Make a copy** of this file in the same folder
4. **Rename the copy** to **`.env.local`** (remove the `.example` part)
   - In Windows File Explorer: right-click > Rename
   - Or in a terminal: `cp .env.local.example .env.local`
5. Open **`.env.local`** in any text editor (Notepad, VS Code, etc.)
6. It currently looks like this:
   ```
   # Supabase (get from Supabase Dashboard -> Settings -> API)
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```
7. Replace the placeholder values with your real credentials from Step 3:
   - Replace `your-project-url` with your Project URL (the `https://xxxxx.supabase.co` value)
   - Replace `your-anon-key` with your anon public key (the `eyJ...` value)
8. After editing, it should look something like this (your values will be different):
   ```
   # Supabase (get from Supabase Dashboard -> Settings -> API)
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxMjg2MDAwMCwiZXhwIjoxODcwNTQwMDAwfQ.xxxxxxxxxxxx
   ```
9. **Save the file** (Ctrl+S)

### IMPORTANT NOTES:
- Do NOT put quotes around the values
- Do NOT add spaces around the `=` sign
- Do NOT commit `.env.local` to git (it's already in `.gitignore`)
- The URL must start with `https://` and end with `.supabase.co`
- The key must start with `eyJ`

---

## STEP 7: Verify Everything Works

After completing all steps above, come back to Claude and type **"done"**.

I will then:
1. Check that `.env.local` exists and has real values
2. Continue with the remaining setup tasks (Vitest, test fixtures)
3. Complete Plan 01-01

---

## Troubleshooting

### "I can't find the API settings"
- Make sure you're in your project (not the org dashboard)
- Left sidebar > Settings (gear icon) > API (under Configuration)

### "The SQL editor shows an error"
- Make sure you copied ALL the SQL (from `-- flags table` to the last semicolon)
- Make sure you didn't accidentally paste it twice
- If it says "already exists", that's fine -- the table is already there

### "I don't see the flags table in Table Editor"
- Click the refresh button in the Table Editor
- Make sure you're looking at the correct project
- Try running this in SQL Editor: `SELECT * FROM public.flags;` -- if it returns an empty table, it exists

### ".env.local isn't working"
- Make sure the file is named exactly `.env.local` (not `.env.local.txt`)
- Make sure there are no quotes around values
- Make sure the URL starts with `https://`
- Restart the dev server after creating/editing `.env.local`
