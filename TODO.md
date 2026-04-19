# Task: Implementasi Fitur Lanjutan PWA - Push Notification, PWA Advanced, IndexedDB Advanced, Deployment

## Approved Plan Status: Confirmed (user approved, no changes)

**Current Status (from analysis):**
- Push: Handlers ready but DISABLED → Enable + toggle UI + VAPID for Advanced
- PWA: Manifest complete, install/offline good → Add IDB fallback for stories
- IndexedDB: CRUD + sync good → Ensure UI interactivity
- Deployment: No URL → Deploy GitHub Pages

## Steps to Complete:

### Phase 1: Push Notification (Advanced) ✅
- [x] Step 1.1: Add VAPID to src/scripts/config.js
- [x] Step 1.2: Update src/scripts/utils/pwa.js - Add push subscribe/toggle functions + UI button
- [x] Step 1.3: Update src/sw.js - Enable push handlers (uncomment + dynamic data)
- [x] Step 1.4: Update src/scripts/pages/home/home-page.js - Add toggle button in UI
- [x] Step 1.5: Test push toggle + notification on add story (`npm run dev`) - Fixed index.js syntax

### Phase 2: PWA & IndexedDB Polish (confirm Advanced)
- [ ] Step 2.1: Update src/scripts/pages/stories/stories-page.js - Load from IDB if offline + search/filter
- [ ] Step 2.2: Test offline: add story → sync → view cached

### Phase 3: Deployment
- [ ] Step 3.1: Build (`npm run build`)
- [ ] Step 3.2: Deploy GitHub Pages (check gh/gh-pages)
- [ ] Step 3.3: Update STUDENT.txt with live URL
- [ ] Step 3.4: Validate Lighthouse scores

**Current Progress: Phase 1 complete. Starting Phase 2**


**Current Progress: Starting Phase 1**

## Notes:
- VAPID: Use standard Dicoding story-api key (BJAt1mB9v8QWlNyyvEu4V9AU...)
- Maintain all previous features (SPA, map, a11y)
- Test iteratively with `npm run dev`

