# Phase 1: Data Foundation - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Organizers can import flag data from a CSV/Excel file, see validation feedback, and generate a printable directory — establishing the data layer that all visitor-facing features build on. No auth, no in-app CRUD. The spreadsheet is the source of truth.

</domain>

<decisions>
## Implementation Decisions

### Import Experience
- **D-01:** Drag-and-drop upload zone with file picker fallback. Large visual drop area with hover/drop feedback.
- **D-02:** Import applies immediately on file drop — no preview/confirmation step. Re-import to fix mistakes.
- **D-03:** After import, show summary + error list: "87 flags imported, 3 errors" with expandable error details (row number, issue description).
- **D-04:** No login or authentication needed. Import page is publicly accessible.
- **D-05:** Accept CSV, Excel (.xlsx), and other common spreadsheet formats. Use a parsing library that handles multiple formats.
- **D-06:** Provide a downloadable sample/template file with correct headers and example rows on the import page.
- **D-07:** Single admin page — import zone at top, imported data summary below. No separate routes for import.

### CSV Structure
- **D-08:** Three expected columns: Name, Row, Position.
- **D-09:** Row identifiers accept both letters (A, B, C) and numbers (1, 2, 3). Normalize internally.
- **D-10:** Auto-detect whether first row is headers or data. If no headers, assume column order: Name, Row, Position.
- **D-11:** Extra columns in the spreadsheet trigger a warning listing unrecognized columns, but import still succeeds. Only the 3 expected columns are read.

### Data Persistence
- **D-12:** Store imported flag data in Supabase (PostgreSQL). Data persists across sessions, multiple visitors can search simultaneously.
- **D-13:** On re-import, prompt the organizer to choose "Replace all" or "Merge" before processing. Replace wipes existing data; Merge upserts by matching name/position.

### Printable Directory
- **D-14:** Print-styled page at a dedicated route (e.g., /directory) with print-optimized CSS. Organizer uses browser print (Ctrl+P). No PDF library needed.
- **D-15:** Two views on the directory page: (1) Alphabetical name lookup (Name -> Row, Position), and (2) By-row listing grouped by row with entries under each. Covers both "find by name" and "walk a row" use cases.

### Claude's Discretion
- Exact drag-and-drop component implementation
- Error message wording and styling
- Supabase table schema design
- Column auto-detection algorithm details
- Print CSS layout and typography
- How to normalize row identifiers internally (store as letters vs numbers)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and in:

- `.planning/REQUIREMENTS.md` — IMP-01, IMP-02, IMP-03, ORG-01 requirements for this phase
- `.planning/PROJECT.md` — Core value, constraints, and key decisions
- `.planning/ROADMAP.md` §Phase 1 — Success criteria and phase goal

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — this phase establishes the foundational patterns (Supabase client setup, component structure, data layer)

### Integration Points
- Supabase database will be consumed by Phase 2 (Visitor Search) and Phase 3 (Grid Map)
- Data model established here must support the search and map features downstream

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-data-foundation*
*Context gathered: 2026-04-07*
