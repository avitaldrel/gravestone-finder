---
phase: 01-data-foundation
plan: 03
subsystem: api, ui
tags: [next.js, supabase, react-dropzone, shadcn-ui, import, drag-and-drop, csv]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js project scaffolding, types (Flag, FlagInsert, ImportResult), Supabase clients, shadcn/ui components, DB migration
  - phase: 01-02
    provides: parseSpreadsheet function, validateRows function, normalizeRowLabel, detectHeaders
provides:
  - POST /api/flags/import endpoint with replace/merge modes
  - GET /api/flags/import endpoint for fetching all flags
  - DELETE /api/flags/import endpoint for clearing all flags
  - Admin page (/admin) with complete import flow
  - DropZone component with 5 visual states and file validation
  - ImportModeDialog for Replace All / Merge / Keep Existing Data
  - ImportSummary with success/error badges and warnings
  - ErrorList with collapsible row-level validation errors
  - SampleTemplate download link
affects: [visitor-search, grid-map, directory]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "API route handler pattern: Next.js App Router route.ts with POST/GET/DELETE exports"
    - "Supabase delete-all pattern: .delete().gte('id', 0) for safe delete without filter error"
    - "Supabase upsert pattern: .upsert(data, { onConflict: 'row_label,position' }) for merge imports"
    - "Client-side file processing: parseSpreadsheet -> validateRows -> API persist pipeline"
    - "Import mode dialog pattern: check existing data before persist, prompt for replace/merge/keep"

key-files:
  created:
    - src/app/api/flags/import/route.ts
    - src/components/import/drop-zone.tsx
    - src/components/import/import-summary.tsx
    - src/components/import/error-list.tsx
    - src/components/import/import-mode-dialog.tsx
    - src/components/import/sample-template.tsx
    - src/app/api/flags/__tests__/import.test.ts
  modified:
    - src/app/admin/page.tsx

key-decisions:
  - "Client-side parsing with server-side persistence: files parsed in browser, valid data sent to API route for Supabase insert"
  - "Dialog-based import mode selection: existing data triggers Replace/Merge/Keep dialog before any persistence"

patterns-established:
  - "API route pattern: Supabase server client in route handlers with error handling and typed responses"
  - "Import flow: DropZone (parse+validate) -> parent state -> optional dialog -> API persist -> re-fetch"
  - "Component state machine: DropZone uses idle/dragActive/processing/success/error states for visual feedback"

requirements-completed: [IMP-01, IMP-02, IMP-03]

# Metrics
duration: 48min
completed: 2026-04-12
---

# Phase 1 Plan 3: Import Flow & Admin UI Summary

**Complete import flow with drag-and-drop upload, replace/merge persistence via Supabase API, and admin page with summary, error list, and data table**

## Performance

- **Duration:** 48 min
- **Started:** 2026-04-12T13:20:33Z
- **Completed:** 2026-04-12T14:08:31Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- API route handles flag import with replace mode (delete all + insert) and merge mode (upsert by row_label+position)
- Admin page provides complete import experience: drag-and-drop file upload with 5 visual states, immediate processing, Replace All/Merge/Keep Existing dialog, success/error summary with badges, collapsible error list, and data table
- 14 unit tests covering all API route paths (POST replace, POST merge, GET, DELETE, error handling) with mocked Supabase client
- All 61 project tests pass, npm run build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Create flags import API route** - `da82487` (feat)
2. **Task 2: Build admin page with all import UI components** - `8c77a87` (feat)
3. **Task 3: Create import API integration tests** - `cf67873` (test)

## Files Created/Modified
- `src/app/api/flags/import/route.ts` - POST (replace/merge), GET (fetch all), DELETE (clear all) handlers
- `src/components/import/drop-zone.tsx` - Drag-and-drop with react-dropzone, 5 visual states, file type/size validation
- `src/components/import/import-summary.tsx` - Success/error counts with badges, warning alerts for unrecognized columns
- `src/components/import/error-list.tsx` - Collapsible row-level validation errors with accessibility (role="alert")
- `src/components/import/import-mode-dialog.tsx` - Replace All / Merge / Keep Existing Data dialog (D-13)
- `src/components/import/sample-template.tsx` - Download link for sample CSV template (D-06)
- `src/app/admin/page.tsx` - Full admin page with import flow orchestration, data table, empty state
- `src/app/api/flags/__tests__/import.test.ts` - 14 tests for API route with mocked Supabase client

## Decisions Made
- Client-side parsing with server-side persistence: files are parsed and validated entirely in the browser using parseSpreadsheet + validateRows, then only valid FlagInsert data is sent to the API route for Supabase persistence. This keeps the API route simple and avoids sending raw files to the server.
- Import mode dialog before persistence: when existing data is detected (via GET on mount), the dialog opens before any POST call, ensuring the organizer makes an explicit choice. The "Keep Existing Data" option simply dismisses the dialog without any API call.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Worktree did not have node_modules installed; ran npm install before verification steps. Pre-existing condition, not caused by plan changes.

## User Setup Required

None - no external service configuration required. The API route uses the existing Supabase server client configured in Plan 01.

## Next Phase Readiness
- Import flow is complete: organizers can drag-and-drop CSV/Excel files and have data persist to Supabase
- Data is available via GET /api/flags/import for downstream features (search, directory, map)
- Directory page (Plan 04) can fetch flags from the same API endpoint
- Visitor search (Phase 2) has the data layer ready

## Self-Check: PASSED

All 9 created/modified files verified present on disk. All 3 task commits verified in git log.

---
*Phase: 01-data-foundation*
*Completed: 2026-04-12*
