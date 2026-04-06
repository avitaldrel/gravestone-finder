# Roadmap: Gravestone Finder

## Overview

This roadmap delivers a memorial Flag event web app in four phases, ordered by data dependency: organizers must define the field and enter flags before visitors can search, and search must work before the visual map can highlight results. Phase 1 delivers a complete organizer workflow (auth, layout, CRUD). Phase 2 adds efficient data operations (CSV import, printable directory). Phase 3 delivers the core value proposition -- public visitor search by veteran name. Phase 4 completes the experience with an interactive SVG grid map and verifies platform requirements (responsive, performant).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Organizer Core** - Auth-protected dashboard for field layout definition and flag CRUD with position validation
- [ ] **Phase 2: Data Import and Export** - Bulk CSV flag import and printable name-to-position directory
- [ ] **Phase 3: Visitor Search** - Public fuzzy name search returning human-readable flag locations
- [ ] **Phase 4: Interactive Grid Map and Platform** - SVG visual map with search highlight, responsive across devices, performant at scale

## Phase Details

### Phase 1: Organizer Core
**Goal**: Organizers can define a field layout, add/edit/remove flags, and trust that no two flags share a position -- all behind auth protection, on a data model ready for future multi-event expansion
**Depends on**: Nothing (first phase)
**Requirements**: FIELD-01, FIELD-02, FIELD-03, FIELD-04, FIELD-05, ORG-01, PLAT-03
**Success Criteria** (what must be TRUE):
  1. Organizer can log in with a password/passphrase and unauthenticated users cannot access organizer pages
  2. Organizer can define a field layout specifying rows and the number of positions per row
  3. Organizer can add a flag by entering a veteran name and selecting a row/position, and the flag appears in a list
  4. Organizer can edit a flag's name or position, and can remove a flag entirely
  5. Attempting to assign two flags to the same position is rejected with a clear error message
**Plans**: TBD
**UI hint**: yes

### Phase 2: Data Import and Export
**Goal**: Organizers can efficiently populate the field from an existing spreadsheet and produce a physical backup directory for event day
**Depends on**: Phase 1
**Requirements**: FIELD-06, ORG-02
**Success Criteria** (what must be TRUE):
  1. Organizer can upload a CSV file and flags are created in bulk with validation feedback (successes, errors, duplicates)
  2. Organizer can generate a printable alphabetical name-to-position directory suitable for printing or saving as PDF
**Plans**: TBD
**UI hint**: yes

### Phase 3: Visitor Search
**Goal**: A family member can search a veteran's name on their phone and immediately see where the flag is located, without logging in, even with imperfect spelling
**Depends on**: Phase 1
**Requirements**: SRCH-01, SRCH-02, SRCH-04, SRCH-05, ORG-03
**Success Criteria** (what must be TRUE):
  1. Visitor can access the search page without any login or signup
  2. Visitor can type a veteran's name and see matching results as they type
  3. Search handles misspellings and name variants (e.g., "Bobby" vs "Robert", "MacDonald" vs "Mcdonald") and still returns relevant results
  4. Each search result displays the flag's location in human-readable format (e.g., "Row B, Position 7")
  5. When no match is found, the visitor sees an empathetic message with fallback guidance (not a blank page or generic error)
**Plans**: TBD
**UI hint**: yes

### Phase 4: Interactive Grid Map and Platform
**Goal**: Search results come alive on a visual map that highlights the found flag, and the entire app works smoothly on phones at the event and desktops for organizers, handling 100+ flags without lag
**Depends on**: Phase 3
**Requirements**: SRCH-03, PLAT-01, PLAT-02
**Success Criteria** (what must be TRUE):
  1. When a visitor finds a flag via search, the result includes an interactive visual grid map with the flag's position highlighted and visually distinct
  2. The grid map is responsive -- usable on both mobile phone screens and desktop browsers without horizontal scrolling or broken layout
  3. The entire application (organizer dashboard, search, map) works correctly on mobile browsers and desktop browsers
  4. The application handles 100+ flags across all features (CRUD, search, map rendering) without noticeable performance degradation
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Organizer Core | 0/TBD | Not started | - |
| 2. Data Import and Export | 0/TBD | Not started | - |
| 3. Visitor Search | 0/TBD | Not started | - |
| 4. Interactive Grid Map and Platform | 0/TBD | Not started | - |
