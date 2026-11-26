# Pogeun Trip Design Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved soft design and restrained animated mascot feedback to the existing public Site.

**Architecture:** Retain the existing React page, maps and API behavior. Add a small feedback dialog component and a final CSS theme layer; reuse supplied animation files and one generated transparent hero asset.

**Tech Stack:** React, TypeScript, Vinext, existing lucide-react icons, CSS, Sites hosting.

**Spec:** `docs/design-refresh-2026-11-26.md`

## Global Constraints
- Preserve the current Site ID, public audience, runtime keys and budget behavior.
- Follow the final font selection and authentic supplied character, not earlier abandoned variants.
- Preserve GIF animation, offer skip/close, respect reduced motion, and never claim the GIF itself has alpha transparency.

## Review Focus
- Intro must not block a shared-trip deep link or reappear every refresh in one session.
- Generating a sample or live trip must recover correctly on success and failure.
- Feedback overlay must not trap users after auto-dismiss or leave background scrolling locked.
- Small mobile screens must retain visible controls and no horizontal overflow.
- Google map, route and saved-trip controls must retain their current behavior.

### Task 1: Assets and responsive presentation
**Files:** `public/assets/*`, `components/Mochi.tsx`, `app/page.tsx`, `app/globals.css`, `app/layout.tsx`.
- [x] Capture baseline tests and inspect existing page.
- [x] Place transparent hero and supplied mascot PNG/GIF assets.
- [x] Replace the hero, simplify destination presentation, apply fonts, colors and responsive styles.
- [x] Verify desktop and mobile, including planner.

### Task 2: Restrained animated feedback
**Files:** `components/JourneyFeedback.tsx`, `lib/feedback.ts`, `tests/feedback.test.ts`, `app/page.tsx`, `app/globals.css`.
- [x] Add failing policy tests for session and shared-link welcome suppression.
- [x] Implement the policy and dialog; first visit and successful creation show 3-second feedback, generation shows loading after 450ms, all are dismissible.
- [x] Use static PNG when reduced motion is requested.
- [x] Run full tests, TypeScript and production build. Test skip, completion and generation in the browser.

### Task 3: Verification and publication
- [x] Compare source mockups with rendered desktop/mobile views and write `design-qa.md`.
- [ ] Review the diff, fix material issues, and synchronize verified source through Sites.
- [ ] Save and deploy the existing public Site and report its actual deployment status.

## Execution decisions
- The user explicitly asked to apply all agreed changes now; continue inline without another design approval round.
- Existing dedicated Site checkout is clean and selected by the official source helper. Do not create another worktree or change unrelated workspace files.
- No unit tests for reversible CSS/assets; behavioral policy tests and browser interaction checks cover the new feedback behavior.
- Ruling: the original GIF is not alpha-transparent. Use per-frame client-side alpha processing where ImageDecoder is available and preserve animated originals as fallback. Added regression tests for cream highlights, suitcase color and background noise.
- Independent reviewer identified load-independent auto-dismiss; fixed to start after media readiness. Re-review found no remaining P1/P2 issues.
