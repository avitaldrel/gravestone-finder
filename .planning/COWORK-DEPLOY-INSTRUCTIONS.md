# Gravestone Finder — Online Deployment Setup

Give this file to Claude in Chrome. It contains everything needed to set up the app online so it's accessible from any device.

---

## What You're Setting Up

The Gravestone Finder is a Next.js web app that needs two online services:

1. **Supabase** — the database (PostgreSQL) that stores flag/veteran data
2. **Vercel** — the hosting platform that serves the website

Once both are set up and the GitHub repo is connected, every push to `main` auto-deploys to a public URL.

---

## What the App Expects

The app reads two environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhb...
```

These connect it to the Supabase database. They need to be set in both:
- `.env.local` (for local development)
- Vercel project settings (for production)

---

## Part 1: GitHub Repository

The code needs to be on GitHub so Vercel can pull from it.

1. Go to **github.com** > click **+** (top right) > **New repository**
2. Name: `gravestone-finder`
3. Keep it **Private** (or Public, your choice)
4. Do NOT initialize with README (the code already exists locally)
5. Click **Create repository**
6. GitHub shows push instructions. The user needs to run these in their terminal:
   ```
   git remote add origin https://github.com/USERNAME/gravestone-finder.git
   git branch -M main
   git push -u origin main
   ```
   (Replace USERNAME with their GitHub username)

**Check:** The repo on GitHub should show the project files including `package.json`, `src/`, etc.

---

## Part 2: Supabase (Database)

### 2A: Create the Project

1. Go to **supabase.com** > sign in (or sign up with GitHub)
2. Click **New Project**
3. Fill in:
   - **Organization**: use default or create "Personal"
   - **Project name**: `gravestone-finder`
   - **Database password**: click "Generate a password" (you won't need this password directly, but save it somewhere just in case)
   - **Region**: pick the closest region to the event location (e.g., East US)
   - **Plan**: Free
4. Click **Create new project**
5. Wait 1-2 minutes for provisioning

### 2B: Create the Database Table

1. In the Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Paste this entire SQL block and click **Run**:

```sql
-- flags table: core data from CSV import
create table public.flags (
  id bigint generated always as identity primary key,
  name text not null,
  row_label text not null,
  position integer not null,
  created_at timestamptz default now(),

  unique(row_label, position)
);

-- Full-text search support
alter table public.flags
add column fts tsvector generated always as (
  to_tsvector('english', name)
) stored;

-- Indexes for fast search and directory queries
create index flags_fts_idx on public.flags using gin (fts);
create index flags_name_idx on public.flags (name);
create index flags_row_position_idx on public.flags (row_label, position);

-- Row Level Security: public read/write (no auth needed for this app)
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

4. Should say "Success. No rows returned" — that's correct

### 2C: Verify the Table

1. Go to **Table Editor** (left sidebar)
2. Click **flags** in the table list
3. Confirm these columns exist: `id`, `name`, `row_label`, `position`, `created_at`, `fts`
4. Table will be empty (0 rows) — that's correct, data comes later via CSV import

### 2D: Get the API Credentials

1. Go to **Settings** (gear icon, left sidebar) > **API** (under Configuration)
2. Copy these two values:

| What to copy | Where it is | Looks like |
|---|---|---|
| **Project URL** | "Project URL" section | `https://abcdefg.supabase.co` |
| **Anon public key** | "Project API keys" > the `anon` `public` one | `eyJhbGci...` (long string) |

**Do NOT copy the `service_role` secret key.**

### 2E: Create .env.local

The user needs to create a file called `.env.local` in the project root with:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJYOUR-ANON-KEY-HERE
```

Replace the placeholder values with the real ones from step 2D. No quotes, no spaces around `=`.

A template already exists at `.env.local.example` — they can copy it and fill in the values.

---

## Part 3: Vercel (Hosting)

### 3A: Connect the Repo

1. Go to **vercel.com** > sign in with GitHub
2. Click **Add New...** > **Project**
3. Find and import the `gravestone-finder` repo
4. Vercel should auto-detect **Next.js** as the framework
5. **Before clicking Deploy**, expand **Environment Variables** and add:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | The Project URL from Supabase (same as .env.local) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The anon key from Supabase (same as .env.local) |

6. Click **Deploy**
7. Wait for the build to finish (2-3 minutes)
8. Vercel gives you a URL like `gravestone-finder.vercel.app` — this is the live site

### 3B: Verify Deployment

1. Visit the Vercel URL
2. The page should load without errors
3. If no flag data has been imported yet, it should show "Event setup in progress" — this is correct
4. Check the browser console (F12 > Console) for any errors about missing env vars

### 3C: Custom Domain (Optional)

If using a custom domain:
1. In Vercel, go to **Project Settings** > **Domains**
2. Add the domain
3. Update DNS records as Vercel instructs (usually a CNAME or A record)

---

## Part 4: Smoke Test Checklist

After all three parts are done, verify:

- [ ] GitHub repo has the latest code
- [ ] Supabase `flags` table exists with correct columns
- [ ] Supabase RLS is enabled with public read policy
- [ ] `.env.local` has real Supabase credentials locally
- [ ] Vercel has the same credentials in its environment variables
- [ ] Vercel deployment succeeded (green checkmark)
- [ ] The live URL loads without errors
- [ ] Pushing to `main` triggers a new Vercel deploy automatically

---

## Important Notes

- **Vercel free tier (Hobby)** is non-commercial only. If the event involves sponsors, ticket sales, or donations, upgrade to Pro ($20/mo).
- **Supabase free tier** pauses the database after 7 days of inactivity. Visit the dashboard or make a query at least once a week during the event prep window to keep it alive.
- **`.env.local` is gitignored** — it never gets committed. Each environment (local dev, Vercel) has its own copy of the credentials.
- **Production branch** should be `main`. Vercel auto-deploys on push to this branch.

---

## After Setup Is Done

The infrastructure is ready. When feature development finishes:

1. Merge all work into `main`
2. Push `main` to GitHub — Vercel auto-deploys
3. Import flag data via the app's CSV import feature (or manually through Supabase Table Editor)
4. Search for a veteran name on the live site to confirm everything works end-to-end
5. Share the URL with event organizers
