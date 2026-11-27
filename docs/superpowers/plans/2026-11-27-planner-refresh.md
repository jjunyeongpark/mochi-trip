# Pogeun Planner Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the ten approved changes to the existing public Pogeun Trip site.
**Architecture:** Extend the existing Vinext/React app and guarded Google API service. Keep independent domain helpers for timeline, day routing and hotel ranking; extract reusable photo, detail, region and planner surfaces while retaining existing storage/share semantics.
**Tech Stack:** React 19, TypeScript, Vinext, Cloudflare Workers/D1, Google Places/Routes/Maps.
**Spec:** docs/superpowers/specs/2026-11-27-planner-refresh.md

## Global Constraints
- Preserve the exact existing project ID, public audience, budget limits and saved trip ID format.
- Use fresh original-derived transparent mascot assets, not any intermediate broken edge version.
- Never fabricate Google photos, provider attribution, route geometry, ratings, prices or availability.
- Keep Google API keys server-side except the already restricted browser Maps key.

## Review Focus
- Switching dates/modes or changing stops during in-flight route requests must never display stale geometry.
- Saved/shared trips must restore selected real hotels and metadata from fresh place IDs.
- Failed/missing photos and unavailable routes must preserve usable mobile planning.
- Regional highlight must cover all prefectures, work without hover, and avoid intercepting input.
- Photo input/redirect validation and request budgets must reject abuse without exposing server credentials.

### Task 1: Domain and provider data
Files: lib/travel.ts, lib/google.ts, lib/service.ts, lib/budget.ts, lib/demo.ts, new lib/planner.ts, tests/google.test.ts, tests/service.test.ts, tests/planner.test.ts.
- [ ] Add failing tests for hotel category/photos attribution, hotel search, photo bounds/rejections, a 9-point hotel return route, six demo cities and known/estimated timeline transitions.
- [ ] Implement compatible optional data and guarded photo/hotel endpoints, ID-only persistence, timeline/day-route helpers and city samples.
- [ ] Run the relevant tests and verify green.

### Task 2: Discovery and media
Files: components/JapanDiscovery.tsx, lib/japan-regions.ts, public/assets/*.webp, components/JourneyFeedback.tsx, components/AnimatedMascot.tsx.
- [ ] Copy verified original-derived WebPs and use native image decoding, removing runtime matte use.
- [ ] Reuse sourced projected Japanese prefecture geometry; whole-region hover/focus/touch selection and actual city/theme controls.
- [ ] Verify six cities and region membership in tests.

### Task 3: Map, time/photo cards and place detail
Files: components/TravelMap.tsx, components/PlacePhoto.tsx, components/PlaceDetail.tsx, components/TripPlanner.tsx, app/page.tsx.
- [ ] Implement in-site selection, per-day colors, all-day routes and bounded route caching with race guards.
- [ ] Build hourly photo itinerary, active pins and place details. Integrate current save/share/search/favorite actions.
- [ ] Add actual lodging search/selection and daily departure/return points, with sample-mode region guidance.

### Task 4: Responsive integration
Files: app/experience.css, app/layout.tsx, app/page.tsx.
- [ ] Apply the approved visual language, useful new menus and six-city cards.
- [ ] Mobile sticky map above scrollable photo schedule; desktop map beside timeline. Preserve keyboard/focus and reduce-motion behavior.

### Task 5: Validate and publish
- [ ] Run tests, TypeScript, production build and targeted mobile/desktop browser checks.
- [ ] Request one fresh-context whole-change code review and fix important findings with regression coverage.
- [ ] Package/push exact checked source using Sites helper; save/deploy to the existing site without changing audience.
- [ ] Confirm deployment and final live behavior, then report the production URL and material limitations.
