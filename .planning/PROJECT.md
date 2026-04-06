# Gravestone Finder

## What This Is

A web application for organizing and navigating memorial "Field of Flags" events — temporary displays where small flags are planted on a land plot, each representing a fallen veteran. Organizers use it to manage flag placement and track inventory. Family members use it to search by name and locate their loved one's flag via an interactive map or row/position directory.

## Core Value

A family member can search a veteran's name and immediately find where their flag is planted — both on a visual map and as a human-readable location (row, position).

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Organizers can add flags with veteran name and assigned position
- [ ] Organizers can define the field layout (rows, sections, positions)
- [ ] Organizers can update or remove flag placements
- [ ] Organizers can add new flags after initial setup
- [ ] Family members can search for a flag by veteran name
- [ ] Search results show position as row/position directory (e.g., "Row 3, Position 12")
- [ ] Search results show flag location on an interactive visual map
- [ ] System handles ~100 flags at baseline, scalable to larger events
- [ ] Works on mobile browsers (phone at event) and desktop browsers (organizer use)
- [ ] Supports one event initially with architecture to expand to multiple events

### Out of Scope

- Native mobile app — web app covers all devices via browser
- Detailed veteran profiles (rank, branch, dates, photos) — name only for now
- Volunteer coordination / scheduling — organizers handle this externally
- Payment / sponsorship tracking — not part of this tool
- Multi-event management UI — expandable architecture but single event for v1

## Context

- This is a greenfield project with no existing system — currently unmanaged
- Event is coming up soon, so speed matters
- Physical setup: small flags planted in a land plot in a grid-like arrangement
- ~100 flags for the first event, but the system should handle growth
- Two distinct user types with different needs: organizers (CRUD operations) and visitors (search + navigate)

## Constraints

- **Timeline**: Event coming soon — need a working product quickly
- **Platform**: Web app only — must be responsive for mobile and desktop
- **Data simplicity**: Name-only flag records for v1
- **Scale**: Must handle 100+ flags without performance issues

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web app over native | Accessible on any device, faster to build, no app store friction | — Pending |
| Name-only flag data | Simplicity for v1, event is soon | — Pending |
| Single event for v1 | Focused scope, expandable later | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-06 after initialization*
