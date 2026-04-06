<!-- GSD:project-start source:PROJECT.md -->
## Project

**Gravestone Finder**

A web application for organizing and navigating memorial "Field of Flags" events — temporary displays where small flags are planted on a land plot, each representing a fallen veteran. Organizers use it to manage flag placement and track inventory. Family members use it to search by name and locate their loved one's flag via an interactive map or row/position directory.

**Core Value:** A family member can search a veteran's name and immediately find where their flag is planted — both on a visual map and as a human-readable location (row, position).

### Constraints

- **Timeline**: Event coming soon — need a working product quickly
- **Platform**: Web app only — must be responsive for mobile and desktop
- **Data simplicity**: Name-only flag records for v1
- **Scale**: Must handle 100+ flags without performance issues
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.x (latest 16.2.x) | Full-stack React framework | App Router gives you server components (fast initial load for visitors on phones at the event), API routes (no separate backend), and file-based routing. The standard choice for React apps in 2026. Supabase has first-class Next.js integration docs. |
| TypeScript | 5.x | Type safety | Catches data shape bugs at build time. Supabase generates types from your schema, making the flags/positions data pipeline type-safe end to end. Non-negotiable for any new project. |
| React | 19.x | UI framework | Ships with Next.js 16. Server Components reduce client bundle for visitor-facing search pages. |
| Tailwind CSS | 4.2.x (latest 4.2.2) | Styling | v4 is the current major. CSS-native config (no tailwind.config.js). 5x faster builds than v3. Mobile-first responsive utilities (`sm:`, `md:`) make the phone-at-event experience trivial to build. |
| shadcn/ui | latest (CLI 3.0) | UI components | Not a dependency -- copies accessible, Tailwind-styled components into your codebase. Built on Radix UI primitives. Tables, dialogs, search inputs, buttons ship WAI-ARIA compliant out of the box. Perfect for organizer CRUD forms and visitor search UI. |
| Supabase | Cloud (free tier) | Backend-as-a-Service: PostgreSQL database, auth, auto-generated REST API, real-time subscriptions | Eliminates building a backend. PostgreSQL gives you relational data (flags belong to events, positions in grids) with full-text search built in. Free tier: 500MB DB, 50K MAUs, 1GB storage -- more than enough for a flag event app. Auth included if you need organizer login. |
| Leaflet | 1.9.4 (stable) | Interactive visual map of the flag field | CRS.Simple mode lets you use a non-geographic coordinate system -- perfect for a custom field grid layout. Renders the flag field as a pannable, zoomable interactive map without needing geographic tiles. Free, open source, 42KB gzipped. Well-documented for exactly this "indoor map / floor plan" pattern. |
### Database
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Supabase (PostgreSQL 15+) | Managed cloud | Primary data store | Relational model fits naturally: `events` -> `flags` -> `positions`. PostgreSQL full-text search via `tsvector`/`tsquery` handles veteran name search without any external search service. GIN indexes make it fast. Auto-generated REST + JS client means zero API code to write for CRUD. |
### Infrastructure
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vercel | Pro ($20/mo) OR Hobby (if nonprofit/non-commercial) | Hosting & deployment | Native Next.js host. Zero-config deployment from Git. Edge network for fast loads on phones at the event. **Critical caveat:** Hobby plan is restricted to non-commercial use. If this event has any commercial aspect (sponsors, donations pages, ticket sales), you need Pro at $20/mo. If it's purely community/volunteer/nonprofit, Hobby is fine. |
| Supabase Cloud | Free tier | Database hosting, auth, API | Managed PostgreSQL with dashboard, auto-backups, and a web-based SQL editor. Free tier pauses after 7 days of inactivity -- fine for an event app where you'll be actively using it during the build and event period. |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase/supabase-js | 2.99.x | Supabase client SDK | Always. Core data access layer. Typed queries, auth, real-time subscriptions. |
| @supabase/ssr | 0.10.x | Server-side Supabase client for Next.js | Always. Creates Supabase client in server components and API routes. Cookie-based auth for SSR. Replaces deprecated auth-helpers. |
| react-leaflet | 5.0.0 | React bindings for Leaflet | For the interactive field map component. Requires dynamic import with `ssr: false` in Next.js (Leaflet needs `window`). v5 supports React 19. |
| react-hook-form | 7.72.x | Form handling | Organizer CRUD forms (add/edit/remove flags, define field layout). Lightweight, uncontrolled components, minimal re-renders. |
| zod | 4.3.x | Schema validation | Validate flag data (name required, position within grid bounds) on both client and server. Integrates with react-hook-form via `@hookform/resolvers`. |
| zustand | 5.0.x | Client state management | Only if search/filter state becomes complex. For v1, React state + URL params likely sufficient. Add zustand if you need cross-component state (e.g., map selection synced with search results). |
| @hookform/resolvers | latest | Connect zod schemas to react-hook-form | Whenever using react-hook-form + zod together. |
| lucide-react | latest | Icons | Clean, tree-shakeable icon set. Used by shadcn/ui. |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Linting | Ships with `create-next-app`. Use Next.js recommended config. |
| Prettier | Code formatting | Pair with `prettier-plugin-tailwindcss` to auto-sort class names. |
| Supabase CLI | Local dev, migrations | `supabase init` + `supabase start` gives you a local PostgreSQL + dashboard. Write migrations as SQL files, push to cloud with `supabase db push`. |
## Installation
# Create Next.js project with TypeScript, Tailwind CSS, ESLint, App Router
# Core dependencies
# Leaflet types (TypeScript support)
# shadcn/ui initialization (installs Radix primitives as needed)
# Add specific shadcn components as needed
# Dev tools
# Supabase CLI (global)
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js | Vite + React Router | If you want a pure SPA with no SSR. Faster dev server boot, but you lose server components, API routes, and SEO benefits of SSR. For this project, the search page benefits from SSR (shareability, speed on phone). |
| Supabase | Firebase | If you need real-time sync as the primary feature (Firebase Realtime DB is unmatched). For this project, PostgreSQL's relational model and full-text search are more valuable than Firebase's NoSQL + real-time. Also, Supabase is open-source with no vendor lock-in. |
| Supabase | SQLite (Turso) + custom API | If you want zero ongoing cost and can self-host. More work to set up, no built-in auth/dashboard. Not worth the speed tradeoff for this timeline. |
| Leaflet | Mapbox GL JS | If you need vector tiles, 3D terrain, or custom-branded map styles. Overkill for a field grid layout. Mapbox requires an API key and has usage-based pricing. Leaflet's CRS.Simple does exactly what we need for free. |
| Leaflet | Pure CSS/SVG grid | If the field is very simple (< 20 flags in a single row). For 100+ flags in a grid with pan/zoom, Leaflet's CRS.Simple gives you that interactivity for free. A custom SVG solution would need to reimplement pan, zoom, touch gestures -- not worth it. |
| Tailwind CSS | CSS Modules | If the team strongly prefers traditional CSS. Tailwind's utility-first approach is faster for rapid prototyping and responsive design, which matches this project's timeline pressure. |
| shadcn/ui | Material UI (MUI) | If you want a more opinionated design system with less customization. MUI adds 80KB+ to bundle. shadcn/ui adds 0KB runtime (it's your code). For a fast, lightweight event app on phones, bundle size matters. |
| Vercel | Cloudflare Pages | If you want to avoid Vercel's commercial restriction without paying. Cloudflare supports Next.js via Workers/Pages, has unlimited bandwidth on free tier. Tradeoff: some Next.js features may not work (middleware, ISR edge cases). More configuration needed. Consider this if $20/mo for Vercel Pro is a hard no. |
| react-hook-form | Formik | If you're already familiar with Formik. react-hook-form is lighter (9KB vs 13KB), faster (uncontrolled inputs), and the current community standard. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Google Maps API | Requires API key, usage-based pricing, and is designed for geographic maps. Your field grid is not a geographic location -- it's a custom layout. | Leaflet with CRS.Simple for non-geographic grid map |
| Redux / Redux Toolkit | 15KB+ bundle, boilerplate-heavy, overkill for an app with simple state (search query, selected flag, form state). | React state + URL params for v1; zustand if complexity grows |
| Prisma ORM | Adds a build step, schema file, migration system on top of Supabase's already-managed database. Double abstraction. Supabase's JS client already provides typed queries. | @supabase/supabase-js direct queries |
| MongoDB / Mongoose | NoSQL is wrong for this domain. Flags have positions in grids in events -- this is relational data. You'd fight the data model instead of leveraging it. | PostgreSQL via Supabase |
| Expo / React Native | The project spec says web-only. A native app adds app store friction, slower development, and is unnecessary when a responsive web app works on all devices. | Next.js responsive web app |
| @supabase/auth-helpers-nextjs | Deprecated. Consolidated into @supabase/ssr. Using the old package means no updates and eventual breakage. | @supabase/ssr |
| Leaflet 2.0 alpha | Released as 2.0.0-alpha.1 in Aug 2025. Breaking changes (ESM-only, no global L, Pointer Events). Not production-ready. | Leaflet 1.9.4 (stable) |
| create-react-app (CRA) | Officially deprecated. No longer maintained. | Next.js (or Vite for SPA) |
## Stack Patterns by Variant
- Use Vercel Hobby (free) for hosting
- Use Supabase free tier for database
- Total cost: $0/month
- Caveat: Supabase pauses after 7 days inactivity; Vercel restricts commercial use
- Use Vercel Pro ($20/mo) for hosting
- Use Supabase free tier (upgrade to Pro $25/mo only if you exceed 500MB or need no-pause)
- Total cost: $20-45/month
- Use Cloudflare Pages (free, allows commercial) for hosting
- Use Supabase free tier for database
- Tradeoff: More deployment configuration, potential Next.js feature gaps on Cloudflare
- Enable Supabase Realtime subscriptions on the `flags` table
- Visitors' search results and map update live without page refresh
- No additional cost on free tier
## Version Compatibility
| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.x | React 19.x | Next.js 16 requires React 19. Ships together via create-next-app. |
| react-leaflet 5.0.0 | React 19.x, Leaflet 1.9.x | v5 requires React 19 as peer dependency. Leaflet 1.9.4 is the compatible stable version. |
| Tailwind CSS 4.2.x | Next.js 16.x | create-next-app sets up Tailwind v4 automatically. CSS-native config, no JS config file. |
| shadcn/ui (CLI 3.0) | Tailwind CSS 4.x, React 19.x | shadcn/ui has explicit Tailwind v4 support page. Components generated with v4 classes. |
| @supabase/ssr 0.10.x | @supabase/supabase-js 2.99.x, Next.js 16.x | @supabase/ssr uses supabase-js under the hood. Follow Supabase's Next.js quickstart for correct cookie setup with App Router. |
| zod 4.3.x | @hookform/resolvers latest | Verify @hookform/resolvers supports zod v4. If not, use zod 3.x (3.23.x) which is guaranteed compatible. **Flag for validation.** |
| react-hook-form 7.72.x | React 19.x | Actively maintained, recent releases confirm React 19 compatibility. |
## Confidence Assessment
| Decision | Confidence | Rationale |
|----------|------------|-----------|
| Next.js as framework | HIGH | Industry standard for React in 2026. Official Supabase integration. Verified current version 16.2.x via multiple sources. |
| Supabase as backend | HIGH | Perfect fit: relational data, full-text search, built-in auth, auto-generated API. Verified free tier limits and PostgreSQL search capabilities via official docs. |
| Leaflet with CRS.Simple | HIGH | Documented pattern for non-geographic maps (floor plans, indoor maps, game maps). Exactly matches the "flag field grid" use case. Verified via official Leaflet tutorial. |
| Tailwind CSS v4 | HIGH | Ships with create-next-app. Verified v4.2.2 is current stable. |
| shadcn/ui | HIGH | Most-starred React UI library. Verified Next.js App Router + Tailwind v4 compatibility. |
| Vercel hosting | MEDIUM | Best DX for Next.js, but non-commercial restriction on free tier requires understanding the event's commercial status. Verified restriction via official docs. |
| zod v4 + react-hook-form | MEDIUM | Both libraries verified individually. zod v4 was a major release (July 2025) -- need to confirm @hookform/resolvers compatibility. Fallback to zod 3.23.x is safe. |
| react-leaflet v5 | MEDIUM | Works with React 19, but requires dynamic import (ssr: false) in Next.js. Well-documented workaround but adds complexity. Alternative: use vanilla Leaflet directly in a client component. |
## Sources
- [Next.js 16 announcement](https://nextjs.org/blog/next-16) -- confirmed v16 current major, v16.2.x latest (HIGH confidence)
- [Next.js end-of-life tracker](https://endoflife.date/nextjs) -- version timeline verified
- [Leaflet official non-geographic maps tutorial](https://leafletjs.com/examples/crs-simple/crs-simple.html) -- CRS.Simple pattern confirmed (HIGH confidence)
- [Leaflet releases](https://github.com/leaflet/leaflet/releases) -- 1.9.4 stable, 2.0.0-alpha.1 pre-release (HIGH confidence)
- [react-leaflet npm](https://www.npmjs.com/package/react-leaflet) -- v5.0.0, React 19 peer dependency (HIGH confidence)
- [Supabase full-text search docs](https://supabase.com/docs/guides/database/full-text-search) -- PostgreSQL tsvector/tsquery capabilities (HIGH confidence)
- [Supabase pricing](https://supabase.com/docs/guides/platform/billing-on-supabase) -- free tier limits verified (HIGH confidence)
- [Supabase Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) -- @supabase/ssr integration pattern (HIGH confidence)
- [@supabase/supabase-js npm](https://www.npmjs.com/package/@supabase/supabase-js) -- v2.99.3 confirmed (HIGH confidence)
- [@supabase/ssr npm](https://www.npmjs.com/package/@supabase/ssr) -- v0.10.0 confirmed (HIGH confidence)
- [Tailwind CSS v4 blog](https://tailwindcss.com/blog/tailwindcss-v4) -- v4.2.2 latest confirmed (HIGH confidence)
- [shadcn/ui Tailwind v4 guide](https://ui.shadcn.com/docs/tailwind-v4) -- compatibility confirmed (HIGH confidence)
- [Vercel Hobby plan docs](https://vercel.com/docs/plans/hobby) -- non-commercial restriction confirmed (HIGH confidence)
- [Vercel pricing](https://vercel.com/pricing) -- Pro at $20/mo confirmed (HIGH confidence)
- [react-hook-form npm](https://www.npmjs.com/package/react-hook-form) -- v7.72.1 confirmed (HIGH confidence)
- [zod npm](https://www.npmjs.com/package/zod) -- v4.3.6 confirmed (HIGH confidence)
- [zustand npm](https://www.npmjs.com/package/zustand) -- v5.0.12 confirmed (HIGH confidence)
- [React Leaflet on Next.js 15 App Router](https://xxlsteve.net/blog/react-leaflet-on-next-15/) -- SSR workaround pattern documented (MEDIUM confidence, community source)
- [LINE Engineering floor map with Leaflet](https://engineering.linecorp.com/en/blog/floor-map-management-system-on-web-with-leaflet) -- real-world non-geographic Leaflet case study (MEDIUM confidence)
- [State Management in 2026 comparison](https://dev.to/jsgurujobs/state-management-in-2026-zustand-vs-jotai-vs-redux-toolkit-vs-signals-2gge) -- zustand recommendation context (MEDIUM confidence)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
