# Requirements: Gravestone Finder

**Defined:** 2026-04-06
**Core Value:** A family member can search a veteran's name and immediately find where their flag is planted — both on a visual map and as a human-readable location.

## v1 Requirements

### Field Management

- [ ] **FIELD-01**: Organizer can define field layout with rows and positions per row
- [ ] **FIELD-02**: Organizer can add a flag with veteran name and assigned position
- [ ] **FIELD-03**: Organizer can edit an existing flag's name or position
- [ ] **FIELD-04**: Organizer can remove a flag
- [ ] **FIELD-05**: System prevents two flags from being assigned to the same position
- [ ] **FIELD-06**: Organizer can bulk import flags from a CSV file

### Visitor Search

- [ ] **SRCH-01**: Visitor can search for a flag by veteran name
- [ ] **SRCH-02**: Search results show row/position in human-readable format (e.g., "Row B, Position 7")
- [ ] **SRCH-03**: Search results show flag location highlighted on an interactive visual grid map
- [ ] **SRCH-04**: Search is fuzzy/typo-tolerant (handles misspellings and name variants)
- [ ] **SRCH-05**: "Not found" state shows a clear message with fallback guidance

### Organizer Tools

- [ ] **ORG-01**: Organizer access is protected by authentication (password/passphrase)
- [ ] **ORG-02**: Organizer can generate a printable A-Z name-to-position directory
- [ ] **ORG-03**: Visitor search is public — no login or signup required

### Platform

- [ ] **PLAT-01**: App works on mobile browsers (phone at event) and desktop browsers
- [ ] **PLAT-02**: System handles 100+ flags without performance issues
- [ ] **PLAT-03**: Single event initially with data model supporting future multi-event expansion

## v2 Requirements

### Event Management

- **EVENT-01**: Organizer can manage multiple events from a single dashboard
- **EVENT-02**: Each event has its own field layout and flag set

### Enhanced Visuals

- **VIS-01**: Field overview / occupancy view showing filled vs empty positions
- **VIS-02**: QR code generation per flag for scan-to-find

### Data

- **DATA-01**: Optional veteran notes/description field per flag
- **DATA-02**: Event history / year-over-year flag tracking

## Out of Scope

| Feature | Reason |
|---------|--------|
| Detailed veteran profiles (rank, branch, dates, photos) | Multiplies scope 5x, sourcing verified data is complex, privacy concerns |
| Native mobile app | Web app covers all devices, faster to build, no app store friction |
| Volunteer scheduling / assignment | Different problem domain — existing tools (SignUpGenius) solve this |
| Payment / sponsorship tracking | Financial data requires PCI compliance, scope explosion |
| Social sharing / memorial wall | Privacy-sensitive, creates moderation burden |
| Real-time flag status (planted/not planted) | Unreliable data from field updates, adds false complexity |
| Multi-language support | Unvalidated demand for single local event |
| Public event directory | Completely different product (event discovery platform) |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIELD-01 | Phase 1 | Pending |
| FIELD-02 | Phase 1 | Pending |
| FIELD-03 | Phase 1 | Pending |
| FIELD-04 | Phase 1 | Pending |
| FIELD-05 | Phase 1 | Pending |
| FIELD-06 | Phase 2 | Pending |
| SRCH-01 | Phase 3 | Pending |
| SRCH-02 | Phase 3 | Pending |
| SRCH-03 | Phase 4 | Pending |
| SRCH-04 | Phase 3 | Pending |
| SRCH-05 | Phase 3 | Pending |
| ORG-01 | Phase 1 | Pending |
| ORG-02 | Phase 2 | Pending |
| ORG-03 | Phase 3 | Pending |
| PLAT-01 | Phase 4 | Pending |
| PLAT-02 | Phase 4 | Pending |
| PLAT-03 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-06 after roadmap creation*
