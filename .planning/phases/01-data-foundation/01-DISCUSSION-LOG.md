# Phase 1: Data Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-07
**Phase:** 01-data-foundation
**Areas discussed:** Import experience, CSV structure, Data persistence, Printable directory

---

## Import Experience

| Option | Description | Selected |
|--------|-------------|----------|
| Drag-and-drop zone | Large drop zone with file picker fallback. Visual feedback on hover/drop. | ✓ |
| Simple file picker button | Standard 'Choose File' button. Minimal UI. | |
| Paste CSV text | Textarea for raw CSV content. | |

**User's choice:** Drag-and-drop zone
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Summary + error list | Show count + expandable error details per row. | ✓ |
| Full preview table | Show all imported rows before confirming. | |
| Simple success/fail message | Minimal feedback. | |

**User's choice:** Summary + error list
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Apply immediately | Data loads on file drop. Re-import to fix. | ✓ |
| Preview then confirm | Show preview, click confirm. | |

**User's choice:** Apply immediately
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Single admin page | Import zone at top, summary below. Everything in one place. | ✓ |
| Dedicated import page | Separate /import route. | |

**User's choice:** Single admin page
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| No login needed | Anyone with URL can import. Matches 'no auth' scope decision. | ✓ |
| Simple passphrase | Shared password prompt. | |
| Hidden URL only | Non-obvious URL, no password. | |

**User's choice:** No login needed
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| CSV only | Accept .csv files only. | |
| CSV + Excel (.xlsx) | Also accept Excel files. | |
| CSV + TSV | Accept comma and tab delimited. | |

**User's choice:** Other — "Accept most common ones, CSV or Excel or any other important big ones"
**Notes:** User wants broad format support — CSV, Excel, and other commonly used spreadsheet export formats.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, provide template | Download link for sample CSV with correct headers. | ✓ |
| No template needed | Show expected format as text instructions. | |

**User's choice:** Yes, provide template
**Notes:** None

---

## CSV Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Name, Row, Position | Three columns matching the display format. | ✓ |
| Name, Section, Row, Position | Four columns with section level. | |
| Name, Location (freeform) | Two columns with freeform location. | |

**User's choice:** Name, Row, Position
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Letters (A, B, C...) | Rows labeled alphabetically. | |
| Numbers (1, 2, 3...) | Both rows and positions are numbers. | |
| Accept either | Parser accepts both, normalize internally. | ✓ |

**User's choice:** Accept either
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Require headers | First row must be headers. Flexible on exact names. | |
| Auto-detect | Try to detect if first row is headers or data. | ✓ |

**User's choice:** Auto-detect
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Ignore silently | Skip extra columns without mention. | |
| Warn about extras | Import succeeds but warns about unrecognized columns. | ✓ |

**User's choice:** Warn about extras
**Notes:** None

---

## Data Persistence

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase database | PostgreSQL via Supabase. Persistent, multi-user. | ✓ |
| Client-side only (localStorage) | Per-browser storage. | |
| Static JSON file | Deploy-time generation. | |

**User's choice:** Supabase database
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Full replace | Wipe all existing, replace with new import. | |
| Merge/upsert | Match and update existing, add new. | |
| Ask each time | Prompt organizer to choose Replace or Merge. | ✓ |

**User's choice:** Ask each time
**Notes:** None

---

## Printable Directory

| Option | Description | Selected |
|--------|-------------|----------|
| Print-styled page | Dedicated page with print CSS. Browser print. | ✓ |
| PDF download | Downloadable PDF file. | |

**User's choice:** Print-styled page
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Name → Row, Position | Simple alphabetical lookup. | |
| Both views | Alphabetical name lookup + by-row listing. | ✓ |

**User's choice:** Both views
**Notes:** None

---

## Claude's Discretion

- Drag-and-drop component implementation
- Error message wording and styling
- Supabase table schema design
- Column auto-detection algorithm
- Print CSS layout and typography
- Row identifier normalization

## Deferred Ideas

None — discussion stayed within phase scope
