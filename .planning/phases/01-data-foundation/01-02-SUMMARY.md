---
phase: 01-data-foundation
plan: 02
status: complete
started: 2026-04-12
completed: 2026-04-12
duration: ~15 minutes effective execution
tasks_completed: 1
tasks_total: 1
test_count: 47
test_passed: 47
requirements:
  - IMP-01
  - IMP-02
key-decisions:
  - "Zod v4 coerce.number() produces generic NaN message for non-numeric strings; added error message normalization to always show 'Position must be a positive number'"
  - "Used deduplication on Zod error messages to avoid repeated position errors when coerce and positive checks both fail"
key-files:
  created:
    - src/lib/parsing/normalize-row.ts
    - src/lib/parsing/detect-headers.ts
    - src/lib/parsing/parse-spreadsheet.ts
    - src/lib/parsing/validate-flags.ts
    - src/lib/parsing/__tests__/normalize-row.test.ts
    - src/lib/parsing/__tests__/detect-headers.test.ts
    - src/lib/parsing/__tests__/parse-spreadsheet.test.ts
    - src/lib/parsing/__tests__/validate-flags.test.ts
  modified: []
---

# Plan 01-02 Summary: Spreadsheet Parsing & Validation Pipeline

TDD-built CSV/Excel parsing pipeline with Zod validation: 4 production modules and 4 test suites (47 tests). Converts raw spreadsheet files to typed FlagInsert[] with error reporting, row normalization (numeric-to-letter), header auto-detection, and duplicate position checking.

## What Was Built

The complete data transformation layer between "file dropped" and "data ready for storage." Four pure-function modules handle every step of the pipeline:

1. **normalize-row.ts** -- Converts row identifiers to uppercase letter format. Accepts letters ("A", "aa") and numbers (1, 26, 27) mapping to spreadsheet-style labels (A, Z, AA). Rejects empty strings, zero, negative numbers, and special characters.

2. **detect-headers.ts** -- Auto-detects whether the first row contains headers by matching against known column names (Name, Row, Position). Case-insensitive. Requires >= 2 matches to classify as headers. Returns column index map and lists unrecognized column names for D-11 warning support.

3. **parse-spreadsheet.ts** -- SheetJS wrapper that reads a File object (CSV or Excel) and returns raw rows as `unknown[][]`. Uses named imports `{ read, utils }` from xlsx. Wraps errors in user-friendly message.

4. **validate-flags.ts** -- Main orchestrator. Calls detectHeaders to find column positions, iterates rows with Zod schema validation (name required, row required, position must be positive integer), normalizes row labels, detects duplicate row+position combinations, skips empty rows silently, and produces `ImportResult` with valid flags, errors (1-indexed row numbers), and warnings (unrecognized columns).

## Tasks Completed

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 (RED) | Write failing tests for all 4 modules | Done | c39f002 |
| 1 (GREEN) | Implement all 4 modules to pass tests | Done | ea7e051 |

## Test Coverage

| Test Suite | Tests | Status |
|-----------|-------|--------|
| normalize-row.test.ts | 19 | All passing |
| detect-headers.test.ts | 8 | All passing |
| parse-spreadsheet.test.ts | 3 | All passing |
| validate-flags.test.ts | 17 | All passing |
| **Total** | **47** | **All passing** |

### Key Test Scenarios

- Letter inputs (A, a, Z, AA) normalize correctly
- Numeric inputs (1->A, 2->B, 26->Z, 27->AA) convert to letters
- Invalid inputs (empty, 0, -1, special chars) throw descriptive errors
- Header detection: exact match, case-insensitive, reordered columns, unrecognized extras
- No-header detection: data-in-first-row, single-match-only
- Validation: missing name/row/position, non-numeric position, zero/negative position
- Duplicate row+position detection with error on second occurrence
- Empty rows (undefined cells, blank strings, empty arrays) silently skipped
- Unrecognized columns produce warning (D-11)
- Fixture data: sample-valid.csv produces 8 valid flags, sample-with-errors.csv has errors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Zod v4 coerce.number() NaN error message**
- **Found during:** GREEN phase, test "reports error for non-numeric position"
- **Issue:** Zod v4's `coerce.number()` produces "Invalid input: expected number, received NaN" for non-numeric strings like "abc", which does not include the word "Position" for user-friendly error reporting.
- **Fix:** Added error message normalization in validateRows that maps NaN-related errors and position path errors to "Position must be a positive number". Added deduplication to prevent repeated messages.
- **Files modified:** src/lib/parsing/validate-flags.ts
- **Commit:** ea7e051

## Verification

```
npx vitest run
 Test Files  4 passed (4)
      Tests  47 passed (47)
```

All acceptance criteria verified:
- normalizeRowLabel("1") returns "A"
- validateRows with missing name produces "Name is required"
- Duplicate position detection works (second occurrence gets error)
- Empty rows silently skipped (no errors generated)
- Unrecognized columns produce warning with column names
- Named xlsx imports used: `import { read, utils } from "xlsx"`
- All type imports from Plan 01 connected (FlagInsert, ImportResult, ImportError)

## Self-Check: PASSED

All 8 created files verified on disk. Both commit hashes (c39f002, ea7e051) verified in git log.
