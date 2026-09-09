# OAB Focus v35.13 Mobile App Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox syntax for tracking.

**Goal:** Ship a mobile-first OAB Focus experience at <=768px while keeping desktop and existing study data/logic intact.

**Architecture:** Add one late-loaded CSS layer and one late-loaded JS adapter. The adapter enhances/re-renders only mobile routes and delegates all business logic/navigation to existing functions. Desktop remains the existing v35 shell.

**Tech Stack:** static HTML/CSS/JavaScript, Firebase-compatible existing runtime, Python/pytest + Playwright.

**Spec:** `docs/superpowers/specs/2026-09-09-mobile-app-architecture-design.md`

## Global Constraints
- Preserve all legal source material and question data.
- Preserve Firebase, progress, account isolation and Prepare-se logic.
- Preserve v35.12 Question Bank independence.
- Apply mobile behavior only at <=768px.
- Do not copy OAB de Bolso branding/assets.

---

### Task 1: Mobile shell and login isolation
**Files:** Create `data/v35-mobile-app.css`, `data/v35-mobile-app.js`; modify `index.html`; test `tests/v35_mobile_app.py`.
- [ ] Write failing tests for hidden login, single mobile header and bottom navigation at 390x844.
- [ ] Run tests and confirm failure.
- [ ] Implement final login isolation selector, app-route dataset and mobile shell hooks.
- [ ] Run tests and confirm pass.

### Task 2: Mobile home
**Files:** Modify `data/v35-mobile-app.js`, `data/v35-mobile-app.css`; test `tests/v35_mobile_app.py`.
- [ ] Write failing test for compact home quick actions and no desktop dashboard hero on mobile.
- [ ] Implement mobile home renderer using existing stats/level/currentOrRecommended/progress.
- [ ] Bind Continue, Estudar, Prepare-se, Questões, Revisar, Desempenho through existing routing.
- [ ] Verify mobile and desktop behavior.

### Task 3: Study and Prepare-se adaptation
**Files:** Modify mobile CSS/JS; test `tests/v35_mobile_app.py`.
- [ ] Write failing tests for one-row discipline list and today-first Prepare-se layout.
- [ ] Add route classes and CSS adapters without replacing legal content.
- [ ] Verify chapter/unit controls remain reachable.

### Task 4: Independent mobile Question Bank filters
**Files:** Modify mobile JS/CSS; test `tests/v35_mobile_questions.py`.
- [ ] Write failing test for search proxy + Filters bottom sheet using existing `#fDisc/#fTopic/#fExam/#fStatus/#fSearch`.
- [ ] Implement filter sheet by moving the existing filter panel, not cloning filter controls.
- [ ] Ensure contextual practice remains contextual while tapping the bottom-tab Questões invokes v35.12 bank mode.
- [ ] Verify filter changes affect queue and do not mutate Prepare-se.

### Task 5: Reader and touch ergonomics
**Files:** Modify mobile CSS; test `tests/v35_mobile_app.py`.
- [ ] Add tests for reader width, safe bottom padding, 48px touch targets and no horizontal overflow.
- [ ] Implement reader/mobile question typography and safe-area rules.
- [ ] Verify 375x812, 390x844, 430x932, 768x1024.

### Task 6: Regression, documentation and package
**Files:** Update README/QA, `ATUALIZAR_GITHUB.cmd`; package ZIP.
- [ ] Run new mobile tests.
- [ ] Run critical existing shell/question/account/taxonomy/text tests.
- [ ] Run full suite when feasible.
- [ ] Validate JS syntax and ZIP integrity.
