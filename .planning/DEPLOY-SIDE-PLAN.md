# Deployment Side Plan

**Purpose:** Set up all online infrastructure in parallel with feature development so the app is ready to deploy the moment code is complete.

**Who runs this:** A separate Claude Code cowork session (or the developer manually).

---

## Prerequisites

- GitHub repo pushed to remote (the developer does this)
- Supabase account created (see `SUPABASE-SETUP-GUIDE.md` at repo root)

---

## Tasks

### 1. Supabase Project Setup

- [ ] Create Supabase project (name: `gravestone-finder`, free tier)
- [ ] Copy **Project URL** and **anon public key** from Settings > API
- [ ] Create `.env.local` with:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
  ```
- [ ] Run the database migration to create tables. The SQL lives in:
  - `supabase/migrations/` (if using Supabase CLI)
  - Or paste into Supabase Dashboard > SQL Editor from the schema in the codebase
- [ ] Verify tables exist: `events`, `flags` (check Dashboard > Table Editor)
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Add RLS policy: allow anonymous `SELECT` on `flags` and `events` (visitors need read access)

### 2. Vercel Project Setup

- [ ] Go to [vercel.com](https://vercel.com), sign in with GitHub
- [ ] Click "Add New Project" > Import the `gravestone-finder` repo
- [ ] Set Framework Preset to **Next.js** (should auto-detect)
- [ ] Add environment variables in Vercel project settings:
  - `NEXT_PUBLIC_SUPABASE_URL` — same value as `.env.local`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same value as `.env.local`
- [ ] Set the production branch to `main`
- [ ] Deploy once to verify the build succeeds (even if features are incomplete)
- [ ] Note the production URL (e.g., `gravestone-finder.vercel.app`)

### 3. Domain (Optional)

- [ ] If using a custom domain, add it in Vercel > Project > Settings > Domains
- [ ] Update DNS records as Vercel instructs

### 4. Smoke Test

- [ ] Visit the deployed URL — confirm the page loads without errors
- [ ] Check browser console for missing env var warnings
- [ ] Confirm Supabase connection works (search page should show "Event setup in progress" if no flags imported, not an error)

---

## After Feature Development Is Done

Once all phases are merged to `main`:

1. Push `main` to remote — Vercel auto-deploys
2. Import flag data via CSV into Supabase (through the app's import flow or Supabase Dashboard)
3. Final smoke test: search for a veteran name, verify result card shows row/position
4. Share the URL with event organizers

---

## Notes

- Vercel Hobby plan is **non-commercial only**. If the event has sponsors, ticket sales, or donations, upgrade to Pro ($20/mo).
- Supabase free tier pauses after 7 days of inactivity. Keep it active during the event prep window by visiting the dashboard or making queries.
- The `.env.local` file is gitignored — each developer and Vercel have their own copy of the secrets.
