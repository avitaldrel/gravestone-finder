# Gravestone Finder

## What This Is

A web application for navigating memorial "Field of Flags" events — temporary displays where small flags are planted on a land plot, each representing a fallen veteran. Organizers prepare flag data in a spreadsheet externally, then import it. Family members use the app to search by name and locate their loved one's flag via an interactive map or row/position directory.

## Core Value

A family member can search a veteran's name and immediately find where their flag is planted — both on a visual map and as a human-readable location (row, position).

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Organizer can import flag data from a CSV/spreadsheet file
- [ ] Import validates data and reports errors (missing names, duplicate positions)
- [ ] Family members can search for a flag by veteran name
- [ ] Search results show position as row/position directory (e.g., "Row 3, Position 12")
- [ ] Search results show flag location on an interactive visual map
- [ ] Search is fuzzy/typo-tolerant (handles misspellings and name variants)
- [ ] "Not found" state shows empathetic message with fallback guidance
- [ ] Organizer can generate a printable A-Z name-to-position directory
- [ ] System handles 100+ flags without performance issues
- [ ] Works on mobile browsers (phone at event) and desktop browsers

### Out of Scope

- Native mobile app — web app covers all devices via browser
- Detailed veteran profiles (rank, branch, dates, photos) — name only for now
- Organizer CRUD dashboard — data is managed in the spreadsheet, not the app
- Auth/login system — no organizer dashboard means no protected pages needed
- Field layout definition UI — layout is implicit in the imported data
- In-app flag editing — edit the spreadsheet and re-import
- Volunteer coordination / scheduling — organizers handle this externally
- Payment / sponsorship tracking — not part of this tool
- Multi-event management — one import = one event for v1

## Context

- This is a greenfield project with no existing system
- Event is coming up soon, so speed matters
- Physical setup: small flags planted in a land plot in a grid-like arrangement
- ~100 flags for the first event, but the system should handle growth
- Data flow: organizer fills out spreadsheet → imports CSV → app processes and displays
- Primary user experience is visitors searching on their phones at the event

## Constraints

- **Timeline**: Event coming soon — need a working product quickly
- **Platform**: Web app only — must be responsive for mobile and desktop
- **Data simplicity**: Name-only flag records for v1
- **Data entry**: External (spreadsheet) — app is import + display only
- **Scale**: Must handle 100+ flags without performance issues

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web app over native | Accessible on any device, faster to build, no app store friction | — Pending |
| Name-only flag data | Simplicity for v1, event is soon | — Pending |
| CSV import as sole data path | Organizers already use spreadsheets; no need to rebuild that workflow in-app | — Pending |
| No auth/organizer dashboard | Eliminating organizer CRUD cuts scope in half; data lives in the spreadsheet | — Pending |
| SVG grid for field visualization | Lighter than map library, fits non-geographic grid layout | — Pending |
| Client-side fuzzy search | Works offline at events with spotty connectivity | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-07 after scope revision — CSV-import-only, frontend-focused*
