# Day 01 — 2026-04-23

## Completed (committed files only)

### oslo-mobile — commit aef3cb0
- `app/index.tsx` — skip auth, call /auth/dev-create on launch, redirect to tabs
- `app/(tabs)/home.tsx` — full Home tab: greeting, quick actions (Scan/File/Voice/Share), recent activity, values to watch, smart report CTA, subscribe banner, emergency shortcut
- `app/(tabs)/timeline.tsx` — timeline with FlatList, filter chips (All/Lab/Rx/Imaging/Notes), search, event cards linking to document detail
- `app/(tabs)/records.tsx` — category rows with counts from /documents/counts API
- `app/(tabs)/trends.tsx` — filter chip shell for Day 4
- `app/(tabs)/ask.tsx` — chat UI shell with input for Day 5
- `app/upload/_layout.tsx` — Stack layout for upload flow
- `app/upload/review.tsx` — full upload pipeline: create document → finalize → fetch extraction → review table → confirm & save
- `app/document/_layout.tsx` — Stack layout for document detail
- `app/document/[id].tsx` — document detail: classification badge, lab values table with ref ranges, status pills, explain button, prescription view
- `components/QuickAction.tsx` — action button with icon + label
- `components/ExtractionReview.tsx` — editable lab values table with tap-to-edit, confirm/cancel
- `components/CriticalValueBanner.tsx` — red banner for critical flags
- `components/Sparkline.tsx` — SVG sparkline for MetricCards
- `components/index.ts` — updated exports
- `lib/init.ts` — demo user initialization via /auth/dev-create
- `store/documents.ts` — Zustand persist store for uploaded documents
- 4 new Jest test suites: QuickAction, CriticalValueBanner, Sparkline, ExtractionReview

## Test results
- 12 test suites, 26 tests, all passing
- 25 snapshots (7 new, 18 existing)

## Gate Day 1
- [x] App opens directly to Home tab (no auth screens)
- [x] Demo user auto-created on launch
- [x] Document picker → upload → classify → extract → review → save
- [x] Home shows "last uploaded" card from document store
- [x] Values to watch shows flagged lab values

## Blockers
- None

## Tomorrow's plan
- Day 2: Extraction review polish, Timeline with real API data, Records category navigation, Lab report detail with full ref ranges
