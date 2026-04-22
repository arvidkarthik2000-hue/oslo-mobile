# Day 9 — Final Polish & Build Config (2026-04-23)

## Completed

### EAS Build Configuration
- Created `eas.json` with three profiles:
  - **preview**: APK build for sideloading demo (`:app:assembleRelease`)
  - **development**: dev client APK with hot reload
  - **production**: AAB for Play Store submission
- App already configured: `com.oslo.health`, SDK 52, Android-only

### PDF Generation (expo-print + expo-sharing)
- New `lib/pdf-generator.ts` — full HTML→PDF pipeline
- Doctor-presentable PDF with:
  - OSLO branded header (accent green)
  - Patient info bar (name, DOB, blood group)
  - System-by-system lab values table with color-coded status
  - Active medications section
  - AI disclaimer footer
  - Fallback: renders markdown text if no structured sections
- Smart Report "Share with doctor" button now generates real PDF
- Uses `expo-sharing` for native share sheet, `expo-print` fallback

### Onboarding Tooltips (Timeline + Trends)
- Timeline tab: "Your health timeline shows every lab, prescription, and note in one place."
- Trends tab: "Track how your lab values change over time. Filter by body system."
- Both use `OnboardingTooltip` component with AsyncStorage persistence
- Complements existing Home tab tooltip

### TypeScript Fixes
- `StatusPill` — added missing `text` prop in 3 call sites (home, document detail, extraction review)
- `CategoryRow` — fixed `label` → `title` prop in records tab
- **Zero TypeScript errors** across entire codebase

### Test Suite
- Updated 1 snapshot (ExtractionReview) for StatusPill text change
- **26/26 tests passing, 25 snapshots clean**

### Dependencies Added
- `expo-print` ~14.0.1
- `expo-sharing` ~13.0.1  
- `@types/jest` (dev) — resolved test file TS errors

## Build Status

### To generate the demo APK:
```bash
npx eas build --platform android --profile preview
```

### Requires:
1. EAS CLI: `npm install -g eas-cli`
2. Expo account: `eas login`
3. First build takes ~15 min on EAS servers
4. APK download link provided on completion

## What's Feature-Complete (no external deps needed)
- ✅ Home tab with greeting, quick actions, recent activity, values to watch
- ✅ Timeline tab with filters, search, add note (text + voice)
- ✅ Records tab with category counts and filtered lists
- ✅ Trends tab with sparklines, system filters, color-coded flags
- ✅ Ask AI chat with citations, refusal handling, suggested questions
- ✅ Smart Report with system cards, expandable values, PDF share
- ✅ Document upload → classify → extract → review → save pipeline
- ✅ Document detail with lab values table, ref ranges, explain button
- ✅ Emergency profile with pre-populated demo data
- ✅ Subscribe screen with ₹199/month plan, simulated Razorpay
- ✅ Settings with profile edit, demo controls, privacy placeholders
- ✅ Offline banner, onboarding tooltips on all 3 key tabs
- ✅ Demo data seeder with 5 realistic Indian lab reports

## What Needs Native Build (EAS required)
- 📷 Camera multi-page scanner (react-native-vision-camera)
- 📥 Share intent handler (AndroidManifest changes)
- ⌚ Health Connect wearable sync (react-native-health-connect)

## External Dependencies (waiting on XQZ)
- 🤖 Real AI endpoint URL (currently using mock service)
- 📄 Real anonymized demo reports (currently using synthetic data)
