# Project Research Summary

**Project:** Gravestone Finder / Memorial Flag Event Management App
**Domain:** Memorial flag event management with interactive grid map and visitor name search
**Researched:** 2026-04-06
**Confidence:** HIGH (stack + architecture); MEDIUM (features — niche domain with no direct competitors)

## Executive Summary

This is a niche event-day utility app with no direct digital competitors. Every Field of Flags / Healing Field / Field of Honor event researched currently manages visitor navigation with a physical binder at an information booth — no digital equivalent exists. The app's core value proposition is a name-search-to-grid-map experience that lets visitors on their phones find their veteran's flag without waiting for volunteer assistance. The closest analogues are cemetery management software (Chronicle, Cemify) and event seating chart tools (MapD, SeatMap), which establish the UX baseline: search by name, get a human-readable location label, see a highlighted position on a visual map.

The recommended approach is a Next.js 16 + Supabase + SVG grid stack. The visitor experience is a public, no-auth search page that loads all flag data client-side at page load (~5-10KB for 100 flags) and performs instant fuzzy matching in the browser. The organizer experience is an auth-gated CRUD dashboard behind Supabase Auth. The "map" is not a geographic map — it is an SVG grid rendered with `viewBox` scaling, not Leaflet, Mapbox, or any tile-based system. This is the most important architectural decision and the most common source of over-engineering in comparable projects.

The critical risk on event day is threefold: (1) visitors in a field with poor cellular coverage need the app to work offline after first load, (2) the digital grid must precisely match the physical flag layout or search results send families to the wrong flag, and (3) the UI must be readable in direct sunlight. All three risks are preventable at architecture time — they are painful to retrofit. Client-side search, explicit grid orientation setup, high-contrast UI, and a print-ready PDF backup are not polish features; they are core requirements for event-day reliability.

## Key Findings

### Recommended Stack

Next.js 16 (App Router) with Supabase as the backend-as-a-service is the clear recommendation. Supabase provides PostgreSQL (relational model fits events -> flags -> positions naturally), built-in auth for organizers, auto-generated REST API, and a free tier sufficient for this scale. No separate backend is needed. Tailwind CSS v4 and shadcn/ui handle the UI layer with accessible, mobile-first components. The interactive field map uses a custom SVG component — not a map library — because the field grid is a logical coordinate system, not a geographic location.

**Core technologies:**
- **Next.js 16.x (App Router):** Full-stack React framework — server components for fast visitor page loads, API routes for CRUD, file-based routing; first-class Supabase integration
- **Supabase (PostgreSQL 15+):** Backend-as-a-Service — eliminates backend buildout; relational model, full-text search via tsvector, built-in auth, RLS for public-read / auth-write; free tier covers the entire project
- **SVG grid (custom component):** Interactive field map — viewBox scaling for responsiveness; DOM-accessible elements for click/highlight; zero dependencies; right choice at ~100 flag scale
- **Tailwind CSS 4.2.x:** Styling — mobile-first responsive utilities; CSS-native config; ships with create-next-app
- **shadcn/ui (CLI 3.0):** UI components — accessible, Tailwind-styled, zero runtime bundle; Radix UI primitives for dialogs, tables, search inputs
- **react-hook-form 7.72.x + zod 4.3.x:** Form handling + validation — typed form state for organizer CRUD; validate positions within grid bounds on both client and server
- **Vercel:** Hosting — native Next.js host; edge network for fast phone loads; Hobby (free, non-commercial) or Pro ($20/mo if any commercial aspect)

**Critical version notes:**
- Use Leaflet 1.9.4 (stable) if map library is chosen — NOT 2.0.0-alpha (ESM-only, breaking changes)
- Use @supabase/ssr 0.10.x — NOT deprecated @supabase/auth-helpers-nextjs
- Confirm @hookform/resolvers supports zod v4 before using; fallback to zod 3.23.x is safe

### Expected Features

No direct digital competitors exist. Feature scope is informed by cemetery management software UX and event seating chart tools applied to the memorial flag domain.

**Must have (table stakes — v1):**
- Visitor name search (the core value proposition — without this, the app has no purpose)
- Search result shows row/position as human-readable text ("Row B, Position 7")
- Visual SVG grid map with searched flag highlighted
- Organizer CRUD: add, edit, remove flags
- Field layout definition (rows + positions per row — required before any flag can be placed)
- Organizer auth protecting write operations (visitors need no login)
- Mobile-responsive layout (phones are the primary device on-site)
- Empathetic "not found" state with fallback guidance (never a blank page)

**Should have (differentiators — v1.x after validation):**
- Fuzzy / typo-tolerant name search (veteran names are unusual; exact match creates support burden)
- Position conflict detection (two flags in the same spot is a setup disaster)
- Print-ready flag directory (physical backup and current organizer workflow)
- QR code per flag (deep-links visitor directly to the flag record, bypassing search)
- Bulk CSV import (most organizers already have a spreadsheet; one-by-one entry is painful for 100+ flags)

**Defer (v2+):**
- Field overview / occupancy visualization (overkill below ~500 flags)
- Multi-event management UI (add when second annual event is being planned; data model is future-ready via event_id)
- Veteran notes / profile fields (multiplies scope with unclear event-day value)
- PWA / offline service worker (defer only if venue connectivity is confirmed; do not defer client-side search)
- Social sharing, volunteer scheduling, payment tracking — entirely different problem domains; out of scope

### Architecture Approach

The architecture splits cleanly into two route groups: a public visitor-facing search + map view and an auth-gated organizer dashboard. The same SVG FieldGrid component serves both, with an `editable` prop enabling/disabling interaction modes. Security is enforced by Supabase Row-Level Security at the database level (not just the component prop). Visitor search is entirely client-side: all flag data is loaded once on page mount and fuzzy-matched in the browser with zero server round-trips. The layout configuration (grid dimensions, row labels, sections) is stored as JSONB in a single field_layouts table row — not normalized — because it is always read/written as a unit and will evolve. Organizer mutations go through Next.js Server Actions, which call Supabase with auth context and revalidate the Next.js cache so visitors see updated data within seconds.

**Major components:**
1. **FieldGrid (SVG)** — Core visual renderer; viewBox scaling for responsiveness; receives `flags`, `layout`, and `highlightId` as props; pure rendering, no internal data fetching
2. **SearchBar + useSearch hook** — Debounced input; client-side fuzzy match against preloaded flag array; returns sorted results with scores; zero network latency
3. **Organizer dashboard** — Auth-gated CRUD (add/edit/remove flags, define grid layout); uses Server Actions for mutations; FlagForm with react-hook-form + zod validation
4. **Supabase RLS** — Enforces public read / authenticated write at the database level; auth middleware protects the organizer route group at the Next.js level too
5. **Layout config (JSONB)** — Stores grid dimensions, section definitions, row/position label prefixes; consumed by FieldGrid; updated by organizer through layout editor

**Data model:**
- `events` table (future-ready; even v1 with one event should use event_id)
- `field_layouts` table with JSONB `config` column (one per event)
- `flags` table with `UNIQUE(event_id, row, position)` constraint enforcing no duplicate positions
- Supabase Auth manages organizer credentials via `auth.users`

### Critical Pitfalls

1. **Map-to-field position mismatch** — The digital grid must match the physical field exactly. Prevent by forcing the organizer to declare grid origin and numbering direction during setup ("Row 1 starts at the parking lot; positions increase left to right"). Include physical landmarks on the grid map. Build a verification step where the organizer spot-checks positions before going live. This is a Phase 1 concern — retrofitting it after data is entered causes cascading errors.

2. **No offline fallback on event day** — Visitors are outdoors in a field with poor cellular coverage. Client-side search (all flags preloaded in browser memory) is non-negotiable. The app must work in airplane mode after first load. Do not defer this — it must be a foundational architecture decision. A printed PDF backup (alphabetical name-to-position list) is essential disaster recovery even with offline support.

3. **Sunlight-unreadable UI** — Development happens indoors; event day is outdoors in direct sunlight. Enforce WCAG AAA contrast (7:1 minimum), not just AA. The row/position result text must be at least 24px. The highlighted flag marker must be dramatically different (3x larger, pulsing animation, high-contrast border). Test on a physical phone outside before launch — no browser devtools substitute.

4. **Search failing on name variations** — "Bobby" vs "Robert J.", "MacDonald" vs "Mcdonald", "O'Brien" (apostrophe), "Smth" (typo in sunlight). Exact-match search creates a support burden and emotionally damaging "not found" results for grieving family members. Implement fuzzy search from day one — at 100 records, client-side Levenshtein/Fuse.js is trivially fast. The empty state must be empathetic, never just "No results found."

5. **Data entry chaos under time pressure** — Data is entered the night before or morning of the event, often by multiple volunteers. The `UNIQUE(event_id, row, position)` database constraint is essential, but also surface duplicate errors immediately in the UI. Provide bulk CSV import for initial data load. Include an audit view showing the grid with filled/empty positions so the organizer can verify completeness before going live.

## Implications for Roadmap

Based on combined research, the dependency chain is: field layout definition → flag CRUD → visitor search → SVG map → layout editor (visual). This directly maps to a 5-phase structure.

### Phase 1: Foundation + Organizer Core
**Rationale:** Nothing else works until data can be entered. Layout must be defined before flags can be placed. Flags must exist before they can be searched. Auth must be in place before CRUD is exposed. Pitfall prevention for data entry chaos and position mismatch must be built here — not retrofitted.
**Delivers:** Working organizer dashboard with auth; field layout definition (rows, positions, orientation description); flag CRUD with duplicate position validation; basic flag list/table view
**Addresses:** All P1 organizer features from FEATURES.md; multi-event future-readiness via event_id; print-ready directory (essential backup)
**Avoids:** Pitfalls 1 (position mismatch — orientation setup is here), 5 (data entry chaos — validation + CSV import foundation here)

### Phase 2: Visitor Search Experience
**Rationale:** Requires flag data from Phase 1 to exist. Client-side search is the core value proposition and must be built offline-capable from the start — loading all flags at page mount is a foundational decision. This phase also establishes the high-contrast, sunlight-readable visual design.
**Delivers:** Public visitor search page (no auth required); client-side fuzzy name matching; search results with row/position text; empathetic "not found" state; mobile-responsive layout meeting WCAG AAA contrast
**Addresses:** All P1 visitor features; offline resilience (flags cached in browser); empathetic UX for emotionally charged context
**Avoids:** Pitfalls 2 (offline/connectivity), 3 (sunlight readability), 4 (search failing on name variations)

### Phase 3: Interactive SVG Grid Map
**Rationale:** The visual map depends on search results to be meaningful (it highlights a specific flag). Build after search is working so the integration is straightforward — search sets highlightId, map responds. SVG approach is confirmed by architecture research as the correct choice at this scale.
**Delivers:** SVG FieldGrid component with viewBox scaling; FlagMarker components; highlighted/pulsing marker for search result; auto-centering to searched flag on mobile; row labels and at least one physical landmark for orientation
**Uses:** SVG (custom, no external map library), react-leaflet explicitly NOT used for the grid
**Implements:** FieldGrid, FlagMarker, MapHighlight architecture components
**Avoids:** Pitfall 6 (map frustrates instead of helps — auto-zoom, dramatic highlight, landmark orientation)

### Phase 4: Organizer Enhancements + Polish
**Rationale:** Once the core visitor + organizer flows work end-to-end, add the differentiator features that make the organizer workflow efficient at scale. These are v1.x features per FEATURES.md — add after validating the core.
**Delivers:** Bulk CSV import with validation preview; position conflict detection in UI (supplement to DB constraint); print-ready directory export (PDF/browser print); QR code generation per flag; organizer mobile panel for real-time event-day corrections
**Addresses:** All P2 features from FEATURES.md

### Phase 5: Visual Layout Editor + Deploy
**Rationale:** The visual grid editor is an enhancement to the layout definition built in Phase 1. Organizers can define their grid via simple form inputs in Phase 1; the visual editor provides a better experience but is not a prerequisite. Deploy to Vercel at end of this phase.
**Delivers:** Visual GridEditor with live FieldGrid preview; section definition UI; row/position label configuration; Vercel production deployment; outdoor phone testing and final contrast audit
**Addresses:** P3 field overview; deployment; final validation of all pitfall checklists

### Phase Ordering Rationale

- Layout definition must precede flag CRUD (you cannot assign a flag to a row that does not exist)
- Flag CRUD must precede search (search has nothing to return without data)
- Search must precede the map (the map highlights a search result; it is not standalone navigation)
- The layout editor (visual) is an enhancement to Phase 1's form-based layout definition — it comes last because it depends on the grid renderer being mature
- Client-side search and offline resilience are Phase 2 foundational decisions, not Phase 4 polish — this is the most important ordering constraint from PITFALLS.md
- High-contrast UI is a Phase 2 design constraint, not a Phase 5 polish pass

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (SVG Grid Map):** SVG interaction patterns for dense grids on mobile touch (pan conflict with tap-to-select), auto-zoom/center implementation, accessible flag markers for screen readers
- **Phase 4 (CSV Import):** CSV parsing edge cases (BOM characters, encoding, delimiter variants, name normalization), preview-before-commit UX pattern

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Next.js + Supabase setup is extremely well-documented; Supabase auth with App Router has an official quickstart; CRUD with Server Actions is established pattern
- **Phase 2 (Visitor Search):** Client-side fuzzy search with Fuse.js or custom Levenshtein is well-documented; Next.js ISR caching is standard
- **Phase 5 (Deploy):** Vercel deployment from Git is zero-config for Next.js; no research needed

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All primary technologies verified via official docs and npm. Version compatibility confirmed. One flag: @hookform/resolvers + zod v4 compatibility needs validation during Phase 1 setup. |
| Features | MEDIUM | No direct competitors exist. Feature set inferred from cemetery software, event seating tools, and analysis of current analog (physical binder) workflows. Core features are clear; differentiators are well-reasoned but unvalidated with actual organizers. |
| Architecture | HIGH | SVG grid, client-side search, dual route group pattern, and Supabase RLS are all established patterns. Build order based on component dependencies is reliable. No architectural unknowns for v1 scope. |
| Pitfalls | HIGH | Strong pattern convergence from cemetery apps, outdoor event apps, stadium seating tools, and wayfinding UX research. All 6 critical pitfalls have confirmed prevention strategies. |

**Overall confidence:** HIGH for the technical approach; MEDIUM for feature scope (niche domain, no prior art to validate against).

### Gaps to Address

- **Organizer interview gap:** No actual Field of Flags organizer was consulted. All feature priorities are inferred from analog workflows and adjacent domains. Validate the CSV import assumption (do organizers actually have a spreadsheet?) and the print directory assumption (is the physical binder still used?) before building Phase 4.
- **Venue connectivity:** The offline-first architecture recommendation assumes poor cellular coverage. If the specific event venue has confirmed strong WiFi or cellular, the service worker requirement is downgraded — but client-side search remains mandatory regardless.
- **Field size:** Research assumed ~100 flags. SVG performance is fine up to ~500 flags. If the event has significantly more flags, revisit the SVG approach and consider Canvas rendering.
- **Vercel commercial status:** Vercel Hobby plan restricts commercial use. The event's commercial status (sponsors, donations, ticket revenue) must be clarified before deploying — determines Hobby vs. Pro ($20/mo).
- **zod v4 + @hookform/resolvers compatibility:** zod v4 was a major release (July 2025). Verify @hookform/resolvers supports it before Phase 1 setup; fallback to zod 3.23.x is safe.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 announcement](https://nextjs.org/blog/next-16) — framework version, App Router, server components
- [Supabase Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) — @supabase/ssr integration pattern
- [Supabase full-text search docs](https://supabase.com/docs/guides/database/full-text-search) — PostgreSQL tsvector/tsquery capabilities
- [Leaflet non-geographic maps tutorial](https://leafletjs.com/examples/crs-simple/crs-simple.html) — CRS.Simple pattern (confirmed NOT needed for SVG approach)
- [Tailwind CSS v4 blog](https://tailwindcss.com/blog/tailwindcss-v4) — v4.2.2 current stable confirmed
- [shadcn/ui Tailwind v4 guide](https://ui.shadcn.com/docs/tailwind-v4) — compatibility confirmed
- [Vercel Hobby plan docs](https://vercel.com/docs/plans/hobby) — non-commercial restriction confirmed
- [Supabase pricing](https://supabase.com/docs/guides/platform/billing-on-supabase) — free tier limits verified
- [react-hook-form npm](https://www.npmjs.com/package/react-hook-form) — v7.72.1 confirmed
- [zod npm](https://www.npmjs.com/package/zod) — v4.3.6 confirmed

### Secondary (MEDIUM confidence)
- Chronicle / Cemify / PlotBox cemetery software — search-by-name + interactive plot map UX baseline
- MapD / SeatMap event seating tools — guest name search → visual floor plan pattern
- Colonial Flag Foundation / healingfield.org — physical binder + volunteer navigation patterns (multiple real events)
- [Sunlight Susceptible Screens UX](https://medium.com/@callumjcoe/industrial-ux-sunlight-susceptible-screens-2e52b1d9706b) — outdoor readability design patterns
- [SeatGeek Canvas Map Performance](https://chairnerd.seatgeek.com/high-performance-map-interactions-using-html5-canvas/) — SVG vs Canvas decision at scale
- [MDN: PWA Offline Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation) — service worker and caching patterns
- [Fuzzy Name Matching in PostgreSQL](https://www.crunchydata.com/blog/fuzzy-name-matching-in-postgresql) — fuzzy search implementation patterns
- [Designing for High-Traffic Events](https://www.smashingmagazine.com/2025/01/designing-high-traffic-events-cloudways/) — event-day traffic spike handling

### Tertiary (LOW confidence — needs validation)
- State Management in 2026 comparison — zustand recommendation context (community source)
- React Leaflet on Next.js 15 App Router SSR workaround — community blog post

---
*Research completed: 2026-04-06*
*Ready for roadmap: yes*
