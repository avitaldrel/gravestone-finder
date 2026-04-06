# Feature Research

**Domain:** Memorial flag event management — Field of Flags / Healing Field / Flags of Honor
**Researched:** 2026-04-06
**Confidence:** MEDIUM (current-state research on a niche domain; no dedicated commercial software exists; findings drawn from analyzing real events + comparable domains)

---

## How Existing Events Actually Work

Before enumerating features, it's important to understand the current state of the art — because it is low-tech.

**The dominant pattern across all real Healing Field / Field of Honor events researched:**

- Flags are planted in rows with alphanumeric labels (e.g., Row A, position 1-30)
- A physical binder at an information booth lists all names organized by row
- Volunteers at the booth help visitors find their flag on request
- No digital search or interactive map exists at any event found
- Georgetown, TX uses docents who physically walk visitors to their flag
- Colonial Flag Foundation's national events have no online name-to-location lookup
- The ASOM event uses a physical binder at a white podium in the field

**The gap this app fills is real.** There is no known digital equivalent for this specific use case. The closest analogs are:

1. **Cemetery management software** (Chronicle, Cemify, PlotBox) — permanent installations with search-by-name and interactive plot maps. These establish the UX baseline visitors expect.
2. **Event seating chart tools** (MapD, SeatMap) — guests search their name on a screen or mobile device to see their assigned seat/table on a visual floor plan.
3. **Cemetery finder apps** (Find a Grave, Nationwide Gravesite Locator) — Section/Row/Plot lookup with name search and map pin.

The feature set below is informed by all three domains, adapted to this use case.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Name search (visitor-facing) | Core value proposition. Without it, the app has no purpose for visitors. | LOW | Must return results fast; 100 names is trivial for any search approach |
| Search results show row/position | Every comparable system (cemetery, seating chart) returns a human-readable location label. Visitors need to navigate physically. | LOW | Format: "Row B, Position 7" — matches how physical fields are organized |
| Visual map showing flag location | Cemetery apps and seating tools all provide a visual. Visitors expect to see a highlighted dot, not just read coordinates. | MEDIUM | Highlight the specific flag on a grid layout; does not need real GPS/satellite imagery |
| Organizer: add a flag | CRUD baseline. Organizers must be able to enter veteran name + assigned position. | LOW | Core data entry path |
| Organizer: edit a flag | Flags get re-assigned or corrected before and during setup. | LOW | Inline edit on the record |
| Organizer: remove a flag | Sponsorships get cancelled or names change. | LOW | Soft-delete preferred so history is preserved |
| Organizer: define field layout | The app must know what rows and positions exist before flags can be placed. | MEDIUM | Row count, positions per row — grid definition |
| Mobile-responsive UI | Visitors use phones on-site. Organizers may use phones during setup. | LOW | Must work on mobile browsers without a native app |
| No login required for visitors | Visitors are family members at an emotional event. Friction barriers cause abandonment. | LOW | Public read-only access; organizer auth is separate |
| "Not found" state on search | If a name isn't in the system, the visitor needs a clear message — not a blank page or error. | LOW | Include fallback guidance (e.g., "Visit the information tent") |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but highly valuable in this niche.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Fuzzy / typo-tolerant name search | Veterans' names are often unusual, hyphenated, or spelled differently by different family members. Exact-match search creates support burden. | MEDIUM | Fuse.js (client-side) covers 100 names trivially; Levenshtein distance handles 1-2 char typos |
| QR code per flag / per event | Print a QR on each flag tag that deep-links the visitor directly to that flag's record. Eliminates the need to search. | LOW | Just a URL with the flag ID as parameter; no special infrastructure |
| Print-ready flag directory | Organizers need a physical backup. A printable alphabetical name-to-position list is the current standard — the app should produce it automatically. | LOW | Browser print CSS or PDF export; eliminates manually building the binder |
| Bulk import (CSV) | Events may have 100+ names entered via Google Forms, spreadsheets, or donor databases. Manual entry one by one is painful. | MEDIUM | CSV upload with column mapping (name, row, position); validation step before commit |
| Position conflict detection | Two flags assigned to the same physical spot is a setup disaster. The system should prevent or warn on duplicate assignments. | LOW | Uniqueness constraint on (row, position) with clear error message |
| Field overview / occupancy view | Organizers need to see the entire field at a glance to plan layout, spot gaps, and verify coverage before planting day. | MEDIUM | Grid visualization with filled vs. empty positions color-coded |
| Multi-event architecture (future-ready) | This event recurs annually. Building the data model with an event ID allows reuse year-over-year without rebuilding. | LOW | Just add an event_id foreign key; no UI needed for v1 |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem like good ideas but create scope creep, privacy problems, or false complexity for this use case.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Detailed veteran profiles (branch, rank, photo, dates, bio) | Makes each flag more meaningful; next obvious step from name-only | Requires sourcing verified data, managing photo uploads, GDPR/privacy considerations, and content moderation. Multiplies scope by 5x for unclear event-day value. | Name + location is the MVP. Add a free-text "notes" field in v2 if organizers want it. |
| Real-time flag status (planted / not yet planted) | Organizers want to track setup progress | Requires two-way sync during physical setup (people in a field updating statuses on phones), which creates unreliable data and false confidence. Adds status logic to every query. | Use the print-ready directory at setup time; status tracking is a separate operational problem |
| Native mobile app | Richer experience, home screen icon, offline | No app store, slower deployment, platform fragmentation. A PWA covers the offline/installable angle if ever needed. | Responsive web app covers all needs; consider PWA manifest only if offline is a hard requirement |
| Volunteer scheduling / assignment | Organizers manage many people | Entirely different problem domain. Existing tools (SignUpGenius, Better Impact) solve this well. | Out of scope — link to existing volunteer tool from the organizer dashboard if needed |
| Payment / sponsorship tracking | Flags are typically sponsored; tracking donations seems natural | Financial data requires PCI compliance, reconciliation workflows, and accounting integration. Scope explosion. | Out of scope — the organizer's existing fundraising platform handles this |
| Social sharing / memorial wall | Family members want to share tributes | Privacy sensitive (you're publishing names of the deceased). Creates moderation burden. | Not appropriate without explicit opt-in from sponsors; defer indefinitely |
| Multi-language support | Serve non-English-speaking families | Valid future need but adds 20%+ complexity for unvalidated demand at a single local event | Use English for v1; UTF-8 name storage handles non-English names in the data |
| Public event listing / directory of events | "You should list all Field of Honor events nationally" | Completely different product (event discovery platform). Distracts from the core tool. | Out of scope; this is a tool for one organizer, not a national registry |

---

## Feature Dependencies

```
Field Layout Definition
    └──required by──> Flag Placement (CRUD)
                          └──required by──> Name Search
                                                └──required by──> Visual Map Result
                                                └──required by──> Row/Position Result

Flag Placement (CRUD)
    └──required by──> Print-Ready Directory
    └──required by──> Position Conflict Detection
    └──required by──> Field Overview / Occupancy View
    └──required by──> QR Code per Flag

Bulk CSV Import
    └──enhances──> Flag Placement (shortcut for large datasets)
    └──requires──> Position Conflict Detection (must validate before committing)

Fuzzy Search
    └──enhances──> Name Search (replaces or wraps exact match)

Organizer Auth
    └──required by──> Flag Placement (CRUD) — write operations must be protected
    └──not required by──> Name Search — visitor reads are public
```

### Dependency Notes

- **Field Layout Definition required by Flag Placement:** You cannot assign a flag to Row C, Position 5 if Row C doesn't exist in the system. Layout must be configured first.
- **Flag Placement required by Name Search:** Search has nothing to return without flag records.
- **Name Search required by Visual Map Result:** The map highlights a location returned by search; you cannot show the map in isolation.
- **Organizer Auth does NOT block visitor search:** Visitor-facing search is public. Auth only gates write operations. These are separate concerns and should not be coupled.
- **Bulk Import enhances but doesn't replace CRUD:** Single-flag add/edit must exist for corrections and additions after initial import.
- **Position Conflict Detection must wrap both CRUD and Bulk Import:** The same uniqueness logic applies to both entry paths.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — the event is coming up soon.

- [ ] Field layout definition (rows + positions per row) — required before anything else works
- [ ] Organizer auth (simple password or passphrase) — protects write operations
- [ ] Flag CRUD (add, edit, remove) — core data management
- [ ] Visitor name search — exact match is acceptable for v1
- [ ] Search result: row/position label — human-readable physical location
- [ ] Search result: visual grid map with flag highlighted — visual confirmation
- [ ] "Not found" state with fallback message — prevents dead-end confusion on mobile
- [ ] Mobile-responsive layout — phones will be used on-site

### Add After Validation (v1.x)

Add once the core is live and organizers have used it in the field.

- [ ] Fuzzy / typo-tolerant search — add when organizers report "name not found" false negatives
- [ ] Print-ready directory export — add when organizers ask to replace the physical binder
- [ ] Position conflict detection — add before the next data entry cycle if duplicates are discovered
- [ ] QR code generation per flag — add if organizers want to print QR tags for flags
- [ ] Bulk CSV import — add when the event grows beyond comfortable manual entry (~50+ flags)

### Future Consideration (v2+)

Defer until the product has proven its value and the use case is well understood.

- [ ] Field overview / occupancy view — useful for large events (500+ flags); overkill at 100
- [ ] Multi-event management UI — when a second event is being planned
- [ ] Veteran notes / description field — if organizers want richer flag records
- [ ] PWA / offline support — if connectivity at the venue is proven to be unreliable

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Field layout definition | HIGH | LOW | P1 |
| Organizer auth | HIGH | LOW | P1 |
| Flag CRUD (add/edit/remove) | HIGH | LOW | P1 |
| Visitor name search | HIGH | LOW | P1 |
| Row/position result display | HIGH | LOW | P1 |
| Visual map with highlight | HIGH | MEDIUM | P1 |
| "Not found" state | MEDIUM | LOW | P1 |
| Mobile responsive layout | HIGH | LOW | P1 |
| Fuzzy/typo-tolerant search | MEDIUM | LOW | P2 |
| Print-ready directory export | MEDIUM | LOW | P2 |
| Position conflict detection | MEDIUM | LOW | P2 |
| QR code per flag | MEDIUM | LOW | P2 |
| Bulk CSV import | MEDIUM | MEDIUM | P2 |
| Field overview / occupancy view | MEDIUM | MEDIUM | P3 |
| Multi-event management UI | LOW | HIGH | P3 |
| Veteran profile (branch, rank, etc.) | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

No direct digital competitors exist. The comparison is against analog solutions and adjacent domains.

| Feature | Current Analog (Healing Field events) | Cemetery Software (Chronicle, Cemify) | Event Seating (MapD, SeatMap) | Our Approach |
|---------|---------------------------------------|--------------------------------------|-------------------------------|--------------|
| Name lookup | Physical binder at info booth; volunteer assistance | Name search with section/row/grave result | Guest types name, gets seat/table on visual floor plan | Name search → row/position + highlighted grid map |
| Visual location | Paper map or verbal directions | Interactive plot map with GPS pins | Visual floor plan with seat highlight | SVG/canvas grid with flag position highlighted |
| Organizer data entry | Manual (spreadsheet, pen+paper) | Web CRUD admin | Drag-and-drop seating assignment | Web CRUD + optional CSV import |
| Mobile access | Volunteer brings printed sheet | Responsive web app | Responsive web app / QR code to phone | Responsive web app, public for visitors |
| Fuzzy name search | Not applicable (human does it) | Some platforms support wildcard search | Not typically needed (event RSVPs have exact names) | Fuse.js client-side fuzzy match |
| Printable directory | The physical binder is already the current tool | PDF export available | Not applicable | Print-ready directory export in v1.x |
| Offline support | Works by definition (paper) | Not a focus | Not a focus | Progressive enhancement; static data loads fast; consider PWA if venue has poor connectivity |

---

## Sources

- Colonial Flag Foundation / healingfield.org — event logistics and visitor navigation patterns (MEDIUM confidence — confirmed by multiple event pages)
- ASOM Field of Honor event description — physical binder + podium navigation pattern (MEDIUM confidence)
- Winchester VA Rotary Club Healing Field — volunteer info booth pattern (MEDIUM confidence)
- Georgetown TX Field of Honor — docent navigation pattern (MEDIUM confidence)
- Chronicle cemetery software features — search-by-name + interactive map UX baseline (HIGH confidence — official product site)
- Cemify, PlotBox, Everspot — interactive plot map + mobile access patterns (MEDIUM confidence)
- MapD event seating chart — guest name search → visual seat assignment UX (MEDIUM confidence)
- SeatMap — QR code → visual floor plan pattern (MEDIUM confidence)
- Fuse.js documentation — lightweight client-side fuzzy search feasibility for small datasets (HIGH confidence — official docs)
- Algolia fuzzy search blog — Levenshtein distance implementation patterns (MEDIUM confidence)
- Eventify mobile event app mistakes — offline/connectivity pitfalls (MEDIUM confidence)

---

*Feature research for: Memorial flag event management (Field of Flags / Healing Field type events)*
*Researched: 2026-04-06*
