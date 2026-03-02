# Chill Dude - Step 1 Product Specification (Locked)

Date: March 1, 2026  
Status: Locked for implementation (Step 1)

## 1. Goal
Build a responsive (mobile + web) wellness/productivity app with an automatic daily recommendation flow:

1. Face scan
2. Journal submit (one per day)
3. Auto recommendation (Focus or Relax)
4. Session execution + tracking
5. Weekly insights

No manual mood selector in V1.

## 2. Tech + Hosting (Confirmed)
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: Neon PostgreSQL + Prisma
- Auth: JWT + bcrypt
- Deploy: Vercel (frontend), Render (backend), Neon (database)

## 3. Visual Direction (Locked)
- Theme style: Keep current blue/indigo visual language.
- Tone: Hybrid (calm + action-oriented).
- UI density: More compact than current oversized pages.
- Priority: Clarity and emotional comfort over decorative complexity.

## 4. Core Product Rules (Locked)
- Daily journal is immutable after submit (read-only forever).
- User can read past journal entries any time.
- Focus/Relax recommendation appears after today's journal submission.
- If today's journal already submitted, user goes directly to recommendation/options.
- Mood inference is automatic (no manual selection).

## 5. Emotion & Recommendation Engine
## V1 signal inputs (locked)
- Face expression signal
- Journal AI summary/sentiment

## V2+ signal inputs (planned, not blocking V1)
- Sleep (smartwatch)
- Steps/activity (smartwatch)
- Tasks + pending assignments
- Timetable/day load intensity

## V1 output
- Primary mode: Focus or Relax
- Reason summary text (human-readable explanation)

## 6. Page Architecture (V1)
1. Auth / Onboarding
- Login/register
- Consent/permissions intro

2. Daily Face Scan
- Capture expression signal (short guided scan)

3. Daily Journal
- Single text entry for the day
- Submit-only action

4. Recommendation Result
- Auto mode decision
- Explanation block ("why this recommendation")
- Entry point to Focus or Relax

5. Focus Room
- Pomodoro/focus timer
- Top-priority tasks list
- Sound options: white noise, rain

6. Relax Room
- Guided breathing (2/5/10 min)
- Companion chatbot (V1 fallback to avoid live voice cost)
- Calm media recommendations (Spotify/YouTube links; curated first)

7. Diary Timeline
- Beautiful read-only history cards
- Daily summary and key emotional note

8. Tasks & Timetable
- Task/assignment management
- Daily workload intensity score (source for V2 logic)

9. Weekly Insights
- Stress trend chart (7-day)
- Focus-time trend chart
- Recommendation and pattern highlights

10. Profile & Safety
- Integrations, permissions, trusted contacts
- Safety preference toggles

## 7. Notifications (V1)
- Heavy-day nudge (schedule/task load-based rule)
- Deadline reminder nudges
- Continuous-stress break prompt (in-app)

## Optional / V2 safety escalation
- Trusted-contact alert only with explicit consent + cooldown logic.
- Start with low-cost channels (in-app/email). SMS/WhatsApp not required for V1.

## 8. Data Storage Policy (Locked)
- Persist in Neon DB:
  - Submitted journals
  - Recommendation results
  - Focus/relax session logs
  - Weekly insight snapshots
- Local storage:
  - Draft-only text (temporary), session cache, non-critical UI state
- Do not store critical product history only in local storage.

## 9. Responsive Requirements (Web + Mobile)
## Breakpoints
- Mobile: 360-767 px
- Tablet: 768-1023 px
- Desktop: 1024+ px

## Layout behavior
- Mobile-first implementation.
- No horizontal scroll in any screen.
- Primary action always visible within one viewport on mobile where feasible.
- Cards stack vertically on mobile, split/grid on desktop.

## Navigation behavior
- Mobile: bottom tab or compact top navigation.
- Desktop: top nav + section shortcuts where useful.

## Component behavior
- Touch targets >= 44x44 px on mobile.
- Input fields and CTA buttons sized for thumb usage.
- Charts must remain legible on 360 px width (abbreviated labels as needed).

## Performance constraints
- Keep initial bundle lean (lazy-load heavy pages/charts where needed).
- Avoid animation-heavy layouts that reduce readability/performance on low-end phones.

## 10. Out of Scope for V1
- Production-grade live voice group rooms.
- Full clinical health interpretation.
- Full personalized Spotify/YouTube OAuth recommendation engine.

## 11. Step 1 Acceptance Criteria
- This document is the source-of-truth contract for implementation.
- All team decisions above are treated as locked unless explicitly revised.
- Step 2 begins only after approval of this spec.

