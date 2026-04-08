# Phase 1: Data Foundation - Research

**Researched:** 2026-04-07
**Domain:** CSV/Excel parsing, Supabase PostgreSQL, Next.js App Router data layer, print CSS
**Confidence:** HIGH

## Summary

Phase 1 establishes the data foundation: a Next.js 16 App Router project with Supabase as the backend, supporting CSV/Excel file import with validation, a "replace all" or "merge" import strategy, and a printable directory. Since this is a greenfield project, this phase also handles project scaffolding (create-next-app, Supabase client utilities, database schema, shadcn/ui setup).

The core technical challenges are: (1) parsing multiple spreadsheet formats (CSV + .xlsx) client-side with robust error handling, (2) designing a Supabase schema that supports full-text search for Phase 2 while keeping Phase 1 simple, (3) implementing drag-and-drop file upload with immediate processing and error feedback, and (4) building a print-optimized directory with two views (alphabetical and by-row).

**Primary recommendation:** Use SheetJS (xlsx) v0.20.3 installed from CDN tarball for multi-format parsing (CSV + Excel in one library), react-dropzone v15 for drag-and-drop, and Supabase with public RLS policies (no auth needed). Parse files entirely client-side, then batch insert to Supabase via the JS client.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Drag-and-drop upload zone with file picker fallback. Large visual drop area with hover/drop feedback.
- **D-02:** Import applies immediately on file drop -- no preview/confirmation step. Re-import to fix mistakes.
- **D-03:** After import, show summary + error list: "87 flags imported, 3 errors" with expandable error details (row number, issue description).
- **D-04:** No login or authentication needed. Import page is publicly accessible.
- **D-05:** Accept CSV, Excel (.xlsx), and other common spreadsheet formats. Use a parsing library that handles multiple formats.
- **D-06:** Provide a downloadable sample/template file with correct headers and example rows on the import page.
- **D-07:** Single admin page -- import zone at top, imported data summary below. No separate routes for import.
- **D-08:** Three expected columns: Name, Row, Position.
- **D-09:** Row identifiers accept both letters (A, B, C) and numbers (1, 2, 3). Normalize internally.
- **D-10:** Auto-detect whether first row is headers or data. If no headers, assume column order: Name, Row, Position.
- **D-11:** Extra columns in the spreadsheet trigger a warning listing unrecognized columns, but import still succeeds. Only the 3 expected columns are read.
- **D-12:** Store imported flag data in Supabase (PostgreSQL). Data persists across sessions, multiple visitors can search simultaneously.
- **D-13:** On re-import, prompt the organizer to choose "Replace all" or "Merge" before processing. Replace wipes existing data; Merge upserts by matching name/position.
- **D-14:** Print-styled page at a dedicated route (e.g., /directory) with print-optimized CSS. Organizer uses browser print (Ctrl+P). No PDF library needed.
- **D-15:** Two views on the directory page: (1) Alphabetical name lookup (Name -> Row, Position), and (2) By-row listing grouped by row with entries under each.

### Claude's Discretion
- Exact drag-and-drop component implementation
- Error message wording and styling
- Supabase table schema design
- Column auto-detection algorithm details
- Print CSS layout and typography
- How to normalize row identifiers internally (store as letters vs numbers)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| IMP-01 | Organizer can import flag data from a CSV/spreadsheet file (name, row, position) | SheetJS v0.20.3 handles CSV + XLSX + more. react-dropzone v15 for drag-and-drop. Client-side parsing, then Supabase insert. |
| IMP-02 | Import validates data and reports errors (missing names, duplicate positions, malformed rows) | Zod v4.3.6 schemas validate parsed rows. Build error accumulator that reports row number + issue. |
| IMP-03 | Re-importing replaces existing data (clean slate per import) | Supabase `.delete().gte('id', 0)` then `.insert()` for Replace All; `.upsert()` with onConflict for Merge. |
| ORG-01 | Organizer can generate a printable A-Z name-to-position directory | Print CSS with `@media print`, `break-inside: avoid`, dedicated /directory route. Two views: alpha and by-row. |

</phase_requirements>

## Standard Stack

### Core (Phase 1 specific)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.2 | Full-stack framework | Current stable. App Router with server components. `create-next-app` scaffolds TS + Tailwind v4 + ESLint. [VERIFIED: npm registry] |
| @supabase/supabase-js | 2.102.1 | Supabase client SDK | Typed queries, bulk insert/upsert, delete operations. [VERIFIED: npm registry] |
| @supabase/ssr | 0.10.0 | Server-side Supabase client | Creates Supabase client in server components and route handlers. Cookie-based session management. [VERIFIED: npm registry] |
| SheetJS (xlsx) | 0.20.3 | Multi-format spreadsheet parser | Parses CSV, XLSX, XLS, ODS, and more in one library. Works client-side in browser. Satisfies D-05 (accept CSV + Excel + other formats). [VERIFIED: cdn.sheetjs.com] |
| react-dropzone | 15.0.0 | Drag-and-drop file upload | Mature, React 19 compatible, zero dependencies. Provides useDropzone hook for full control over UI. [VERIFIED: npm registry] |
| zod | 4.3.6 | Schema validation | Validates parsed row data (name required, row/position present). [VERIFIED: npm registry] |
| react-hook-form | 7.72.1 | Form handling | For the Replace/Merge confirmation dialog. Lightweight. [VERIFIED: npm registry] |
| @hookform/resolvers | 5.2.2 | Zod + react-hook-form bridge | Supports zod v4 as of 5.2.x (with some type edge cases). [VERIFIED: npm registry, GitHub issues] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui (CLI 3.0) | latest | UI components | Button, Dialog (Replace/Merge prompt), Table, Card, Alert components. Copy into codebase, no runtime dependency. [VERIFIED: ui.shadcn.com] |
| lucide-react | latest | Icons | Upload, file, check, alert icons. Used by shadcn/ui. [ASSUMED] |
| Tailwind CSS | 4.2.x | Styling | Ships with create-next-app. CSS-native config. [VERIFIED: CLAUDE.md] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SheetJS (xlsx) | PapaParse + separate xlsx lib | PapaParse is faster for CSV-only (5.5.3, MIT, zero deps), but doesn't handle Excel. D-05 requires multi-format. SheetJS does both in one library. |
| SheetJS from CDN tarball | npm `xlsx` v0.18.5 | npm registry version is 2+ years stale with known vulnerabilities. CDN tarball is the maintained v0.20.3. |
| react-dropzone | Native HTML5 drag-and-drop | react-dropzone handles edge cases (file type filtering, multiple files, accessibility) that are tedious to hand-roll. |
| Zod v4 | Zod v3 (3.23.x) | Zod v4 is current and verified working. @hookform/resolvers 5.2.2 supports it, though some TypeScript type issues reported in edge cases. Fallback to 3.23.x if blocking type errors occur. |

### Installation

```bash
# Create Next.js project (scaffolds TS, Tailwind v4, ESLint, App Router, Turbopack)
npx create-next-app@latest gravestone-finder --yes

# Core dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install react-dropzone react-hook-form @hookform/resolvers zod
npm install lucide-react

# SheetJS from CDN tarball (NOT from npm registry -- npm version is stale/vulnerable)
npm install https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz

# shadcn/ui initialization
npx shadcn@latest init

# Add needed shadcn components
npx shadcn@latest add button dialog table card alert badge separator

# Supabase CLI (global, for local dev and migrations)
npm install -g supabase

# Dev tools
npm install -D prettier prettier-plugin-tailwindcss
```

**CRITICAL: SheetJS install note.** The `xlsx` package on npm (v0.18.5) is stale and has known vulnerabilities. Always install from `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`. [VERIFIED: SheetJS docs, npm registry]

## Architecture Patterns

### Recommended Project Structure

```
src/
  app/
    page.tsx                    # Home/landing -- redirect to /admin or show info
    admin/
      page.tsx                  # Single admin page (D-07): import zone + data summary
    directory/
      page.tsx                  # Printable directory (D-14, D-15)
    api/
      flags/
        import/
          route.ts             # API route: receives parsed flag data, writes to Supabase
    layout.tsx                  # Root layout with Tailwind, fonts
    globals.css                 # Tailwind directives + print styles
  components/
    import/
      drop-zone.tsx            # Drag-and-drop upload component (D-01)
      import-summary.tsx       # "87 flags imported, 3 errors" (D-03)
      error-list.tsx           # Expandable error details (D-03)
      import-mode-dialog.tsx   # Replace All / Merge prompt (D-13)
      sample-template.tsx      # Download sample file link (D-06)
    directory/
      alpha-directory.tsx      # Alphabetical name -> position list (D-15)
      row-directory.tsx        # By-row grouped listing (D-15)
    ui/                        # shadcn/ui components (auto-generated)
  lib/
    supabase/
      client.ts               # Browser Supabase client
      server.ts               # Server Supabase client
    parsing/
      parse-spreadsheet.ts    # SheetJS wrapper: file -> raw rows
      validate-flags.ts       # Zod schema + validation pipeline
      normalize-row.ts        # Row identifier normalization (A/B/C <-> 1/2/3)
      detect-headers.ts       # Auto-detect headers vs data (D-10)
    types/
      flag.ts                 # Flag type definitions
      import-result.ts        # Import result/error types
```

### Pattern 1: Client-Side File Parsing + Server-Side Persistence

**What:** Parse the spreadsheet entirely in the browser using SheetJS, validate with Zod, then send validated data to a Next.js API route that writes to Supabase.

**When to use:** Always for this phase. Keeps file parsing fast (no upload delay), reduces server load, enables instant error feedback.

**Why:** SheetJS works in the browser. Parsing client-side means the user gets instant validation feedback without waiting for a server round-trip. Only validated data is sent to the API route.

**Example:**
```typescript
// Source: SheetJS docs + Supabase JS client docs
import { read, utils } from "xlsx";

// Client-side: parse file to JSON
async function parseSpreadsheet(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    header: 1, // Array of arrays for header detection
  });
  return rawRows;
}
```

### Pattern 2: Supabase Client Setup (No Auth)

**What:** Since D-04 says no authentication needed, the Supabase setup is simpler than the typical auth-aware pattern. Use the anon key directly with permissive RLS policies.

**When to use:** This phase (Phase 1). Auth may be added later.

**Example:**
```typescript
// lib/supabase/client.ts
// Source: Supabase SSR docs
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
```

```typescript
// lib/supabase/server.ts
// Source: Supabase SSR docs
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Safe to ignore in Server Components
          }
        },
      },
    }
  );
}
```

### Pattern 3: Replace All vs Merge Import Strategy

**What:** D-13 requires a dialog prompting "Replace all" or "Merge" before processing. Replace deletes all existing flags then inserts. Merge upserts by matching on a composite key.

**Example:**
```typescript
// Replace All: delete everything, then insert
// Source: Supabase JS client docs
async function replaceAll(flags: FlagInsert[]) {
  const supabase = createClient();
  // Delete all existing flags
  const { error: deleteError } = await supabase
    .from("flags")
    .delete()
    .gte("id", 0); // Filter required -- matches all rows

  if (deleteError) throw deleteError;

  // Insert new flags
  const { data, error } = await supabase
    .from("flags")
    .insert(flags)
    .select();

  return { data, error };
}

// Merge: upsert by row+position composite
async function mergeFlags(flags: FlagInsert[]) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("flags")
    .upsert(flags, { onConflict: "row_id,position" })
    .select();

  return { data, error };
}
```

### Pattern 4: Header Auto-Detection (D-10)

**What:** Detect whether the first row contains headers or data. If headers match expected column names (Name, Row, Position -- case-insensitive), treat as header row. Otherwise, assume column order.

**Example:**
```typescript
// Source: custom logic based on D-10 requirements [ASSUMED]
const EXPECTED_HEADERS = ["name", "row", "position"];

function detectHeaders(firstRow: unknown[]): {
  hasHeaders: boolean;
  columnMap: Record<string, number>;
} {
  const normalized = firstRow.map((cell) =>
    String(cell).toLowerCase().trim()
  );

  // Check if first row looks like headers
  const matchCount = normalized.filter((cell) =>
    EXPECTED_HEADERS.includes(cell)
  ).length;

  if (matchCount >= 2) {
    // First row is headers -- map column names to indices
    const columnMap: Record<string, number> = {};
    normalized.forEach((cell, idx) => {
      if (EXPECTED_HEADERS.includes(cell)) {
        columnMap[cell] = idx;
      }
    });
    return { hasHeaders: true, columnMap };
  }

  // No headers -- assume order: Name, Row, Position
  return {
    hasHeaders: false,
    columnMap: { name: 0, row: 1, position: 2 },
  };
}
```

### Anti-Patterns to Avoid

- **Server-side file parsing:** Do NOT upload the file to the server for parsing. SheetJS works in the browser, giving instant feedback. Uploading adds latency and complexity (multipart form data, temp file handling).
- **Using npm `xlsx` v0.18.5:** The npm registry version is stale and has security vulnerabilities. Always install from the CDN tarball.
- **Storing files in Supabase Storage:** The file is a transport mechanism, not permanent data. Parse it, validate it, store the structured data. Don't store the raw file.
- **Complex RLS policies for Phase 1:** No auth = simple "allow all" RLS. Don't over-engineer security for a publicly accessible import page.
- **Generating PDFs for the directory:** D-14 explicitly says browser print (Ctrl+P). Print CSS is lighter and more maintainable than a PDF library.

## Database Schema Design

**Discretion area:** Schema design is Claude's discretion per CONTEXT.md.

### Recommended Schema

```sql
-- flags table: core data from CSV import
create table public.flags (
  id bigint generated always as identity primary key,
  name text not null,
  row_label text not null,        -- Normalized row identifier (stored as letter: A, B, C...)
  position integer not null,       -- Position number within the row
  created_at timestamptz default now(),

  -- Composite unique constraint for merge/upsert and duplicate detection
  unique(row_label, position)
);

-- Full-text search support (for Phase 2, but create now to avoid migration)
alter table public.flags
add column fts tsvector generated always as (
  to_tsvector('english', name)
) stored;

-- GIN index for fast full-text search
create index flags_fts_idx on public.flags using gin (fts);

-- Index for directory queries (alphabetical and by-row)
create index flags_name_idx on public.flags (name);
create index flags_row_position_idx on public.flags (row_label, position);

-- RLS: Enable but allow all access (no auth, D-04)
alter table public.flags enable row level security;

create policy "Allow public read" on public.flags
  for select using (true);

create policy "Allow public insert" on public.flags
  for insert with check (true);

create policy "Allow public delete" on public.flags
  for delete using (true);

create policy "Allow public update" on public.flags
  for update using (true);
```

**Design decisions:**
- `row_label` as text (not integer): Stores normalized letter identifiers (A, B, C). D-09 says accept both letters and numbers; normalizing to letters is more human-readable and matches typical field layouts. [ASSUMED]
- `fts` column created now: Avoids a schema migration when Phase 2 adds search. Zero cost if unused. [CITED: supabase.com/docs/guides/database/full-text-search]
- Composite unique on `(row_label, position)`: Enables duplicate detection (IMP-02) and upsert-on-conflict for merge mode (D-13). [CITED: supabase.com/docs/reference/javascript/upsert]

### Row Identifier Normalization

**Discretion area:** How to normalize row identifiers is Claude's discretion.

**Recommendation:** Store as uppercase letters internally. Convert numeric inputs to letters (1->A, 2->B, etc.). Display as letters in the UI and directory.

```typescript
// lib/parsing/normalize-row.ts
export function normalizeRowLabel(input: string | number): string {
  const str = String(input).trim().toUpperCase();

  // If it's already a letter (A-Z, AA-ZZ), return as-is
  if (/^[A-Z]+$/.test(str)) return str;

  // If it's a number, convert to letter (1=A, 2=B, ..., 26=Z, 27=AA)
  const num = parseInt(str, 10);
  if (!isNaN(num) && num > 0) {
    return numberToLetters(num);
  }

  throw new Error(`Invalid row identifier: "${input}"`);
}

function numberToLetters(n: number): string {
  let result = "";
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Spreadsheet parsing | Custom CSV parser or regex-based Excel reader | SheetJS (xlsx) v0.20.3 | CSV has edge cases (quoted fields, embedded commas, BOM, encoding). Excel is a ZIP of XML. SheetJS handles all of it. |
| Drag-and-drop file input | Native HTML5 drag events + file input | react-dropzone v15 | Handles file type filtering, multiple files, accessibility (keyboard), click-to-browse fallback. Well-tested cross-browser. |
| Form validation | Manual if/else validation | Zod v4 schemas | Type-safe, composable, reusable between client and server. Produces structured error objects. |
| UI components | Custom buttons, dialogs, tables | shadcn/ui (Radix primitives) | Accessible (WAI-ARIA), keyboard navigable, consistent styling. Focus trap in dialogs, proper table semantics. |
| Print layout | PDF generation library | Print CSS (@media print) | D-14 explicitly specifies browser print. Print CSS is lighter, no runtime dependency, no file generation. |
| Database client | Raw fetch to Supabase REST API | @supabase/supabase-js | Typed queries, error handling, connection pooling, built-in pagination. |

**Key insight:** The "simple" parts of this phase (CSV parsing, file upload, print layout) are deceptively complex. Each has dozens of edge cases that mature libraries handle. Hand-rolling any of these would consume more time than the entire phase should take.

## Common Pitfalls

### Pitfall 1: SheetJS npm vs CDN Version Confusion
**What goes wrong:** Installing `npm install xlsx` gets v0.18.5 (stale, vulnerable) instead of v0.20.3.
**Why it happens:** SheetJS stopped publishing to npm registry in 2023. The CDN is the maintained distribution.
**How to avoid:** Always install from `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`. Add a comment in package.json.
**Warning signs:** `npm audit` reports vulnerabilities in xlsx. Version shows 0.18.x.

### Pitfall 2: SheetJS Import Syntax in ES Modules
**What goes wrong:** `import XLSX from 'xlsx'` fails; the library uses named exports.
**Why it happens:** SheetJS v0.20.x uses named exports, not a default export.
**How to avoid:** Use `import { read, utils } from "xlsx"` or `import * as XLSX from "xlsx"`.
**Warning signs:** "Module has no default export" error.

### Pitfall 3: Supabase Delete Without Filter
**What goes wrong:** `.delete()` without a filter clause is rejected by Supabase (safety guard).
**Why it happens:** Supabase requires a filter to prevent accidental deletion of all rows.
**How to avoid:** Use `.delete().gte('id', 0)` or `.delete().neq('id', null)` to match all rows intentionally.
**Warning signs:** Error: "delete requires filters" or similar.

### Pitfall 4: File Encoding Issues
**What goes wrong:** CSV files with BOM (Byte Order Mark) or non-UTF-8 encoding produce garbled names.
**Why it happens:** Excel on Windows saves CSV with BOM by default. Some systems use Latin-1.
**How to avoid:** SheetJS handles BOM and encoding detection automatically. Make sure to pass `{ type: "array" }` when reading from ArrayBuffer.
**Warning signs:** First row name starts with invisible characters or shows garbled accented characters.

### Pitfall 5: Empty Rows in Spreadsheet
**What goes wrong:** Spreadsheets often have trailing empty rows. These produce validation errors flooding the error list.
**Why it happens:** Users don't always trim their spreadsheets. Excel preserves empty rows.
**How to avoid:** Filter out rows where all three expected values are empty/undefined before validation.
**Warning signs:** Error list shows dozens of "missing name" errors for rows at the end of the file.

### Pitfall 6: Print CSS Not Applied
**What goes wrong:** Directory page looks fine on screen but prints wrong (missing content, broken layout).
**Why it happens:** `display: none` on screen elements, or missing `@media print` overrides.
**How to avoid:** Use a dedicated print stylesheet. Hide navigation/UI chrome with `@media print { .no-print { display: none; } }`. Test with browser print preview early.
**Warning signs:** Print preview shows UI elements (buttons, nav) or cuts off content.

### Pitfall 7: Zod v4 + @hookform/resolvers Type Issues
**What goes wrong:** TypeScript compilation errors when using zodResolver with Zod v4 schemas.
**Why it happens:** @hookform/resolvers 5.2.2 has known type inference issues with Zod v4's new type system. Reported in GitHub issues #799, #811, #813.
**How to avoid:** Option A: Use `as any` cast on the resolver as a temporary workaround. Option B: Fall back to Zod v3 (3.23.x) if type issues are blocking. Option C: Check if a newer @hookform/resolvers release fixes it.
**Warning signs:** TypeScript errors on `zodResolver(schema)` about Resolver type mismatches.

### Pitfall 8: Supabase Free Tier Auto-Pause
**What goes wrong:** Database becomes unresponsive after 7 days of inactivity.
**Why it happens:** Supabase free tier pauses inactive projects automatically.
**How to avoid:** Keep the project active during development. For production (event day), ensure recent activity. Consider Pro tier ($25/mo) if the event is weeks away from launch.
**Warning signs:** Queries timeout or return connection errors after a period of inactivity.

## Code Examples

### Complete File Import Flow

```typescript
// Source: SheetJS docs (cdn.sheetjs.com) + Zod docs + Supabase JS docs
import { read, utils } from "xlsx";
import { z } from "zod";

// 1. Zod schema for a single flag row
const FlagRowSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  row: z.string().min(1, "Row is required").trim(),
  position: z.coerce.number().int().positive("Position must be a positive number"),
});

type FlagRow = z.infer<typeof FlagRowSchema>;

// 2. Parse spreadsheet file to raw data
function parseFile(file: File): Promise<unknown[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
        resolve(rows);
      } catch (err) {
        reject(new Error("Failed to parse file. Is it a valid spreadsheet?"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

// 3. Validate all rows, collecting errors
interface ImportResult {
  valid: FlagRow[];
  errors: { row: number; issues: string[] }[];
  warnings: string[];
}

function validateRows(
  rawRows: unknown[][],
  columnMap: Record<string, number>,
  startRow: number // 0 if no headers, 1 if headers detected
): ImportResult {
  const valid: FlagRow[] = [];
  const errors: { row: number; issues: string[] }[] = [];

  for (let i = startRow; i < rawRows.length; i++) {
    const raw = rawRows[i];

    // Skip empty rows
    if (!raw || raw.every((cell) => cell == null || String(cell).trim() === "")) {
      continue;
    }

    const rowData = {
      name: String(raw[columnMap.name] ?? ""),
      row: String(raw[columnMap.row] ?? ""),
      position: raw[columnMap.position],
    };

    const result = FlagRowSchema.safeParse(rowData);
    if (result.success) {
      valid.push(result.data);
    } else {
      errors.push({
        row: i + 1, // 1-indexed for display
        issues: result.error.issues.map((issue) => issue.message),
      });
    }
  }

  return { valid, errors, warnings: [] };
}
```

### Print CSS for Directory

```css
/* Source: CSS Print Media best practices [CITED: copyprogramming.com/howto/css-css-media-query-for-print-only] */

/* globals.css - add print styles */
@media print {
  /* Hide all interactive UI */
  .no-print,
  nav,
  button,
  .import-zone {
    display: none !important;
  }

  /* Reset backgrounds and colors for print */
  body {
    background: white;
    color: black;
    font-size: 10pt;
    line-height: 1.4;
  }

  /* Page margins */
  @page {
    margin: 1cm;
    size: letter;
  }

  /* Prevent row groups from breaking across pages */
  .directory-group {
    break-inside: avoid;
  }

  /* Ensure headers repeat on each page (for tables) */
  thead {
    display: table-header-group;
  }

  /* Orphans/widows control */
  p, li {
    orphans: 3;
    widows: 3;
  }

  /* Column layout for alphabetical directory (two columns on print) */
  .alpha-directory {
    column-count: 2;
    column-gap: 1.5cm;
  }
}
```

### Supabase Client Setup (No Auth Simplified)

```typescript
// For Phase 1 with no auth, a simpler alternative exists:
// Use @supabase/supabase-js directly without @supabase/ssr
// Source: Supabase quickstart docs

// lib/supabase/client.ts (browser)
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

// lib/supabase/server.ts (server components, route handlers)
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Components
          }
        },
      },
    }
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `xlsx` from npm registry | SheetJS from CDN tarball | 2023 | Must use `npm install https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2024 | Old package deprecated. Use @supabase/ssr 0.10.0. |
| Supabase `SUPABASE_ANON_KEY` env var | `SUPABASE_PUBLISHABLE_KEY` | 2025 | New key naming convention. Supabase docs now use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. |
| Tailwind CSS v3 (JS config) | Tailwind CSS v4 (CSS-native config) | 2025 | No `tailwind.config.js`. Config in CSS with `@theme`. create-next-app sets up v4 automatically. |
| `create-next-app` with Pages Router | App Router (default) | 2023+ | App Router is the default and recommended approach. |
| Separate CSV + Excel libraries | SheetJS handles both | N/A | One library for all spreadsheet formats reduces complexity. |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr`. Do not use.
- `xlsx` v0.18.5 on npm: Stale, vulnerable. Use CDN tarball v0.20.3.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Renamed to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in recent Supabase docs.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Store row_label as uppercase letters (A, B, C) internally | Database Schema | LOW - easily changed. If numeric storage preferred, migration is simple. |
| A2 | lucide-react is the icon library used by shadcn/ui | Standard Stack | LOW - can swap icon library trivially. |
| A3 | Header auto-detection with >= 2 matching column names is sufficient heuristic | Architecture Patterns | MEDIUM - edge case: data that happens to contain "Name" or "Row" as a value in first row. Add fallback UI to let user override. |
| A4 | Supabase publishable key naming (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) is current | Code Examples | LOW - if old naming (`ANON_KEY`) still works, both are valid. Check Supabase dashboard for actual key names. |

## Open Questions

1. **Supabase project: already created?**
   - What we know: CLAUDE.md specifies Supabase Cloud (free tier) as the backend.
   - What's unclear: Whether the user has already created a Supabase project and has the URL/key.
   - Recommendation: Phase 1 Wave 0 should include a task to set up the Supabase project if not done. Include instructions.

2. **Event commercial status for Vercel hosting**
   - What we know: Vercel Hobby plan restricts commercial use. STATE.md flags this as a concern.
   - What's unclear: Whether the event has any commercial aspect (sponsors, donations, ticket sales).
   - Recommendation: Start with Vercel Hobby. If commercial, budget $20/mo for Pro or use Cloudflare Pages (free, allows commercial).

3. **zod v4 + @hookform/resolvers edge cases**
   - What we know: @hookform/resolvers 5.2.2 added zod v4 support, but GitHub issues report TypeScript type inference problems.
   - What's unclear: Whether the specific usage pattern in this project triggers the type errors.
   - Recommendation: Start with zod v4. If type errors block, either cast as `any` or downgrade to zod 3.23.x.

4. **Sample template file format (D-06)**
   - What we know: Need a downloadable sample file with correct headers and example rows.
   - What's unclear: Should it be CSV only, or also provide an Excel version?
   - Recommendation: Provide a CSV sample (universal, simplest). Can add .xlsx later. Place in `public/templates/sample-flags.csv`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js 16 (requires >= 20.9) | Yes | 24.14.0 | -- |
| npm | Package installation | Yes | 11.9.0 | -- |
| git | Version control | Yes | 2.50.1 | -- |
| Supabase CLI | Local dev, migrations | No | -- | Use Supabase Cloud dashboard SQL editor. Install with `npm install -g supabase` as part of setup. |
| pnpm | Alternative package manager | No | -- | Use npm (already available). Not required. |

**Missing dependencies with no fallback:**
- None -- all critical dependencies are available.

**Missing dependencies with fallback:**
- Supabase CLI: Not installed. Can be installed globally with `npm install -g supabase`. Alternatively, use the Supabase Cloud dashboard SQL editor for schema setup. Not blocking.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (ships well with Next.js 16, faster than Jest) or Jest (create-next-app default) |
| Config file | None -- Wave 0 must create |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| IMP-01 | Parse CSV with name/row/position columns | unit | `npx vitest run src/lib/parsing/__tests__/parse-spreadsheet.test.ts` | No -- Wave 0 |
| IMP-01 | Parse Excel (.xlsx) file | unit | `npx vitest run src/lib/parsing/__tests__/parse-spreadsheet.test.ts` | No -- Wave 0 |
| IMP-02 | Validate: missing name produces error | unit | `npx vitest run src/lib/parsing/__tests__/validate-flags.test.ts` | No -- Wave 0 |
| IMP-02 | Validate: duplicate position produces error | unit | `npx vitest run src/lib/parsing/__tests__/validate-flags.test.ts` | No -- Wave 0 |
| IMP-02 | Validate: malformed row produces error | unit | `npx vitest run src/lib/parsing/__tests__/validate-flags.test.ts` | No -- Wave 0 |
| IMP-03 | Replace All: deletes existing, inserts new | integration | `npx vitest run src/app/api/flags/__tests__/import.test.ts` | No -- Wave 0 |
| IMP-03 | Merge: upserts by row/position | integration | `npx vitest run src/app/api/flags/__tests__/import.test.ts` | No -- Wave 0 |
| ORG-01 | Directory shows alphabetical listing | smoke | Manual -- verify /directory renders sorted names | N/A |
| ORG-01 | Directory shows by-row listing | smoke | Manual -- verify /directory renders grouped by row | N/A |
| D-09 | Row normalization: numbers to letters | unit | `npx vitest run src/lib/parsing/__tests__/normalize-row.test.ts` | No -- Wave 0 |
| D-10 | Header auto-detection | unit | `npx vitest run src/lib/parsing/__tests__/detect-headers.test.ts` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- test framework configuration
- [ ] `src/lib/parsing/__tests__/parse-spreadsheet.test.ts` -- CSV/Excel parsing tests
- [ ] `src/lib/parsing/__tests__/validate-flags.test.ts` -- Zod validation tests
- [ ] `src/lib/parsing/__tests__/normalize-row.test.ts` -- Row normalization tests
- [ ] `src/lib/parsing/__tests__/detect-headers.test.ts` -- Header detection tests
- [ ] `src/app/api/flags/__tests__/import.test.ts` -- API route integration tests
- [ ] Test fixtures: sample CSV, sample XLSX files in `src/__fixtures__/`
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | D-04: No auth required |
| V3 Session Management | No | No sessions needed |
| V4 Access Control | Minimal | RLS policies allow all (public app). Revisit if auth added later. |
| V5 Input Validation | Yes | Zod v4 schema validation on all imported data. Sanitize name strings. |
| V6 Cryptography | No | No secrets, tokens, or encrypted data |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malicious file upload (non-spreadsheet) | Tampering | react-dropzone accept filter (`.csv,.xlsx,.xls,.ods`). SheetJS will throw on invalid files. |
| XSS via imported name data | Tampering | React auto-escapes JSX output. Do NOT use `dangerouslySetInnerHTML` with imported data. |
| DoS via extremely large file | Denial of Service | Client-side file size limit (e.g., 5MB max). SheetJS processes in-memory. |
| SQL injection via Supabase | Tampering | Supabase JS client uses parameterized queries. Never concatenate user input into raw SQL. |
| Data poisoning (bulk bad data) | Tampering | Zod validation catches malformed rows. Replace All mode means bad imports can be overwritten. |

## Sources

### Primary (HIGH confidence)
- [npm registry](https://www.npmjs.com/) -- Verified versions: xlsx 0.18.5 (stale), papaparse 5.5.3, react-dropzone 15.0.0, @hookform/resolvers 5.2.2, zod 4.3.6, react-hook-form 7.72.1, @supabase/supabase-js 2.102.1, @supabase/ssr 0.10.0, next 16.2.2, exceljs 4.4.0
- [SheetJS CDN docs](https://docs.sheetjs.com/docs/getting-started/installation/frameworks/) -- CDN tarball install pattern, v0.20.3 current
- [Supabase Full-Text Search docs](https://supabase.com/docs/guides/database/full-text-search) -- tsvector/tsquery pattern, GIN indexing
- [Supabase JS upsert docs](https://supabase.com/docs/reference/javascript/upsert) -- onConflict, bulk upsert
- [Supabase JS delete docs](https://supabase.com/docs/reference/javascript/delete) -- filter-required delete pattern
- [Supabase SSR docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client) -- createBrowserClient, createServerClient pattern
- [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security) -- public access policies
- [Next.js installation docs](https://nextjs.org/docs/app/getting-started/installation) -- create-next-app defaults

### Secondary (MEDIUM confidence)
- [react-hook-form/resolvers GitHub issues](https://github.com/react-hook-form/resolvers/issues/799) -- Zod v4 type compatibility issues documented
- [SheetJS npm security issue](https://git.sheetjs.com/sheetjs/sheetjs/issues/3098) -- npm v0.18.5 vulnerability documentation
- [CSS Print Media guide](https://copyprogramming.com/howto/css-css-media-query-for-print-only) -- Print CSS best practices 2026
- [sadmann7/file-uploader](https://github.com/sadmann7/file-uploader) -- shadcn/ui + react-dropzone integration pattern

### Tertiary (LOW confidence)
- None -- all claims verified with primary or secondary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All versions verified against npm registry and official docs
- Architecture: HIGH -- Patterns based on official Supabase + Next.js docs and established community patterns
- Pitfalls: HIGH -- Based on documented issues (SheetJS npm, Supabase delete filter, zod v4 types)
- Database schema: MEDIUM -- Schema design is reasonable but is Claude's discretion; may need adjustment based on actual data patterns
- Print CSS: MEDIUM -- Based on standard CSS specs, but browser print rendering varies

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (30 days -- stable ecosystem, no major releases expected)
