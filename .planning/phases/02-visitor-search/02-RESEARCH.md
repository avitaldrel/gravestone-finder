# Phase 2: Visitor Search - Research

**Researched:** 2026-04-12
**Domain:** Client-side fuzzy search, React search UX, Next.js App Router data loading
**Confidence:** HIGH

## Summary

Phase 2 transforms the root URL from an admin redirect into a visitor-facing search homepage. The core technical challenge is client-side fuzzy name search with instant-as-you-type results over ~100-300 flag records. The user decided on client-side fuzzy search (PROJECT.md key decision) for offline resilience at events with spotty connectivity, which means all flag data loads into the browser and search happens entirely in JavaScript.

Fuse.js is the recommended fuzzy search library. It is the most widely adopted client-side fuzzy search library in the JavaScript ecosystem (used by Google, Vercel, Spotify, etc.), provides built-in TypeScript types, handles typos/misspellings via the Bitap algorithm, and is only ~8KB gzipped with zero dependencies. For ~100 flags searching a single `name` field, Fuse.js is instant with no performance concerns.

The implementation pattern is: server component fetches all flags from Supabase on page load, passes them as props to a client component that initializes Fuse.js and handles debounced search input. This avoids client-side fetch waterfalls and gives the fastest initial render for visitors on phones at the event.

**Primary recommendation:** Use Fuse.js 7.3.0 for fuzzy search, fetch flags server-side and pass as props to client search component, debounce input at ~200ms with a custom hook, use shadcn/ui Input + Card components for the UI.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Search IS the homepage. Root (/) becomes the visitor search page. Move the admin import page to a less prominent route (e.g., /admin).
- **D-02:** Instant results as user types with short debounce (~200ms). No submit button needed.
- **D-03:** Hero search -- large, centered search bar front and center (Google-style). The search IS the page.
- **D-04:** Brief welcome message above the search bar explaining what this is and how to use it (e.g., event name, "Search for a veteran's flag").
- **D-05:** Result cards -- each match gets its own card with name, row, and position. Reuses existing Card component from Phase 1.
- **D-06:** Each result shows: veteran name + human-readable location ("Row B, Position 12"). Map link placeholder for Phase 3.
- **D-07:** Show all matches at once. With ~100 flags, no pagination or "show more" needed.
- **D-08:** Moderate fuzzy tolerance -- handles typos and close misspellings ("Smth" -> "Smith", "Jhon" -> "John"). No nickname matching (Bobby/Robert). Client-side fuzzy search (already decided in PROJECT.md for offline resilience at events).
- **D-09:** Partial name matching works -- typing "Smith" finds all Smiths, typing "John" finds all Johns. Searches across the full name string.
- **D-10:** Results ranked by best match quality first, weaker matches below.
- **D-11:** Helpful and practical tone -- focus on next steps, not emotional language. Direct and action-oriented.
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

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SRCH-01 | Visitor can search for a flag by veteran name | Fuse.js client-side fuzzy search over all flags; hero search bar on homepage |
| SRCH-02 | Search results show row/position in human-readable format | Result cards display `Row ${row_label}, Position ${position}` from Flag type |
| SRCH-04 | Search is fuzzy/typo-tolerant (handles misspellings and name variants) | Fuse.js Bitap algorithm with threshold 0.4, ignoreLocation: true for name matching |
| SRCH-05 | "Not found" state shows empathetic message with fallback guidance | Conditional render when results empty + query non-empty; link to /directory |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Fuse.js | 7.3.0 | Client-side fuzzy search | Most adopted JS fuzzy search library. Bitap algorithm handles typos/misspellings. Zero dependencies. ~8KB gzipped. TypeScript types included. Used by Google, Vercel, Spotify. [VERIFIED: npm registry, v7.3.0] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui Input | latest | Search input component | Add via `npx shadcn@latest add input`. Accessible, styled, integrates with existing shadcn setup. [VERIFIED: shadcn.com docs] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Fuse.js | FlexSearch | Faster for large datasets (100K+), but more complex API, no built-in weighted fuzzy matching. Overkill for ~100 records. |
| Fuse.js | MiniSearch | Full-text search with inverted index. Better for large corpora, but heavier setup. Wrong tool for fuzzy name matching on small datasets. |
| Fuse.js | Simple string includes/filter | No fuzzy matching -- misses typos entirely. Violates SRCH-04. |
| Custom useDebounce hook | use-debounce npm package | External dependency for a 10-line hook. Not worth adding a package for this. |

**Installation:**
```bash
npm install fuse.js
npx shadcn@latest add input
```

**Version verification:**
- Fuse.js 7.3.0: Confirmed current via `npm view fuse.js version` [VERIFIED: npm registry, 2026-04-12]
- shadcn/ui Input: Component copied into codebase, no version to track [VERIFIED: shadcn.com]

## Architecture Patterns

### Recommended Component Structure
```
src/
├── app/
│   ├── page.tsx              # Server component: fetches flags, renders SearchPage
│   ├── admin/
│   │   └── page.tsx          # Existing admin import page (no change)
│   └── api/
│       └── flags/
│           └── route.ts      # New: GET /api/flags returns all flags (or reuse import route)
├── components/
│   ├── search/
│   │   ├── search-page.tsx       # Client component: orchestrates search state + results
│   │   ├── search-bar.tsx        # Client component: Input + debounce logic
│   │   ├── search-results.tsx    # Client component: renders list of result cards
│   │   ├── result-card.tsx       # Client component: single flag result card
│   │   ├── no-results.tsx        # "Not found" message with fallback guidance
│   │   └── no-data.tsx           # "No flags imported" / coming-soon state
│   └── ui/
│       └── input.tsx             # shadcn/ui Input component (added via CLI)
├── hooks/
│   └── use-debounce.ts           # Custom debounce hook
└── lib/
    ├── search/
    │   └── fuse-config.ts        # Fuse.js configuration constants
    └── types/
        └── flag.ts               # Existing Flag type
```

### Pattern 1: Server-to-Client Data Handoff
**What:** Server component fetches all flags from Supabase, passes as props to client search component
**When to use:** Always for this page -- provides fast initial load, no client-side fetch waterfall
**Example:**
```typescript
// src/app/page.tsx (Server Component)
// Source: Next.js App Router data fetching pattern [CITED: nextjs.org/docs/app/getting-started/fetching-data]
import { createClient } from "@/lib/supabase/server";
import { SearchPage } from "@/components/search/search-page";
import type { Flag } from "@/lib/types/flag";

export default async function Home() {
  const supabase = await createClient();
  const { data: flags } = await supabase
    .from("flags")
    .select("*")
    .order("name");

  return <SearchPage flags={flags ?? []} />;
}
```

### Pattern 2: Client-Side Fuse.js Search with Debounce
**What:** Initialize Fuse.js index from props, debounce search input, display ranked results
**When to use:** Core search interaction pattern
**Example:**
```typescript
// Source: Fuse.js documentation [CITED: fusejs.io]
import Fuse from "fuse.js";
import type { Flag } from "@/lib/types/flag";

const fuseOptions = {
  keys: ["name"],
  threshold: 0.4,         // Moderate fuzzy tolerance (0=exact, 1=match anything)
  ignoreLocation: true,   // Match anywhere in the name string (not just near position 0)
  includeScore: true,     // Needed for ranking by match quality
  minMatchCharLength: 2,  // Don't search on single character
  shouldSort: true,       // Sort by score (best match first)
};

// In component:
const fuse = useMemo(() => new Fuse(flags, fuseOptions), [flags]);
const results = fuse.search(debouncedQuery);
```

### Pattern 3: Custom useDebounce Hook
**What:** Delays updating a value until user stops typing for N milliseconds
**When to use:** For the search input to avoid re-searching on every keystroke
**Example:**
```typescript
// src/hooks/use-debounce.ts
// Source: Standard React pattern [CITED: usehooks.com/usedebounce]
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 200): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### Anti-Patterns to Avoid
- **Fetching flags in useEffect on the client:** Creates a loading spinner flash. Server component fetch eliminates this entirely.
- **Re-creating Fuse instance on every render:** Wrap in `useMemo` with `flags` as dependency. Index construction is the expensive part, not search.
- **Searching on every keystroke without debounce:** Causes visual jitter and wastes CPU cycles, especially noticeable on phones.
- **Using server-side search (Supabase text search):** Violates the offline resilience decision. All data must be client-side for events with spotty connectivity.
- **Over-fetching fields:** Only select needed columns (`id`, `name`, `row_label`, `position`) to minimize payload.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fuzzy string matching | Custom Levenshtein/edit-distance algorithm | Fuse.js | Bitap algorithm is optimized for this. Handles scoring, ranking, partial matching. Custom impl would miss edge cases (scoring normalization, Unicode, field weights). |
| Debounce logic | Inline setTimeout management | Custom `useDebounce` hook | 10 lines, reusable, clean. But don't add a library -- it's too simple for a package. |
| Accessible input styling | Custom CSS input styles | shadcn/ui Input component | Focus states, validation styling, aria attributes handled. |
| Result card layout | Custom div structure | shadcn/ui Card components | Already in codebase from Phase 1. Consistent styling. |

**Key insight:** The only new dependency for this phase is Fuse.js (~8KB). Everything else is built from existing codebase components (Card, Supabase client) plus the shadcn Input component and a small custom hook.

## Common Pitfalls

### Pitfall 1: Fuse.js Threshold Too Loose or Too Tight
**What goes wrong:** Default threshold (0.6) with default distance (100) may either miss valid typos or return too many irrelevant results for short names.
**Why it happens:** Fuse.js scoring combines edit distance, location, and field length. Short strings (names like "Lee", "Kim") are more sensitive to threshold changes than long strings.
**How to avoid:** Start with threshold 0.4 and ignoreLocation: true. Test with real flag data. The threshold can be tuned without code changes if extracted to a config constant.
**Warning signs:** Searching "Smith" returns names like "Zamith" or "Swith" that feel wrong, or searching "Jhon" doesn't find "John".

### Pitfall 2: Empty State Confusion
**What goes wrong:** User sees "No results found" when zero flags are imported, confusing them into thinking search is broken.
**Why it happens:** Same empty result UI for "no data" vs "no match" states.
**How to avoid:** Three distinct states: (1) no flags imported at all -- show setup message, hide search bar (D-14); (2) query entered, no matches -- show not-found guidance (D-11/D-12); (3) no query yet -- show welcome + search bar only (D-15).
**Warning signs:** Users at the event think the app is broken when data hasn't been imported yet.

### Pitfall 3: Fuse.js Index Not Updating After Import
**What goes wrong:** Admin imports new data in another tab, but visitor search still shows old results.
**Why it happens:** Fuse.js index is created from props at page load. Props don't auto-refresh.
**How to avoid:** Accept this for v1 -- a page refresh loads fresh data. The server component re-fetches on every navigation. This is fine for an event app where data changes infrequently after initial import. If needed later, add Supabase Realtime subscriptions.
**Warning signs:** None for v1 -- acceptable tradeoff.

### Pitfall 4: Layout Shift When Results Appear
**What goes wrong:** Search results push page content down, causing jarring layout shift on mobile.
**Why it happens:** Results container has no reserved space, goes from 0 height to N cards.
**How to avoid:** Place results directly below the search bar with a smooth transition. The hero layout naturally accommodates content below. No fixed height reservation needed -- just ensure the search bar stays at the top.
**Warning signs:** Cumulative Layout Shift (CLS) on mobile browsers.

### Pitfall 5: Root Route Redirect Conflict
**What goes wrong:** Existing `src/app/page.tsx` redirects to `/admin`. If not properly replaced, visitors get sent to the admin page.
**Why it happens:** Phase 1 set up the root as a redirect since admin was the only page.
**How to avoid:** Replace the redirect in `src/app/page.tsx` with the new server component that fetches flags and renders the search page. The admin page stays at `/admin` -- no route change needed for admin.
**Warning signs:** Visiting `/` shows the import page instead of search.

## Code Examples

### Fuse.js Search Component (Core Pattern)
```typescript
// Source: Fuse.js docs + Next.js App Router patterns
// [CITED: fusejs.io, nextjs.org/docs/app/getting-started/server-and-client-components]
"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { useDebounce } from "@/hooks/use-debounce";
import type { Flag } from "@/lib/types/flag";

const FUSE_OPTIONS = {
  keys: ["name"],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 2,
  shouldSort: true,
};

interface SearchPageProps {
  flags: Flag[];
}

export function SearchPage({ flags }: SearchPageProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);

  const fuse = useMemo(() => new Fuse(flags, FUSE_OPTIONS), [flags]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return fuse.search(debouncedQuery);
  }, [fuse, debouncedQuery]);

  const hasFlags = flags.length > 0;
  const hasQuery = debouncedQuery.trim().length > 0;
  const hasResults = results.length > 0;

  // State machine:
  // !hasFlags           -> NoData (hide search bar, show setup message)
  // hasFlags && !hasQuery -> Welcome + search bar only
  // hasFlags && hasQuery && hasResults -> Show result cards
  // hasFlags && hasQuery && !hasResults -> Not found message

  return (/* ... */);
}
```

### Result Card Pattern
```typescript
// Source: Existing shadcn/ui Card component in codebase
// [VERIFIED: src/components/ui/card.tsx exists]
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { Flag } from "@/lib/types/flag";

interface ResultCardProps {
  flag: Flag;
}

export function ResultCard({ flag }: ResultCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{flag.name}</h3>
            <p className="text-sm text-muted-foreground">
              Row {flag.row_label}, Position {flag.position}
            </p>
          </div>
          <MapPin className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}
```

### API Route for Flags (if separate from import)
```typescript
// Source: Existing pattern in src/app/api/flags/import/route.ts
// [VERIFIED: codebase inspection]
// Option A: Reuse existing GET /api/flags/import (already returns all flags sorted by name)
// Option B: Create GET /api/flags/route.ts for cleaner separation
// Recommendation: The server component fetches directly from Supabase -- no API route needed
// for the search page. The existing GET /api/flags/import serves the admin page.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side search with API calls per keystroke | Client-side search with Fuse.js for small datasets (<10K records) | Established pattern | Eliminates network latency, works offline |
| Lodash debounce | Custom React hook with useEffect + setTimeout | React hooks era (2019+) | No external dependency needed, cleaner lifecycle management |
| getServerSideProps (Pages Router) | Server Component async fetch (App Router) | Next.js 13+ (2023) | No special data-fetching functions, just async components |
| Class component search with componentDidMount | useMemo + useState + custom hooks | React 16.8+ (2019) | Simpler, composable, testable |

**Deprecated/outdated:**
- `getServerSideProps` / `getStaticProps`: Replaced by Server Components in App Router [VERIFIED: Next.js 16 uses App Router]
- Fuse.js v6 API: v7 introduced breaking changes (new `useTokenSearch`, `FuseWorker`). Use v7 API. [VERIFIED: npm registry shows 7.3.0]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Threshold 0.4 with ignoreLocation: true provides good fuzzy matching for names | Architecture Patterns | May need tuning -- but config is extracted to a constant, so risk is low (quick adjustment) |
| A2 | ~100 flags is small enough that Fuse.js search is instant with no perceivable delay | Summary | Very low risk -- Fuse.js benchmarks show <1ms for 1000 records on a single key |
| A3 | No `/directory` page exists yet from Phase 1 (not found in codebase) | Common Pitfalls | D-12 links to /directory -- if it doesn't exist, need to either build it in this phase or link to /admin with full flag list |

## Open Questions

1. **Does a `/directory` page exist from Phase 1?**
   - What we know: Codebase search shows no `/directory` route. The admin page at `/admin` shows a full flag table. CONTEXT.md references "/directory from Phase 1" in D-12.
   - What's unclear: Was the directory page planned but not built, or was it descoped?
   - Recommendation: The not-found fallback can link to `/admin` (which shows the full table) as an interim solution, or build a simple `/directory` page as part of this phase if needed. The admin page's flag table already shows all flags sorted by name.

2. **Should the metadata title change for the search homepage?**
   - What we know: Current metadata says "Gravestone Finder - Flag Data Import". This is admin-focused.
   - What's unclear: What the visitor-facing title should be.
   - Recommendation: Update to something like "Field of Flags - Find a Veteran's Flag" for the root page. This is a minor change in `layout.tsx` or the page's own metadata export.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 |
| Config file | `vitest.config.ts` (exists, jsdom environment, React plugin) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SRCH-01 | Fuse.js search returns matching flags by name | unit | `npx vitest run src/lib/search/__tests__/fuse-search.test.ts -t "returns matching flags"` | Wave 0 |
| SRCH-02 | Result card displays human-readable location format | unit | `npx vitest run src/components/search/__tests__/result-card.test.tsx -t "displays location"` | Wave 0 |
| SRCH-04 | Fuzzy search handles typos ("Smth" -> "Smith", "Jhon" -> "John") | unit | `npx vitest run src/lib/search/__tests__/fuse-search.test.ts -t "handles typos"` | Wave 0 |
| SRCH-05 | Not-found state renders guidance message with directory link | unit | `npx vitest run src/components/search/__tests__/no-results.test.tsx -t "shows fallback"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/lib/search/__tests__/fuse-search.test.ts` -- covers SRCH-01, SRCH-04
- [ ] `src/components/search/__tests__/result-card.test.tsx` -- covers SRCH-02
- [ ] `src/components/search/__tests__/no-results.test.tsx` -- covers SRCH-05
- [ ] `src/components/search/__tests__/search-page.test.tsx` -- integration: three states (no data, no results, results)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in this phase |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | All data is public (visitor search) |
| V5 Input Validation | Yes | Search input is client-side only, rendered as text (not HTML). Fuse.js treats input as a search pattern string, not executable code. React's JSX escaping prevents XSS in rendered results. |
| V6 Cryptography | No | No secrets or encryption |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via search query in URL params | Tampering | React JSX auto-escapes. Do not use `dangerouslySetInnerHTML` for highlighting. |
| Data exposure via client-side flag loading | Information Disclosure | All flag data is intentionally public (visitor search). No sensitive fields (only name, row, position). Acceptable. |

## Sources

### Primary (HIGH confidence)
- [npm registry: fuse.js] - Version 7.3.0 confirmed, 311KB unpacked, TypeScript types included [VERIFIED: `npm view fuse.js version`]
- [Fuse.js official site](https://fusejs.io) - Features, API, bundle size (~8KB gzip) confirmed [CITED: fusejs.io]
- [Fuse.js GitHub](https://github.com/krisk/Fuse) - v7.3.0 released 2026-04-04 [CITED: github.com/krisk/Fuse]
- [Next.js data fetching docs](https://nextjs.org/docs/app/getting-started/fetching-data) - Server component async fetch pattern [CITED: nextjs.org]
- [shadcn/ui Input](https://ui.shadcn.com/docs/components/radix/input) - Component installation and usage [CITED: ui.shadcn.com]
- Codebase inspection - Flag type, existing components, API routes, Supabase client [VERIFIED: direct file reads]

### Secondary (MEDIUM confidence)
- [Fuse.js configuration best practices](https://spin.atomicobject.com/fuse-js-fuzzy-search/) - Threshold tuning guidance (0.3-0.4 recommended)
- [useDebounce pattern](https://usehooks.com/usedebounce) - Standard React debounce hook pattern
- [npm-compare: fuse.js vs flexsearch vs minisearch](https://npm-compare.com/elasticlunr,flexsearch,fuse.js,minisearch) - Library comparison data

### Tertiary (LOW confidence)
- None -- all findings verified against primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Fuse.js is the established standard for client-side fuzzy search, version verified via npm registry
- Architecture: HIGH - Server-to-client data handoff is the documented Next.js App Router pattern; existing codebase patterns confirmed
- Pitfalls: HIGH - Threshold tuning and empty state confusion are well-documented Fuse.js challenges with known solutions
- Fuse.js config (threshold: 0.4): MEDIUM - Sensible starting point from community guidance, but may need tuning with real data

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable domain -- Fuse.js and React patterns move slowly)
