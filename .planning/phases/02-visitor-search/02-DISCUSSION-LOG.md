# Phase 2: Visitor Search - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-12
**Phase:** 02-visitor-search
**Areas discussed:** Search experience, Result display, Fuzzy matching behavior, Not-found experience

---

## Search Experience

| Option | Description | Selected |
|--------|-------------|----------|
| Homepage | Search IS the homepage. Visitor lands and immediately sees search bar. | ✓ |
| Dedicated /search route | Separate search page. Homepage becomes a landing/welcome page with link to search. | |
| /admin stays, search at / | Move admin to less prominent route. Root becomes visitor search. | |

**User's choice:** Homepage
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Instant results | Results update live as user types, with short debounce (~200ms). No submit button. | ✓ |
| Submit button | User types full name, hits Search button. | |
| Instant + submit fallback | Results show live, but also has a search button. | |

**User's choice:** Instant results
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Hero search | Large, centered search bar front and center. Google-style. | ✓ |
| Top bar search | Search input in a navigation/header bar. Compact. | |
| Card with search | Search bar inside a card component with title and instructions. | |

**User's choice:** Hero search
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal header + search | Event name/title, then straight to search. | |
| Brief welcome message | Short paragraph explaining what this is and how to use it. | ✓ |
| Just the search bar | Nothing else — pure search. | |

**User's choice:** Brief welcome message
**Notes:** None

---

## Result Display

| Option | Description | Selected |
|--------|-------------|----------|
| Result cards | Each match gets its own card with name, row, position. Uses existing Card component. | ✓ |
| Compact list | Tighter rows, more results visible at once. | |
| Single result highlight | Prominent single result for exact match, compact list for multiple. | |

**User's choice:** Result cards
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Name + location | Veteran name and "Row B, Position 12" format. Map link placeholder for Phase 3. | ✓ |
| Name + location + map preview | Same plus small map thumbnail. Brings Phase 3 work forward. | |
| Name + location + match quality | Show how close the match is ("Exact match" vs "Similar name"). | |

**User's choice:** Name + location
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| All matches | Show every match. ~100 flags means no pagination needed. | ✓ |
| Top 5 with "show more" | Show best 5 matches, expandable. | |
| Top 10 | Fixed cap at 10 results. | |

**User's choice:** All matches
**Notes:** None

---

## Fuzzy Matching Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Moderate fuzzy | Handles typos and close misspellings. No nickname matching. Fast, predictable. | ✓ |
| Aggressive fuzzy | Typos PLUS nickname variants (Bobby -> Robert). Requires nickname dictionary. | |
| Exact + prefix only | Only exact names or names starting with typed text. | |

**User's choice:** Moderate fuzzy
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — first or last name | Typing "Smith" finds all Smiths. Searches across full name string. | ✓ |
| Full name only | Only matches against the complete name. | |
| Last name priority | Searches last name first, then first name. | |

**User's choice:** Yes — first or last name
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Best match first | Closest fuzzy match at top, weaker matches below. | ✓ |
| Alphabetical | Results sorted A-Z regardless of match quality. | |
| By location | Results sorted by row then position. | |

**User's choice:** Best match first
**Notes:** None

---

## Not-Found Experience

| Option | Description | Selected |
|--------|-------------|----------|
| Warm and empathetic | Acknowledges memorial context. Gentle, respectful tone. | |
| Helpful and practical | Focus on next steps rather than emotion. Direct, action-oriented. | ✓ |
| Minimal | Simple "No results found" with suggestions. Neutral. | |

**User's choice:** Helpful and practical
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Link to directory | "Browse the full directory" link to A-Z directory from Phase 1. | |
| Directory + spelling tips | Link to directory PLUS suggestions like "Try last name only." | ✓ |
| Directory + contact info | Directory plus organizer contact info. | |

**User's choice:** Directory + spelling tips
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| No suggestions | No "Did you mean...?" — keep simple for memorial context. | ✓ |
| Closest matches | Show 2-3 closest fuzzy matches as links. | |
| Popular/recent searches | Show what others searched for. | |

**User's choice:** No suggestions
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — distinguish them | "No flags imported yet" vs "No results for that name." Different guidance. | |
| Same message for both | One generic empty state regardless. | |
| Hide search entirely if no data | Show setup/coming-soon message instead of non-functional search bar. | ✓ |

**User's choice:** Hide search entirely if no data
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Just the search bar | Welcome message + hero search bar. Nothing below until typing. | ✓ |
| Show total flag count | "Search among 127 flags" below the search bar. | |
| Show recent/random names | Display a few flag names as examples. | |

**User's choice:** Just the search bar
**Notes:** None

---

## Claude's Discretion

- Specific fuzzy search library choice and configuration
- Exact debounce timing
- Welcome message wording and styling
- Result card layout details and spacing
- Admin route path reorganization
- "No data imported" message design
- How to load all flags client-side

## Deferred Ideas

None — discussion stayed within phase scope
