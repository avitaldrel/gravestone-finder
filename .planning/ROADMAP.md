# Roadmap: Gravestone Finder

## Overview

This roadmap delivers a memorial Flag event web app in four phases. Phase 1 sets up the project foundation and CSV data import -- the sole data path into the system. Phase 2 delivers the core value proposition: a public search frontend where families find their veteran's flag by name. Phase 3 completes the experience with an interactive SVG grid map, responsive polish, and performance verification at scale. Phase 4 adds a demo mode with sample data so users can explore all features without importing real data.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Data Foundation** - Project setup, CSV import pipeline, printable directory, and data layer
- [ ] **Phase 2: Visitor Search** - Public fuzzy name search returning human-readable flag locations
- [ ] **Phase 3: Interactive Grid Map and Platform** - SVG visual map with search highlight, responsive across devices, performant at scale
- [ ] **Phase 4: Demo Mode** - "Try Demo" button seeds ~50 sample flags so users can explore all features without real data

## Phase Details

### Phase 1: Data Foundation
**Goal**: Organizers can import flag data from a CSV file, see validation feedback, and generate a printable directory -- establishing the data layer that all visitor-facing features build on
**Depends on**: Nothing (first phase)
**Requirements**: IMP-01, IMP-02, IMP-03, ORG-01
**Success Criteria** (what must be TRUE):
  1. Organizer can upload a CSV file with veteran names and row/position data, and flags appear in the system
  2. Import validates data and clearly reports errors (missing names, duplicate positions, malformed rows)
  3. Re-importing replaces existing data cleanly
  4. Organizer can generate a printable alphabetical name-to-position directory
**Plans:** 4 plans

Plans:
- [x] 01-01-PLAN.md -- Project scaffolding, types, Supabase setup, DB schema, test infrastructure
- [x] 01-02-PLAN.md -- Parsing library (TDD): spreadsheet parsing, validation, row normalization, header detection
- [x] 01-03-PLAN.md -- Import API route and admin page UI (drop zone, import dialog, summary, errors)
- [x] 01-04-PLAN.md -- Directory page with alphabetical and by-row views, print CSS

**UI hint**: yes

### Phase 2: Visitor Search
**Goal**: A family member can search a veteran's name on their phone and immediately see where the flag is located, even with imperfect spelling
**Depends on**: Phase 1
**Requirements**: SRCH-01, SRCH-02, SRCH-04, SRCH-05
**Success Criteria** (what must be TRUE):
  1. Visitor can access the search page without any login or signup
  2. Visitor can type a veteran's name and see matching results as they type
  3. Search handles misspellings and name variants (e.g., "Bobby" vs "Robert", "MacDonald" vs "Mcdonald") and still returns relevant results
  4. Each search result displays the flag's location in human-readable format (e.g., "Row B, Position 7")
  5. When no match is found, the visitor sees an empathetic message with fallback guidance (not a blank page or generic error)
**Plans:** 2 plans

Plans:
- [ ] 02-01-PLAN.md -- Install Fuse.js, create search components (SearchBar, ResultCard, NoResults, NoData, SearchResults, SearchPage), wire root page as search homepage
- [ ] 02-02-PLAN.md -- Fuse.js search behavior tests, SearchPage integration tests, visual verification checkpoint

**UI hint**: yes

### Phase 3: Interactive Grid Map and Platform
**Goal**: Search results come alive on a visual map that highlights the found flag, and the entire app works smoothly on phones at the event and desktops, handling 100+ flags without lag
**Depends on**: Phase 2
**Requirements**: SRCH-03, PLAT-01, PLAT-02
**Success Criteria** (what must be TRUE):
  1. When a visitor finds a flag via search, the result includes an interactive visual grid map with the flag's position highlighted and visually distinct
  2. The grid map is responsive -- usable on both mobile phone screens and desktop browsers without horizontal scrolling or broken layout
  3. The entire application (import, search, map) works correctly on mobile browsers and desktop browsers
  4. The application handles 100+ flags across all features (import, search, map rendering) without noticeable performance degradation
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Data Foundation | 4/4 | Complete | 2026-04-12 |
| 2. Visitor Search | 0/2 | Not started | - |
| 3. Interactive Grid Map and Platform | 0/TBD | Not started | - |
| 4. Demo Mode | 0/TBD | Not started | - |

### Phase 4: Demo Mode
**Goal**: A "Try Demo" button seeds the app with ~50 realistic sample veteran flags so organizers and visitors can explore all features (import, search, directory, map) without entering real data
**Depends on**: Phase 3
**Requirements**: TBD
**Success Criteria** (what must be TRUE):
  1. Visitor or organizer can click a "Try Demo" button and the app populates with ~50 sample flags
  2. All features work with demo data: import summary shows results, search finds sample names, directory lists entries, map highlights positions
  3. Demo data is clearly distinguishable from real data (visual indicator or separate mode)
  4. Demo data can be cleared easily to return to a clean state
**Plans**: TBD
**UI hint**: yes
