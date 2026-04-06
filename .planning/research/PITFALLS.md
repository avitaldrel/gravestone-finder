# Pitfalls Research

**Domain:** Memorial flag event tracking / field-of-flags event management with interactive map and search
**Researched:** 2026-04-06
**Confidence:** HIGH (domain-adjacent research from cemetery mapping, stadium seating maps, outdoor event apps, and wayfinding UX -- strong pattern convergence)

## Critical Pitfalls

### Pitfall 1: Map-to-Field Position Mismatch

**What goes wrong:**
The digital grid layout does not match the physical flag layout in the field. Visitors search for a name, get "Row 3, Position 12," walk to the field, and find the wrong flag -- or no flag at all. This is the single highest-impact failure mode because it undermines the entire core value proposition.

**Why it happens:**
- The physical grid is imperfect -- flags are planted by volunteers, not surveyed by engineers. Rows may curve, spacing varies, sections may not line up perfectly.
- Numbering conventions differ between the organizer's mental model (starts from the entrance? from the left? from the road?) and what the app assumes.
- Off-by-one errors: does Row 1 start at the front or back? Does Position 1 start from left or right? Does the numbering direction alternate per row (boustrophedon) or stay consistent?
- The field may be re-arranged after data entry (flags moved due to terrain, weather, or last-minute decisions) without updating the app.

**How to avoid:**
- Make the organizer define the grid origin explicitly during setup: "Row 1 starts at [landmark]. Position 1 is on the [left/right] when facing [direction]."
- Include a simple text description of how to orient yourself on the field (e.g., "Row 1 is nearest the parking lot. Numbers increase left to right.").
- Build a "walk the field" verification step where the organizer can spot-check a few positions before going live.
- Use clear physical markers (row signs/stakes) that match the app's numbering -- and document this in the organizer workflow.

**Warning signs:**
- Organizer hesitates when asked "which direction do rows go?"
- No physical row markers are planned for the event
- Grid data was entered without visiting the physical site
- Multiple people entered data with potentially different mental models

**Phase to address:**
Phase 1 (Data Model + Organizer CRUD). The grid definition UX must force explicit orientation choices from day one. Retrofitting this after data is entered causes cascading errors.

---

### Pitfall 2: No Offline or Low-Connectivity Fallback for Event Day

**What goes wrong:**
On event day, visitors are outdoors, likely in a park or field with poor cellular coverage. The app requires a network request for every search. With 50+ people simultaneously searching on spotty 4G/LTE, the app becomes unusably slow or completely unresponsive -- exactly when it matters most.

**Why it happens:**
- Developers test on fast WiFi and never simulate real field conditions.
- The dataset is small (100 flags) but the app still round-trips to a server for every query.
- Outdoor venues (parks, fields, cemeteries) frequently have weak cell signals.
- Event-day traffic spikes are concentrated: many visitors arrive within the same 1-2 hour window.

**How to avoid:**
- Cache the entire flag dataset client-side on first load. At 100 flags with name + position, this is under 10KB -- trivially cacheable.
- Implement client-side search (filter/fuzzy match in the browser) so searches work with zero network after initial load.
- Use a service worker to cache the app shell and flag data, enabling full offline functionality after first visit.
- Add a visible "Last synced: [time]" indicator so users know their data is current.
- Test the app on throttled 3G connections and in airplane mode.

**Warning signs:**
- Every search triggers a loading spinner
- No service worker or caching strategy in the architecture
- App has not been tested outside the building / off WiFi
- The interactive map requires network requests to render

**Phase to address:**
Phase 1 (Core architecture). Client-side search and caching must be a foundational decision, not bolted on later. The dataset is small enough that this is trivial to implement early but painful to retrofit if the architecture assumes server-side everything.

---

### Pitfall 3: Sunlight-Unreadable UI

**What goes wrong:**
Visitors open the app on their phones outdoors in direct sunlight and cannot read the screen. Low-contrast text, subtle color-coded map markers, and light gray UI elements become invisible. Users physically cup their hands around the phone, squinting, and give up. Research shows WCAG-compliant text that tests fine indoors often becomes unreadable in daylight.

**Why it happens:**
- All development and testing happens indoors on bright monitors.
- Designers use trendy low-contrast styles (light grays, subtle pastels).
- Map markers use color alone to convey state (e.g., light blue dot on light green background).
- The difference between "found" and "highlighted" states relies on subtle color shifts.

**How to avoid:**
- Design with a forced high-contrast palette: dark text on white/light backgrounds, or vice versa. Minimum WCAG AAA contrast ratios (7:1) rather than just AA (4.5:1).
- Use large, bold text for the critical information (row/position display). Minimum 18px for body, 24px+ for the location result.
- Map markers must be distinguishable by shape/size, not just color.
- The searched-and-found flag marker must be dramatically different: pulsing animation, large size, high-contrast border -- visible at a glance on a washed-out screen.
- Test the app outside on a phone in sunlight before event day. This is a 5-minute test that catches 90% of issues.

**Warning signs:**
- No outdoor testing has occurred
- Map uses color-only differentiation for markers
- The search result location text is smaller than 18px
- UI uses gray-on-gray or pastel color schemes

**Phase to address:**
Phase 2 (Interactive Map + Search UI). Visual design must be built outdoor-first. Apply high-contrast principles from the first mockup, not as a polish pass later.

---

### Pitfall 4: Search That Fails on Real Name Variations

**What goes wrong:**
A family member searches for "Bobby Smith" but the flag was entered as "Robert J. Smith." They search for "MacDonald" but it was entered as "Mcdonald." They try "O'Brien" and the apostrophe breaks the search. They type "Smth" (typo on a phone in sunlight) and get zero results. Each failed search feels like a personal rejection -- "my loved one isn't here."

**Why it happens:**
- Exact string matching is the default implementation path. It is trivially simple and works in demos.
- Name data is entered by volunteers with inconsistent formatting (some use full names, some use nicknames, some include rank or suffix).
- Visitors type on phone keyboards outdoors (cold fingers, sunlight, emotion) and make typos.
- Special characters in names (O'Brien, hyphenated names, accent marks) are handled inconsistently.

**How to avoid:**
- Implement fuzzy search from day one. With only 100 entries, even a simple Levenshtein distance or contains-substring approach is fast enough.
- Normalize the search: case-insensitive, ignore punctuation, trim whitespace.
- Search across the entire name string, not requiring first/last name separation.
- Show partial matches ("Did you mean...?") rather than empty results.
- Consider phonetic matching (Soundex or Metaphone) for name pronunciation equivalence ("Smith" matches "Smyth").
- The empty state for search should never just say "No results found." It should suggest checking spelling and offer to browse the full directory.

**Warning signs:**
- Search uses exact match or SQL LIKE with only prefix matching
- No handling for apostrophes, hyphens, or accented characters
- Search requires separate first/last name fields
- Empty results page has no guidance or alternatives

**Phase to address:**
Phase 1 (Data Model + Search). Fuzzy search logic must be built into the search from the beginning. With a 100-record dataset, client-side fuzzy search is trivially fast and dramatically improves the experience.

---

### Pitfall 5: Data Entry Chaos Under Time Pressure

**What goes wrong:**
The event is tomorrow. The organizer or volunteers are entering 100 flag records manually. Names are misspelled, positions are duplicated (two flags assigned to Row 2, Position 5), some entries are incomplete, and the data quality is so poor that search becomes unreliable on event day. Worse: there is no way to detect these problems before visitors arrive.

**Why it happens:**
- Data entry is done in a rush, often the night before or morning of the event.
- Multiple volunteers may enter data simultaneously without coordination.
- No validation prevents duplicate positions or incomplete records.
- No bulk import option, forcing tedious one-by-one entry.
- No review/audit view to spot-check the data before going live.

**How to avoid:**
- Validate positions on entry: prevent duplicate row/position assignments. Show an immediate error: "Row 2, Position 5 is already assigned to [Name]."
- Require the name field to be non-empty.
- Provide a CSV/spreadsheet import for bulk entry (organizers likely already have a list).
- Build a simple "audit view" that shows all entries in grid order, making gaps and duplicates visually obvious.
- Add a "publish/go live" toggle so the organizer can see the data is complete before visitors can search.

**Warning signs:**
- No duplicate position validation exists
- No bulk import option (organizer is entering records one by one)
- No audit/review screen to verify completeness
- Organizer is entering data on event day morning

**Phase to address:**
Phase 1 (Organizer CRUD). Data validation and bulk import are not "nice to have" -- they are the difference between reliable and unreliable event-day data. Build validation from the first data entry screen.

---

### Pitfall 6: Interactive Map That Frustrates Instead of Helps

**What goes wrong:**
The visitor searches for a name and gets a map view. But the map is zoomed out showing the entire field as a blob of indistinguishable dots. They try to zoom in but accidentally pan away. They pinch to zoom and a marker tooltip fires. They find the highlighted flag but cannot figure out where it is relative to where they are physically standing. The map adds confusion rather than reducing it.

**Why it happens:**
- Map interactions have two conflicting modes: navigation (pan/zoom) and selection (tap markers). On mobile touchscreens, these gestures overlap.
- The map shows all 100+ flags at the same zoom level with no clustering or visual hierarchy.
- No physical reference points on the map (entrance, parking lot, road) to help orient the user.
- The "you searched for this flag" highlight is too subtle to find among 100 markers.
- The map tries to be a GPS navigation tool rather than a simple visual reference.

**How to avoid:**
- Auto-zoom to the searched flag after a search, centered and highlighted. The user should never need to find it manually.
- Make the searched flag marker dramatically different: 3x larger, pulsing animation, contrasting color with a label.
- Include at least one physical landmark on the map (entrance, road, sign) for orientation.
- Keep the map simple: a grid with labeled rows, not a satellite photo or complex SVG.
- On mobile, consider making the map view-only (no interactive zoom/pan) with a pre-zoomed view centered on the result. A static, clear image beats an interactive, confusing one.
- Provide the row/position text prominently ABOVE or alongside the map -- the map supplements the text directions, not the other way around.

**Warning signs:**
- Map requires manual zoom/pan to find a searched flag
- No auto-centering after search
- Map markers are all identical (no visual hierarchy)
- No physical landmarks or row labels on the map
- Map is the only navigation method (no text-based fallback)

**Phase to address:**
Phase 2 (Interactive Map). The map must be designed search-result-first: "Show me exactly where this flag is" -- not "here's a map, go explore." Every design decision should serve the post-search use case.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding a single event | Faster v1 delivery | Complete rewrite to support multiple events | Acceptable for v1 IF the data model uses an event_id from the start, even if only one event exists |
| Storing positions as free-text strings | No grid validation logic needed | Impossible to validate duplicates, sort by position, or render a map programmatically | Never -- use structured row/position integers from day one |
| Server-side only search | Simpler architecture | Fails on poor connectivity at event | Never for this use case -- dataset is tiny, client-side is trivial |
| No authentication for organizer | Faster to build | Anyone can edit/delete flag data | Acceptable for v1 only if the organizer URL is obscured (UUID-based) and not linked publicly |
| Skipping service worker | Less complexity | App is useless without connectivity at event | Only acceptable if you test and confirm strong cell coverage at the specific venue |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Map/tile provider (if used) | Choosing a provider that requires API keys with rate limits, which get hit on event day when 100+ people load the map simultaneously | Use a simple CSS/SVG grid rather than a geographic map provider. This is a field grid, not a geography problem. No tile server needed. |
| Hosting/CDN | Deploying to a free tier with cold starts (e.g., serverless functions that take 3-5 seconds to wake up) | Use a static site host (Vercel, Netlify, Cloudflare Pages) with edge caching. The visitor-facing app can be fully static + client-side. |
| CSV/spreadsheet import | Assuming clean data -- no handling for extra whitespace, BOM characters, inconsistent delimiters, or encoding issues (especially for names with accents or special characters) | Trim all fields, normalize encoding to UTF-8, preview imported data before committing, handle both comma and tab delimiters |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| SVG map with individual DOM elements per flag | Panning and zooming becomes janky on mobile | At 100 flags, SVG is fine. If scaling to 500+, switch to Canvas rendering or use a virtualized approach. For v1 at 100, SVG is the right choice -- simpler to implement and performant enough. | 500+ flags with zoom/pan interactions on low-end mobile |
| Fetching full dataset on every page load without caching | Slow initial load, wasted bandwidth on repeat visits | Cache flag data in localStorage or service worker cache. Invalidate only when organizer publishes changes. | Event day with 100+ simultaneous visitors on slow connections |
| Unoptimized images/assets on map | Map takes 5+ seconds to load on 3G | Keep the map lightweight -- CSS/SVG grid, no background images or satellite tiles. Inline critical CSS. Target < 100KB total page weight for the visitor search experience. | Any mobile user on a slow connection |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Organizer admin panel accessible via guessable URL (/admin) | Anyone can modify flag data, delete records, or vandalize the memorial | Use an obscured URL (UUID-based route like /manage/a1b2c3d4) at minimum. Better: add simple password protection. For v1, even a shared passcode is better than nothing. |
| Exposing veteran data beyond what is needed | Privacy concerns -- even just names can be sensitive if combined with location | Only expose veteran name and flag position in the public API. No additional PII. Ensure the organizer interface does not expose data that should not be public. |
| No rate limiting on search | Automated scraping of all veteran names in the system | Add basic client-side throttling. For v1 with 100 records, this is low risk but worth noting for scale. |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Requiring the visitor to understand the grid system before searching | Family members just want to find a name -- they should not need to learn about rows/sections/positions first | Search-first UX: the landing page IS the search bar. Results show both human-readable location AND the map. Zero onboarding needed. |
| Generic error messages ("Not found") when a search fails | For a grieving family member, "Not found" feels like their loved one was forgotten. This is emotionally charged context. | Empathetic empty states: "We couldn't find that name. Please check the spelling, or try a partial name. You can also browse all flags in the directory below." Never imply the person does not exist. |
| Making the organizer view and visitor view the same interface | Visitors see edit buttons, confusing UI, or accidentally navigate to admin features | Completely separate visitor and organizer experiences. Visitors get a single-purpose search + map. Organizers get a management dashboard. Different URL paths, different layouts. |
| Tiny tap targets on mobile map | Users tap the wrong flag, cannot select their target, or accidentally trigger zoom/pan instead of selection | Minimum 44x44px tap targets. On a dense grid, consider tap-to-zoom into a section first, then tap individual flags. Or bypass the problem entirely by auto-selecting the searched flag. |
| Requiring app installation or account creation | Visitors will not install an app or create an account to find a flag at a one-day event | Web app, no login, no installation. Consider adding "Add to Home Screen" prompt for PWA but never require it. |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Search feature:** Test with names containing apostrophes (O'Brien), hyphens (Smith-Jones), accents (Hernandez vs Hernandez), suffixes (Jr., Sr., III), and military rank prefixes (Sgt., Cpl.) -- these commonly break naive search
- [ ] **Grid layout:** Verify the digital grid matches the physical field by checking at least 3 positions in person before going live
- [ ] **Mobile responsiveness:** Test on an actual phone held in sunlight outdoors, not just with browser devtools responsive mode
- [ ] **Offline capability:** Test the app in airplane mode after initial load -- search should still work
- [ ] **Event-day load:** Simulate 50+ concurrent users loading the app simultaneously (even a simple load test matters)
- [ ] **Name completeness:** Verify every flag in the physical field has a corresponding digital entry -- missing records are worse than no app at all
- [ ] **Orientation context:** A visitor standing at the field entrance can use the app to figure out which direction Row 1 is, without asking anyone
- [ ] **Empty/error states:** Every possible error state has been given actual copy, not default framework messages
- [ ] **Font size:** The row/position result text is readable at arm's length on a phone screen (at least 24px)

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Map-to-field mismatch discovered on event day | MEDIUM | Immediately add a text banner: "Positions may be approximate. Ask a volunteer for help." Update the most critical mismatches in real-time via the organizer panel. Post-event, do a full audit. |
| App is down/unreachable on event day | HIGH | Have a printed backup: a simple alphabetical list with positions. Generate this as a PDF export from the organizer panel the night before. This is essential disaster recovery. |
| Search returns no results for a name that should exist | LOW | Organizer can add/fix the entry in real-time via the admin panel on their phone. Build the organizer CRUD to work on mobile for this exact scenario. |
| Data entry errors discovered during the event | MEDIUM | Organizer makes corrections via mobile admin panel. Changes should propagate immediately to cached client data (add a "refresh data" button or auto-poll for updates every 5 minutes). |
| Connectivity issues at the venue | LOW (if prepared) | If service worker is implemented, app works offline. If not, the printed PDF backup is the fallback. |
| Multiple organizers overwrite each other's changes | MEDIUM | For v1, designate one primary data entry person. For future versions, implement last-write-wins with a change log so overwrites can be detected and reversed. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Map-to-field position mismatch | Phase 1 (Data Model) | Grid setup UX forces explicit orientation; organizer can describe the origin point and numbering direction |
| No offline fallback | Phase 1 (Architecture) | App works in airplane mode after first load; verified by testing |
| Sunlight-unreadable UI | Phase 2 (UI/Map) | Outdoor phone test completed; contrast ratios meet AAA (7:1 minimum) |
| Search fails on name variations | Phase 1 (Search) | Test suite covers O'Brien, Smith-Jones, partial matches, typos; zero-result state is empathetic |
| Data entry chaos | Phase 1 (Organizer CRUD) | Duplicate position validation exists; CSV import works; audit view shows completeness |
| Map frustrates instead of helps | Phase 2 (Map) | Post-search auto-zoom works; searched flag is visually unmistakable; physical landmark present |
| Insensitive empty states | Phase 2 (UI Polish) | All error/empty states have reviewed copy; no generic "Not found" messages |
| No printed backup | Phase 1 (Export) | PDF/print export generates a clean alphabetical directory with positions |
| Event-day data correction impossible | Phase 1 (Organizer CRUD) | Organizer panel works on mobile; changes propagate to visitors within 5 minutes |

## Sources

- [Map UI Design Best Practices](https://www.eleken.co/blog-posts/map-ui-design) -- Map interaction patterns and mobile pitfalls
- [Interactive Map Design UX](https://traveltime.com/blog/interactive-map-design-ux-mobile-desktop) -- Mobile map design considerations
- [SeatGeek Canvas Map Performance](https://chairnerd.seatgeek.com/high-performance-map-interactions-using-html5-canvas/) -- Grid map rendering performance (SVG vs Canvas)
- [MDN: PWA Offline Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation) -- Service worker and offline patterns
- [Building PWAs in 2025](https://medium.com/@ancilartech/building-real-progressive-web-apps-in-2025-lessons-from-the-trenches-23422e1970d6) -- Real-world PWA lessons
- [Sunlight Susceptible Screens UX](https://medium.com/@callumjcoe/industrial-ux-sunlight-susceptible-screens-2e52b1d9706b) -- Outdoor readability design patterns
- [Outdoor Mobile App Design Factors](https://www.researchgate.net/post/What-design-factors-should-I-consider-when-designing-a-mobile-app-for-outdoor-use) -- Research on outdoor app constraints
- [Find a Grave App](https://apps.apple.com/us/app/find-a-grave/id732952190) -- Cemetery finder UX problems (user reviews)
- [ANC Explorer App](https://apps.apple.com/us/app/anc-explorer/id562937243) -- Arlington National Cemetery app navigation issues
- [Wayfinding UX Tips](https://situm.com/docs/tips-for-building-your-wayfinding-ux/) -- Navigation and wayfinding UX patterns
- [Fuzzy Name Matching in PostgreSQL](https://www.crunchydata.com/blog/fuzzy-name-matching-in-postgresql) -- Fuzzy search implementation patterns
- [Google Cloud: What is Fuzzy Search](https://cloud.google.com/discover/what-is-fuzzy-search) -- Fuzzy search overview
- [BIRLS Veterans Database](https://www.birls.org/) -- Real-world veteran name search with phonetic matching
- [Designing for High-Traffic Events](https://www.smashingmagazine.com/2025/01/designing-high-traffic-events-cloudways/) -- Event-day traffic spike handling
- [Duplicate Attendee Records Prevention](https://www.fielddrive.com/blog/prevent-duplicate-attendee-records-check-in) -- Event data deduplication strategies
- [GPS Battery Optimization](https://metova.com/how-to-implement-geolocation-without-draining-your-users-battery/) -- Avoid unnecessary GPS drain
- [Color Contrast in UX](https://developerux.com/2025/07/28/best-practices-for-accessible-color-contrast-in-ux/) -- Accessible contrast standards
- [Error Messages in UX Design](https://digitalthriveai.com/en-us/resources/web-design/error-messages-ux-design/) -- Empathetic error state design

---
*Pitfalls research for: Memorial flag event tracking / field-of-flags management*
*Researched: 2026-04-06*
