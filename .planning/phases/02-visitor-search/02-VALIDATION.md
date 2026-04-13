---
phase: 2
slug: visitor-search
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-12
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 |
| **Config file** | `vitest.config.ts` (exists) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | SRCH-01 | — | N/A | unit | `npx vitest run src/lib/search/__tests__/fuse-search.test.ts -t "returns matching flags"` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | SRCH-04 | — | N/A | unit | `npx vitest run src/lib/search/__tests__/fuse-search.test.ts -t "handles typos"` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | SRCH-02 | — | N/A | unit | `npx vitest run src/components/search/__tests__/result-card.test.tsx -t "displays location"` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | SRCH-05 | — | N/A | unit | `npx vitest run src/components/search/__tests__/no-results.test.tsx -t "shows fallback"` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 1 | SRCH-01 | T-02-01 | React JSX auto-escapes search input; no dangerouslySetInnerHTML | integration | `npx vitest run src/components/search/__tests__/search-page.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/search/__tests__/fuse-search.test.ts` — stubs for SRCH-01, SRCH-04
- [ ] `src/components/search/__tests__/result-card.test.tsx` — stubs for SRCH-02
- [ ] `src/components/search/__tests__/no-results.test.tsx` — stubs for SRCH-05
- [ ] `src/components/search/__tests__/search-page.test.tsx` — integration: three states (no data, no results, results)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hero search layout renders centered on mobile | SRCH-01 | Visual layout verification | Open / on mobile viewport, verify search bar is centered with welcome message above |
| Debounced input feels responsive at ~200ms | SRCH-01 | UX timing perception | Type in search bar, verify results appear without perceptible delay |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
