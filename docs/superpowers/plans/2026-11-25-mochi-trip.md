# Mochi Trip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved public Japan travel planner with real Google integrations and a 30,000 KRW monthly operating target.
**Architecture:** Sites Vinext frontend with same-origin API routes. D1 atomic spend reservations and capability-based trip sharing. Missing keys produce explicit demo mode.
**Tech Stack:** React, TypeScript, Vinext, D1, Google Maps/Places/Routes.
**Spec:** ../../design.md

## Global Constraints
- Korean responsive UI; cute diary visual style; no fabricated live Google data.
- Monthly estimated API ceiling 20,000 KRW plus 10,000 KRW operating buffer; not a provider billing guarantee.
- User has authorized implementation; execute inline without another approval loop.
- New isolated Site directory; do not touch existing staged files.

## Review Focus
- Concurrent reservations cannot cross the monthly cap; missing DB fails closed.
- Invalid dates/regions/coordinates or huge bodies do not trigger billable calls.
- Failed routes remain explicitly unavailable; never draw invented road paths.
- Share links contain no API secrets, provider content snapshots or edit tokens.
- Changing day/transport/place cannot leave stale routes visible.

### Task 1: Domain and spend guard
Files: lib/travel.ts, lib/budget.ts, tests/travel.test.ts, tests/budget.test.ts, db/schema.ts.
Interfaces: validateSettings(input), buildDays(places, settings), mapsUrl(place), reserveSpend(db, kind, units, date).
- [ ] Write tests for invalid Japan/date inputs, meal slots and unique places, Maps URL encoding, concurrency at the cap and monthly rollover.
- [ ] Run node tests; confirm RED, implement, rerun GREEN.
- [ ] Generate schema migrations for spend/rate limits/shared trips.

### Task 2: Google API and sharing routes
Files: lib/google.ts, lib/server.ts, app/api/{config,plan,search,routes,share}/route.ts, app/api/share/[id]/route.ts.
Interfaces: JSON requests; provider data normalized into Place/RouteLeg types. All billable calls reserve budget before network requests.
- [ ] Add tests for no-key fail-safe, field masks, no-route errors, input abuse and public read-only share serialization.
- [ ] Implement bounded APIs, timeouts, quotas, no Google content persistence and transparent errors.
- [ ] Run full tests and TypeScript validation.

### Task 3: Responsive travel diary
Files: app/page.tsx, app/globals.css, components/{Mochi,TravelMap}.tsx, lib/demo.ts.
- [ ] Implement hero, city selection, trip settings, day timeline, map, search/add/reorder/delete, favorite/save/share.
- [ ] Mark sample places and schematic maps; show real Google routes only when returned.
- [ ] Verify desktop/mobile interactions in browser, including sample generation and saved trip restore.

### Task 4: Ship and handoff
Files: README.md, .env.example, docs/google-setup.md.
- [ ] Document Google Cloud setup, restrictions, quotas, costs and budget limitations.
- [ ] Run tests, typecheck and production build; review code and fix material defects.
- [ ] Push isolated Site source, package matching artifact, publish and return verified URL.
