# Phase 2: Visitor Search - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

A family member can search a veteran's name on their phone and immediately see where the flag is located, even with imperfect spelling. Public fuzzy name search returning human-readable flag locations. The interactive visual map is Phase 3 — this phase delivers search + text-based location results.

</domain>

<decisions>
## Implementation Decisions

### Search Experience
- **D-01:** Search IS the homepage. Root (/) becomes the visitor search page. Move the admin import page to a less prominent route (e.g., /admin).
- **D-02:** Instant results as user types with short debounce (~200ms). No submit button needed.
- **D-03:** Hero search — large, centered search bar front and center (Google-style). The search IS the page.
- **D-04:** Brief welcome message above the search bar explaining what this is and how to use it (e.g., event name, "Search for a veteran's flag").

### Result Display
- **D-05:** Result cards — each match gets its own card with name, row, and position. Reuses existing Card component from Phase 1.
- **D-06:** Each result shows: veteran name + human-readable location ("Row B, Position 12"). Map link placeholder for Phase 3.
- **D-07:** Show all matches at once. With ~100 flags, no pagination or "show more" needed.

### Fuzzy Matching
- **D-08:** Moderate fuzzy tolerance — handles typos and close misspellings ("Smth" -> "Smith", "Jhon" -> "John"). No nickname matching (Bobby/Robert). Client-side fuzzy search (already decided in PROJECT.md for offline resilience at events).
- **D-09:** Partial name matching works — typing "Smith" finds all Smiths, typing "John" finds all Johns. Searches across the full name string.
- **D-10:** Results ranked by best match quality first, weaker matches below.

### Not-Found Experience
- **D-11:** Helpful and practical tone — focus on next steps, not emotional language. Direct and action-oriented.
- **D-12:** Fallback guidance: link to the full A-Z directory (/directory from Phase 1) plus spelling tips ("Try searching by last name only", "Check for alternate spellings").
- **D-13:** No "did you mean" suggestions. Keep it simple.
- **D-14:** If no flags are imported, hide the search bar entirely and show a setup/coming-soon message instead of a non-functional search. Clearly different from "no results for that name."
- **D-15:** Initial state before typing: just the welcome message + hero search bar. No content below until the visitor starts typing.

### Claude's Discretion
- Specific fuzzy search library choice (Fuse.js, etc.) and configuration
- Exact debounce timing
- Welcome message wording and styling
- Result card layout details and spacing
- Admin route path reorganization
- "No data imported" / coming-soon message design
- How to load all flags client-side (fetch on mount, SSR, etc.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Search requirements
- `.planning/REQUIREMENTS.md` — SRCH-01 (name search), SRCH-02 (row/position display), SRCH-04 (fuzzy/typo-tolerant), SRCH-05 (empathetic not-found)
- `.planning/PROJECT.md` — Core value statement, key decision on client-side fuzzy search for offline resilience

### Phase context
- `.planning/ROADMAP.md` §Phase 2 — Success criteria and phase goal
- `.planning/phases/01-data-foundation/01-CONTEXT.md` — Phase 1 decisions (data model, Supabase setup, directory page)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/card.tsx` — Card component for displaying search results
- `src/components/ui/button.tsx` — Button component
- `src/components/ui/badge.tsx` — Badge for status indicators
- `src/lib/supabase/client.ts` — Browser-side Supabase client for fetching flags
- `src/lib/supabase/server.ts` — Server-side Supabase client for SSR data loading

### Established Patterns
- Supabase for data access — flags stored in `flags` table with `{ id, name, row_label, position, created_at }`
- `src/lib/types/flag.ts` — Flag and FlagInsert types already defined
- GET `/api/flags/import` returns all flags sorted by name — could serve as data source for client-side search
- Tailwind CSS with Inter font, shadcn/ui component library
- Next.js App Router with server/client component split

### Integration Points
- Root `/` currently redirects to `/admin` — needs to become the search homepage
- `/directory` page from Phase 1 — linked from not-found fallback guidance
- Flag data from Supabase `flags` table is the search data source
- Phase 3 will add "View on Map" links to search result cards

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

*Phase: 02-visitor-search*
*Context gathered: 2026-04-12*
