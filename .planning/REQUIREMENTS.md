# Requirements: Gravestone Finder

**Defined:** 2026-04-06
**Revised:** 2026-04-07 — Scope narrowed to CSV import + frontend search (no organizer dashboard)
**Core Value:** A family member can search a veteran's name and immediately find where their flag is planted — both on a visual map and as a human-readable location.

## v1 Requirements

### Data Import

- [ ] **IMP-01**: Organizer can import flag data from a CSV/spreadsheet file (name, row, position)
- [ ] **IMP-02**: Import validates data and reports errors (missing names, duplicate positions, malformed rows)
- [ ] **IMP-03**: Re-importing replaces existing data (clean slate per import)

### Visitor Search

- [ ] **SRCH-01**: Visitor can search for a flag by veteran name
- [ ] **SRCH-02**: Search results show row/position in human-readable format (e.g., "Row B, Position 7")
- [ ] **SRCH-03**: Search results show flag location highlighted on an interactive visual grid map
- [ ] **SRCH-04**: Search is fuzzy/typo-tolerant (handles misspellings and name variants)
- [ ] **SRCH-05**: "Not found" state shows empathetic message with fallback guidance

### Organizer Tools

- [ ] **ORG-01**: Organizer can generate a printable A-Z name-to-position directory

### Platform

- [ ] **PLAT-01**: App works on mobile browsers (phone at event) and desktop browsers
- [ ] **PLAT-02**: System handles 100+ flags without performance issues

## v2 Requirements

### Event Management

- **EVENT-01**: Support multiple events with separate data sets
- **EVENT-02**: Event selector/switcher in the UI

### Enhanced Visuals

- **VIS-01**: Field overview / occupancy view showing filled vs empty positions
- **VIS-02**: QR code generation per flag for scan-to-find

### Data

- **DATA-01**: Optional veteran notes/description field per flag
- **DATA-02**: Event history / year-over-year flag tracking

## Out of Scope

| Feature | Reason |
|---------|--------|
| Organizer CRUD dashboard (add/edit/remove flags in-app) | Data managed in spreadsheet; eliminated to cut scope |
| Auth/login system | No organizer dashboard = no protected pages |
| Field layout definition UI | Layout is implicit in the imported CSV data |
| Detailed veteran profiles (rank, branch, dates, photos) | Multiplies scope 5x, sourcing verified data is complex, privacy concerns |
| Native mobile app | Web app covers all devices, faster to build, no app store friction |
| Volunteer scheduling / assignment | Different problem domain — existing tools solve this |
| Payment / sponsorship tracking | Financial data requires PCI compliance, scope explosion |
| Social sharing / memorial wall | Privacy-sensitive, creates moderation burden |
| Real-time flag status (planted/not planted) | Unreliable data from field updates, adds false complexity |
| Multi-language support | Unvalidated demand for single local event |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| IMP-01 | Phase 1 | Pending |
| IMP-02 | Phase 1 | Pending |
| IMP-03 | Phase 1 | Pending |
| SRCH-01 | Phase 2 | Pending |
| SRCH-02 | Phase 2 | Pending |
| SRCH-03 | Phase 3 | Pending |
| SRCH-04 | Phase 2 | Pending |
| SRCH-05 | Phase 2 | Pending |
| ORG-01 | Phase 1 | Pending |
| PLAT-01 | Phase 3 | Pending |
| PLAT-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-07 after scope revision*
