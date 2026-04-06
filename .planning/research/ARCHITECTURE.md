# Architecture Research

**Domain:** Memorial flag event management with interactive grid map
**Researched:** 2026-04-06
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
+---------------------------------------------------------------+
|                     Presentation Layer                         |
|  +------------------+  +-------------------+                  |
|  | Visitor Interface |  | Organizer Interface|                 |
|  | (public)         |  | (auth-protected)   |                 |
|  |  - Name search   |  |  - Flag CRUD       |                 |
|  |  - Grid map view |  |  - Layout editor   |                 |
|  |  - Directions    |  |  - Grid map editor |                 |
|  +--------+---------+  +---------+----------+                 |
|           |                      |                            |
+-----------+----------------------+----------------------------+
|                     Shared Components                         |
|  +------------------+  +-------------------+  +-----------+   |
|  | Grid Map Renderer|  | Search Engine     |  | Auth Gate |   |
|  | (SVG-based)      |  | (client-side      |  | (route    |   |
|  |                  |  |  fuzzy match)      |  |  guard)   |   |
|  +--------+---------+  +---------+----------+  +-----+-----+  |
|           |                      |                   |        |
+-----------+----------------------+-------------------+--------+
|                     Data / API Layer                          |
|  +------------------+  +-------------------+                  |
|  | Next.js Route    |  | Server Actions    |                  |
|  | Handlers (REST)  |  | (form mutations)  |                  |
|  +--------+---------+  +---------+----------+                 |
|           |                      |                            |
+-----------+----------------------+----------------------------+
|                     Persistence Layer                         |
|  +--------------------------------------------------+        |
|  | Supabase (PostgreSQL)                             |        |
|  |  - events table                                   |        |
|  |  - field_layouts table                            |        |
|  |  - flags table (name, row, position, status)      |        |
|  |  - users table (organizers only)                  |        |
|  +--------------------------------------------------+        |
+---------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Visitor Interface | Public-facing search and map view for family members | Next.js pages with SSR/ISR, no auth required |
| Organizer Interface | Auth-protected CRUD for flag data and field layout | Next.js pages behind auth guard, forms + data tables |
| Grid Map Renderer | Renders the field as an interactive SVG grid showing flag positions | Custom SVG component with viewBox scaling for responsiveness |
| Search Engine | Fuzzy name matching across ~100 flags | Client-side filter with simple fuzzy matching (no server roundtrip needed) |
| Auth Gate | Protects organizer routes from unauthorized access | Supabase Auth with route-level middleware |
| Route Handlers | REST API endpoints for flag CRUD and layout operations | Next.js App Router route handlers (app/api/) |
| Server Actions | Direct mutation path for organizer form submissions | Next.js Server Actions for create/update/delete |
| Supabase DB | Stores all persistent data with row-level security | PostgreSQL via Supabase client, RLS for public read / auth write |

## Recommended Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (visitor)/              # Route group: public pages
│   │   ├── page.tsx            # Landing / search page
│   │   ├── search/
│   │   │   └── page.tsx        # Search results with map highlight
│   │   └── map/
│   │       └── page.tsx        # Full field map view
│   ├── (organizer)/            # Route group: auth-protected pages
│   │   ├── layout.tsx          # Auth guard wrapper
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Overview of event + flag counts
│   │   ├── flags/
│   │   │   ├── page.tsx        # Flag list with CRUD
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # Add flag form
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Edit flag form
│   │   └── layout-editor/
│   │       └── page.tsx        # Define field grid layout
│   ├── api/                    # Route handlers
│   │   ├── flags/
│   │   │   ├── route.ts        # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       └── route.ts    # GET, PUT, DELETE single flag
│   │   └── layout/
│   │       └── route.ts        # GET, PUT field layout config
│   ├── layout.tsx              # Root layout
│   └── globals.css
├── components/
│   ├── map/
│   │   ├── FieldGrid.tsx       # Core SVG grid renderer
│   │   ├── FlagMarker.tsx      # Individual flag position in grid
│   │   ├── GridControls.tsx    # Zoom, pan controls
│   │   └── MapHighlight.tsx    # Search result highlight overlay
│   ├── search/
│   │   ├── SearchBar.tsx       # Name input with fuzzy matching
│   │   └── SearchResults.tsx   # Results list with map link
│   ├── flags/
│   │   ├── FlagForm.tsx        # Create/edit flag form
│   │   ├── FlagTable.tsx       # Sortable flag list for organizer
│   │   └── FlagCard.tsx        # Single flag display
│   ├── layout-editor/
│   │   ├── GridEditor.tsx      # Visual grid layout definition tool
│   │   ├── RowEditor.tsx       # Add/remove/resize rows
│   │   └── SectionEditor.tsx   # Define named sections
│   └── ui/                     # Shared UI primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server-side Supabase client
│   │   └── middleware.ts       # Auth middleware for protected routes
│   ├── search.ts               # Fuzzy search logic
│   ├── grid.ts                 # Grid math: row/col to SVG coords
│   └── types.ts                # Shared TypeScript types
└── hooks/
    ├── useFlags.ts             # Flag data fetching hook
    ├── useFieldLayout.ts       # Layout config hook
    └── useSearch.ts            # Search state + debounce hook
```

### Structure Rationale

- **app/(visitor)/ and app/(organizer)/:** Route groups cleanly separate public and protected pages without affecting URL structure. The organizer group gets a shared layout with auth guard.
- **components/map/:** The grid map is the most complex visual component and deserves its own module. Isolating FieldGrid, FlagMarker, and MapHighlight makes them testable and reusable across both visitor and organizer views.
- **lib/:** Pure logic (search algorithms, grid math, Supabase clients) stays outside of React component tree. This keeps components thin and logic testable.
- **hooks/:** Custom hooks encapsulate data fetching and state management, keeping components focused on rendering.

## Architectural Patterns

### Pattern 1: SVG Grid with ViewBox Scaling

**What:** Render the field layout as an SVG element where each flag position is a clickable `<rect>` or `<circle>`. Use the SVG `viewBox` attribute to make the grid scale responsively to any screen size.

**When to use:** When you have fewer than 1000 interactive elements and need accessibility (DOM events), resolution independence, and CSS styling. At ~100 flags, SVG is the right choice over Canvas.

**Trade-offs:** SVG elements live in the DOM, so each flag is individually addressable (click, hover, style). Performance is excellent up to ~1000 elements. For this project's scale (~100 flags), SVG provides the best developer experience with zero performance concerns.

**Example:**
```typescript
// FieldGrid.tsx - Core grid renderer
interface FieldGridProps {
  layout: FieldLayout;       // rows, columns, sections
  flags: Flag[];             // flag data with positions
  highlightId?: string;      // search result to highlight
  onFlagClick?: (flag: Flag) => void;
  editable?: boolean;        // true in organizer view
}

function FieldGrid({ layout, flags, highlightId, onFlagClick, editable }: FieldGridProps) {
  const { rows, cols, cellSize } = layout;
  const width = cols * cellSize;
  const height = rows * cellSize;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto max-h-[80vh]"
      role="img"
      aria-label="Field of flags layout"
    >
      {/* Grid background */}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <rect
            key={`cell-${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize}
            height={cellSize}
            className="fill-green-50 stroke-green-200"
          />
        ))
      )}

      {/* Flag markers */}
      {flags.map(flag => (
        <FlagMarker
          key={flag.id}
          flag={flag}
          cellSize={cellSize}
          highlighted={flag.id === highlightId}
          onClick={() => onFlagClick?.(flag)}
        />
      ))}
    </svg>
  );
}
```

### Pattern 2: Client-Side Fuzzy Search

**What:** Load all flag data into the browser and search client-side using a lightweight fuzzy matching library. With ~100 records, there is no benefit to server-side search -- client-side is instant and eliminates network latency.

**When to use:** Datasets under ~10,000 records where search responsiveness matters more than data freshness. The entire flag list for a single event fits in a single API response.

**Trade-offs:** Requires loading all data upfront (trivial at 100 records, ~5-10KB). Search is instant with zero server load. Fuzzy matching handles typos in veteran names.

**Example:**
```typescript
// lib/search.ts
export function searchFlags(flags: Flag[], query: string): Flag[] {
  if (!query.trim()) return [];
  const normalizedQuery = query.toLowerCase().trim();

  return flags
    .map(flag => ({
      flag,
      score: fuzzyScore(flag.veteranName.toLowerCase(), normalizedQuery),
    }))
    .filter(result => result.score > 0.3) // threshold
    .sort((a, b) => b.score - a.score)
    .map(result => result.flag);
}
```

### Pattern 3: Dual-View Architecture (Public/Protected)

**What:** The same data and grid component serve two contexts: a read-only visitor view and an editable organizer view. The grid component accepts an `editable` prop that enables/disables interaction modes. Auth is enforced at the route level, not the component level.

**When to use:** When two user types interact with the same data but have different permissions. Keeps code DRY while maintaining security.

**Trade-offs:** Component slightly more complex due to conditional behavior, but avoids duplicating the entire map rendering stack. Security is not dependent on the prop -- Supabase RLS enforces write permissions at the database level regardless.

### Pattern 4: Layout Config as JSON

**What:** Store the field layout definition (grid dimensions, section names, row labels) as a JSON column in the database rather than normalized tables. The organizer edits this config through a visual editor. The grid renderer consumes the config directly.

**When to use:** When the schema of the configuration is likely to evolve and the data is always read/written as a whole unit (not queried field-by-field).

**Trade-offs:** Flexible and fast to iterate on. No migrations needed when adding layout properties. Cannot query individual layout properties via SQL (rarely needed for this use case).

**Example:**
```typescript
// lib/types.ts
interface FieldLayout {
  id: string;
  eventId: string;
  rows: number;
  cols: number;
  cellSize: number;          // logical units
  sections: Section[];       // named areas of the grid
  labels: {
    rowPrefix: string;       // e.g., "Row" -> "Row 1, Row 2"
    positionPrefix: string;  // e.g., "Position" -> "Position 12"
  };
}

interface Section {
  name: string;              // e.g., "Section A"
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  color?: string;            // visual distinction
}
```

## Data Flow

### Visitor Search Flow

```
Family member types veteran name
    |
    v
SearchBar component (debounced input)
    |
    v
useSearch hook -> searchFlags(allFlags, query)
    |                    |
    |                    v
    |              Client-side fuzzy match
    |              (all flags already loaded)
    |
    v
SearchResults component
    |
    +---> Shows "Row 3, Position 12" text
    |
    +---> Highlights flag on FieldGrid (passes highlightId)
    |
    v
FieldGrid scrolls/zooms to highlighted flag
    |
    v
FlagMarker shows pulse animation + tooltip with name
```

### Organizer CRUD Flow

```
Organizer logs in (Supabase Auth)
    |
    v
Auth middleware validates session
    |
    v
Dashboard loads flag list via useFlags hook
    |
    v
Organizer clicks "Add Flag"
    |
    v
FlagForm component
    |-- veteran name (text input)
    |-- row (number or dropdown)
    |-- position (number or dropdown)
    |
    v
Server Action: createFlag(formData)
    |
    v
Supabase insert (RLS: requires auth)
    |
    v
Revalidate flag data -> UI updates
    |
    v
New flag appears in list AND on grid map
```

### Layout Definition Flow

```
Organizer opens Layout Editor
    |
    v
GridEditor loads current FieldLayout config
    |
    v
Organizer adjusts:
    +---> Grid dimensions (rows x cols)
    +---> Section boundaries (name, start/end row/col)
    +---> Row/position labels
    |
    v
Live preview: FieldGrid re-renders with new config
    |
    v
Save: Server Action updates layout JSON in Supabase
    |
    v
Visitor-facing grid immediately reflects changes
    (layout fetched fresh or via ISR revalidation)
```

### Key Data Flows

1. **Flag data fetch (visitor):** Page load -> Server Component fetches flags from Supabase -> passes to client components -> client stores in memory for instant search. With ISR (Incremental Static Regeneration), this page can be cached and revalidated every 60 seconds so visitors always see near-current data without hitting the DB on every request.

2. **Flag data mutation (organizer):** Form submission -> Next.js Server Action -> Supabase insert/update/delete (RLS enforced) -> revalidatePath() to bust cache -> updated data appears on next visitor load.

3. **Layout config:** Read once on page load (JSON column) -> parsed into TypeScript object -> consumed by FieldGrid for rendering. Rarely changes (set up once before event, maybe tweaked).

### State Management

This app does not need a global state management library. The state model is simple:

| State | Scope | Management |
|-------|-------|------------|
| Flag list | Page-level | Server Component prop / React Query or SWR |
| Search query | Component-level | useState in SearchBar |
| Search results | Derived | Computed from flag list + query (no separate state) |
| Highlighted flag | Component-level | useState, lifted to shared parent of search + grid |
| Layout config | Page-level | Server Component prop, refetched on edit |
| Auth session | App-level | Supabase Auth context (organizer routes only) |

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 event, ~100 flags | Monolith is perfect. Client-side search. SVG grid. ISR caching. Single Supabase project. |
| 5-10 events, ~500 flags total | Add event selector. Filter flags by event_id. Same architecture holds. |
| 50+ events, 5000+ flags | Consider server-side search (Supabase full-text search via pg_trgm). Paginate flag lists. SVG still fine at ~500 flags per event. |
| 100+ concurrent visitors | ISR caching handles this automatically. Supabase free tier supports this. No changes needed. |

### Scaling Priorities

1. **First bottleneck:** Not performance -- it is data management. As events multiply, the organizer needs multi-event management UI. The architecture supports this via event_id foreign keys, but the UI is scoped to single-event for v1.
2. **Second bottleneck:** Search across events (if ever needed). Would require server-side full-text search. Current client-side approach is per-event, which is fine for the foreseeable future.

## Anti-Patterns

### Anti-Pattern 1: Using a Real Map Library (Leaflet/Mapbox) for the Grid

**What people do:** Reach for Leaflet or Google Maps to render the flag field, treating it like a geographic map.
**Why it is wrong:** The field is a logical grid, not a geographic location. Map libraries add massive bundle size (Leaflet: ~40KB, Mapbox GL: ~200KB), require tile servers, and fight you when you try to render a simple row/column grid. You end up wrestling with lat/lng coordinates for something that is fundamentally a 10x10 grid.
**Do this instead:** Use SVG with a viewBox. The field is a rectangle with rows and columns. SVG handles this natively with zero dependencies. Save map libraries for if/when you need actual geolocation (driving directions to the event venue -- a separate concern from the flag grid).

### Anti-Pattern 2: Server-Side Search for Small Datasets

**What people do:** Build an API endpoint that queries the database on every keystroke, add debouncing, loading states, and error handling for network failures.
**Why it is wrong:** For ~100 records, the entire dataset is smaller than a single search API response. Server roundtrips add 50-200ms latency per keystroke. Network failures break search. The complexity of server-side search is wasted.
**Do this instead:** Load all flags on page mount. Search client-side with fuzzy matching. Instant results, zero latency, works offline after initial load.

### Anti-Pattern 3: Over-Normalizing the Layout Schema

**What people do:** Create separate tables for sections, rows, positions, and cells with foreign keys everywhere. A "flexible" schema that requires 4 JOINs to render a grid.
**Why it is wrong:** The layout is configured once and read as a unit. Normalizing it creates write complexity (multi-table transactions) and read complexity (JOINs) for zero benefit. The layout shape will evolve as you learn what organizers need.
**Do this instead:** Store layout config as a JSON/JSONB column. Read and write it as one unit. Validate shape in application code with TypeScript types. Migrate by updating the JSON schema, not running ALTER TABLE.

### Anti-Pattern 4: Building Separate Mobile and Desktop Apps

**What people do:** Build a "mobile version" and a "desktop version" with different codebases or heavily divergent UI paths.
**Why it is wrong:** Responsive CSS solves this. The grid SVG scales via viewBox. Tables become cards on mobile. One codebase, two experiences.
**Do this instead:** Mobile-first responsive design with Tailwind CSS. Test on phone-sized viewport from day one. The SVG grid is inherently responsive due to viewBox scaling.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Auth | @supabase/ssr package for Next.js middleware | Email/password for organizers. Visitors need no auth. |
| Supabase Database | @supabase/supabase-js client | PostgreSQL with RLS. Public read for flags, auth write for organizers. |
| Supabase Realtime | Optional: subscribe to flag changes | Not needed for v1. Could enable live updates if multiple organizers edit simultaneously. |
| Vercel (hosting) | Deploy via git push | Next.js optimized hosting. ISR works out of the box. Free tier sufficient for this scale. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Visitor pages <-> Flag data | Server Components fetch, pass as props | No client-side fetching for initial load. Hydrate for search. |
| Organizer pages <-> Flag data | Server Actions for mutations, useFlags hook for reads | Optimistic updates optional but nice for UX. |
| Grid Renderer <-> Flag/Layout data | Props only (no internal fetching) | FieldGrid is a pure rendering component. Data comes from parent. |
| Search <-> Grid | Shared state via lifted highlightId | Parent component owns both SearchBar and FieldGrid, passes highlight. |
| Auth <-> Routes | Middleware + layout-level guard | Supabase middleware checks session. Organizer layout redirects if unauthenticated. |

## Data Model

### Core Tables

```sql
-- Events (expandable to multi-event later)
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  date        DATE,
  location    TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Field layout stored as JSON for flexibility
CREATE TABLE field_layouts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID REFERENCES events(id) ON DELETE CASCADE,
  config      JSONB NOT NULL,  -- { rows, cols, cellSize, sections, labels }
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id)             -- one layout per event
);

-- Individual flags
CREATE TABLE flags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES events(id) ON DELETE CASCADE,
  veteran_name  TEXT NOT NULL,
  row           INTEGER NOT NULL,
  position      INTEGER NOT NULL,
  section       TEXT,           -- optional section label
  status        TEXT DEFAULT 'placed',  -- placed, removed, reserved
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, row, position)  -- no two flags in same spot
);

-- Organizer accounts (Supabase Auth handles credentials)
-- The auth.users table is managed by Supabase Auth.
-- RLS policies reference auth.uid() for write permissions.
```

### Row-Level Security

```sql
-- Flags: anyone can read, only authenticated users can write
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read flags"
  ON flags FOR SELECT
  USING (true);

CREATE POLICY "Auth write flags"
  ON flags FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Same pattern for events and field_layouts
```

## Build Order (Dependencies)

The architecture implies a specific build sequence based on component dependencies:

```
Phase 1: Foundation
  - Next.js project setup + Supabase connection
  - Database schema (events, flags, field_layouts tables)
  - Basic auth (organizer login)
  - TypeScript types for all data models

Phase 2: Organizer Core (data must exist before it can be displayed)
  - Flag CRUD (add, edit, delete flags)
  - Simple flag list/table view
  - Manual row/position assignment via form

Phase 3: Grid Map (depends on flag data existing)
  - SVG FieldGrid renderer
  - FlagMarker component
  - Responsive viewBox scaling
  - Read-only grid view (visitor)

Phase 4: Visitor Search (depends on flag data + grid map)
  - Client-side fuzzy search
  - Search results display
  - Grid highlight integration (search -> map)

Phase 5: Layout Editor (depends on grid map working)
  - Visual grid dimension editor
  - Section definition
  - Live preview with FieldGrid

Phase 6: Polish
  - Mobile responsive refinement
  - Animations (highlight pulse, search transitions)
  - Error handling and edge cases
  - Deploy to Vercel
```

**Build order rationale:** You cannot display flags until you can create them (Phase 2 before 3). You cannot search flags until the grid shows them (Phase 3 before 4). The layout editor is an enhancement to the grid, not a prerequisite -- organizers can define layout dimensions via simple form inputs in Phase 2 and get the visual editor later in Phase 5.

## Sources

- [Konva: How to Build an Interactive Seat Map with JavaScript Canvas](https://konvajs.org/docs/sandbox/Seats_Reservation.html)
- [Case study: Seats Reservation Widget with Javascript](https://lavrton.com/case-study-seat-reservation-widget/)
- [SVG vs Canvas: Understanding the Differences](https://dev.to/anisubhra_sarkar/svg-vs-canvas-understanding-the-differences-and-when-to-use-each-5cid)
- [SVG versus Canvas: Which technology to choose?](https://www.jointjs.com/blog/svg-versus-canvas)
- [CSS-Tricks: When to Use SVG vs Canvas](https://css-tricks.com/when-to-use-svg-vs-when-to-use-canvas/)
- [Next.js: Building APIs with Route Handlers](https://nextjs.org/blog/building-apis-with-nextjs)
- [Next.js: App Router Documentation](https://nextjs.org/docs/app)
- [Supabase vs Firebase 2026 Comparison](https://www.zignuts.com/blog/firebase-vs-supabase)
- [React Router: Private and Role-Based Routes](https://www.robinwieruch.de/react-router-private-routes/)
- [react-seatmap-creator on GitHub](https://github.com/cenksari/react-seatmap-creator)
- [Seatmap.pro Integration Guide](https://seatmap.pro/docs/)
- [Make any SVG responsive with React](https://blog.logrocket.com/make-any-svg-responsive-with-this-react-component/)

---
*Architecture research for: Memorial flag event management with interactive grid map*
*Researched: 2026-04-06*
