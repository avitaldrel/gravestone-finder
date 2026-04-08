# Phase 1: Organizer Core - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Dashboard for field layout definition and flag CRUD with position validation, on a data model ready for future multi-event expansion. No authentication — organizer pages are publicly accessible.

Requirements: FIELD-01, FIELD-02, FIELD-03, FIELD-04, FIELD-05, PLAT-03
Removed: ORG-01 (authentication explicitly removed by user)

</domain>

<decisions>
## Implementation Decisions

### Authentication
- **D-01:** No authentication — remove entirely. Organizer dashboard is open to anyone with the URL. No login, no passphrase, no credentials.

### Field Layout Definition
- **D-02:** Variable rows — organizer adds rows one at a time, each with its own position count. Handles irregular field shapes (e.g., Row 1: 12, Row 2: 15, Row 3: 10).
- **D-03:** Row labels are numbers (1, 2, 3...), not letters. Scales beyond 26 without awkward naming.
- **D-04:** Layout is editable after flags are placed — organizer can add/remove rows and change position counts, with warnings if changes would displace existing flags.

### Flag Management
- **D-05:** Table with inline editing — spreadsheet-like table showing Name, Row, Position, and action buttons (Edit, Delete). Click to edit cells inline.
- **D-06:** Position selection via dropdowns (pick row, then available position) with option to type row/position numbers directly. Show only open positions in dropdowns.
- **D-07:** Duplicate position conflict shown as inline error on save — red text below position field: "Position Row 3, #7 is already assigned to [Name]." Blocks save until resolved.

### Dashboard Structure
- **D-08:** Single page with sections — field layout setup at top, flag management table below. No tabs, no sidebar, no multi-page navigation.
- **D-09:** Fancy, polished UI — visually impressive design, not utilitarian or minimal.

### Claude's Discretion
- Stats summary (total flags, open positions, fill percentage) — include if it fits naturally
- Exact spacing, typography, and color palette within the "fancy UI" direction
- Loading states and transitions
- Mobile responsive behavior for the single-page layout

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and in `.planning/REQUIREMENTS.md`.

### Project-level references
- `.planning/REQUIREMENTS.md` — FIELD-01 through FIELD-05, ORG-01 (removed), PLAT-03 definitions
- `.planning/PROJECT.md` — Core value, constraints, timeline pressure
- `.planning/ROADMAP.md` — Phase 1 success criteria and dependency info

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no code exists yet

### Established Patterns
- None — patterns will be established in this phase (first phase)

### Integration Points
- Supabase database — data model for events, rows, positions, flags (per CLAUDE.md stack)
- Next.js App Router — file-based routing for dashboard page
- shadcn/ui — table, form, button, input components
- Tailwind CSS v4 — styling

</code_context>

<specifics>
## Specific Ideas

- User expects most flag data to come via CSV spreadsheet import (Phase 2), so manual add is secondary — but dropdowns and typing should both work for one-off additions
- "Fancy UI" — polished, visually impressive, not a plain utility dashboard

</specifics>

<deferred>
## Deferred Ideas

- CSV/spreadsheet bulk import — Phase 2
- Authentication / organizer login — explicitly removed, not deferred

</deferred>

---

*Phase: 01-organizer-core*
*Context gathered: 2026-04-07*
