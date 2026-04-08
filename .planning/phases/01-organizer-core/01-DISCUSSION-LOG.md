# Phase 1: Organizer Core - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-07
**Phase:** 01-Organizer Core
**Areas discussed:** Authentication, Field Layout Definition, Flag Management Flow, Dashboard Structure

---

## Authentication

User opted out of discussing this area and instead provided a directive:

**User's choice:** Remove authentication entirely — no login, no passphrase, no credentials.
**Notes:** "remove the login and credentials completely, do away with it"

---

## Field Layout Definition

### How should organizers define the field layout?

| Option | Description | Selected |
|--------|-------------|----------|
| Simple grid form | Uniform grid — enter rows x positions per row | |
| Variable rows | Add rows one at a time, each with own position count | ✓ |
| Visual grid builder | Drag-to-paint grid cells on a canvas | |

**User's choice:** Variable rows
**Notes:** None

### How should rows be labeled?

| Option | Description | Selected |
|--------|-------------|----------|
| Letters (A, B, C...) | Familiar convention | |
| Numbers (1, 2, 3...) | Simpler, scales beyond 26 rows | ✓ |
| Custom names | Organizer names each row freely | |

**User's choice:** Numbers (1, 2, 3...)
**Notes:** None

### Can the organizer modify the layout after flags are placed?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, with warnings | Allow changes, warn about displaced flags | ✓ |
| Add only | Can add rows but can't shrink existing | |
| Locked after first flag | Layout frozen once any flag is placed | |

**User's choice:** Yes, with warnings
**Notes:** None

---

## Flag Management Flow

### How should the flag list be displayed and edited?

| Option | Description | Selected |
|--------|-------------|----------|
| Table with inline editing | Spreadsheet-like, click to edit | ✓ |
| Form + list | Add/edit via form, flags as scrollable list | |
| Card grid | Each flag as a card in a grid | |

**User's choice:** Table with inline editing
**Notes:** None

### How should position selection work when adding a flag?

| Option | Description | Selected |
|--------|-------------|----------|
| Dropdowns for row + position | Two dropdowns, only open positions shown | ✓ |
| Type row and position numbers | Free-text entry with validation | ✓ |
| Next-available auto-assign | System suggests next open position | |

**User's choice:** Dropdowns or typing — both should work
**Notes:** "there's a good chance it will be spreadsheet import but other than that use the dropdowns or type row"

### How should the duplicate position error appear?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline error on save | Red text below position field, blocks save | ✓ |
| Prevent selection entirely | Occupied positions grayed out/disabled | |
| Both — prevent + fallback error | Gray out taken positions AND inline error | |

**User's choice:** Inline error on save
**Notes:** None

---

## Dashboard Structure

### How should the organizer dashboard be structured?

| Option | Description | Selected |
|--------|-------------|----------|
| Single page with sections | Layout at top, flags below, everything visible | ✓ |
| Tab-based | Tabs for Layout, Flags, Stats | |
| Multi-page with sidebar | Separate pages with sidebar nav | |

**User's choice:** Single page with sections
**Notes:** None

### Should the dashboard show a stats summary?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, at the top | Quick stats bar with counts and percentages | |
| No, keep it minimal | Just layout and flag table | |
| You decide | Claude picks during implementation | ✓ |

**User's choice:** You decide (Claude's discretion)
**Notes:** None

### What visual style are you going for?

| Option | Description | Selected |
|--------|-------------|----------|
| Clean and minimal | White backgrounds, subtle borders, whitespace | |
| Warm and respectful | Muted memorial tones (navy, burgundy, gold) | |
| Functional/utilitarian | Dense, data-focused like a spreadsheet tool | |

**User's choice:** Other — "fancy UI"
**Notes:** User wants a polished, visually impressive design

---

## Claude's Discretion

- Stats summary placement and content
- Loading states and transitions
- Mobile responsive behavior
- Exact color palette within "fancy UI" direction

## Deferred Ideas

- CSV/spreadsheet bulk import — Phase 2 (user noted most data will come this way)
- Authentication — explicitly removed by user, not deferred
