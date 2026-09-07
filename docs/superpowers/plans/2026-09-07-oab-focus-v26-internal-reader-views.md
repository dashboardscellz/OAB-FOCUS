# OAB Focus v26 Internal Reader Views Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three-column reader architecture with a single-task reading view plus full-width internal views for Índice, Seu estudo, Grifos and Anotações, preserving all current study data and question flows.

**Architecture:** `data/v26-patch.js` becomes the final owner of reader UI state. It wraps the current content render only as a data/content source, then removes the legacy permanent sidebars and mounts a deterministic `readerSession` view layer (`reading | index | study | highlights | notes`). The SPA route remains `reader`; internal reader views never open browser tabs and use a single session object to restore payload, origin and reading position.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, existing OAB Focus SPA globals, localStorage/Firebase-backed `progress`, Python Playwright + Chromium for browser tests.

**Spec:** `docs/superpowers/specs/2026-09-07-oab-focus-v26-internal-reader-views-design.md`

## Global Constraints

- Base version: OAB Focus SUPER v25.
- Keep the app as a single-page application; do not create multi-page HTML.
- Do not reduce or rewrite legal study content.
- Preserve all current questions and current material↔question mapping behavior.
- Preserve Prepare-se, Revisão inteligente, curva do esquecimento, dark mode, grifos, progresso and Mais cobrados.
- Maps remain removed.
- Internal views must use `← Voltar à leitura` and must not open new browser tabs.
- Mobile validation is mandatory at 360, 390, 430 and 768 px.
- Reader controls must have one active owner/listener after v26 renders.

---

### Task 1: Browser regression harness and v26 session contract

**Files:**
- Create: `tests/v26_reader_architecture.py`
- Create: `data/v26-patch.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: existing globals `route`, `routePayload`, `renderReader`, `renderRoute`, `safeRoute`, `goBack`, `progress`.
- Produces: `window.OAB_V26.readerSession`, `window.OAB_V26.setView(view)`, `window.OAB_V26.returnToReading()`.

- [ ] **Step 1: Write the failing browser test for the session owner**

```python
# tests/v26_reader_architecture.py
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_v26_script_is_loaded_last():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    assert '<script src="data/v26-patch.js"></script>' in html
    assert html.rfind('data/v26-patch.js') > html.rfind('data/v25-patch.js')


def test_v26_session_contract_exists():
    js = (ROOT / "data/v26-patch.js").read_text(encoding="utf-8")
    for token in ["readerSession", "setView", "returnToReading", "scrollAnchor", "origin"]:
        assert token in js
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `python3 -m pytest tests/v26_reader_architecture.py -q`
Expected: FAIL because `data/v26-patch.js` and the script tag do not exist.

- [ ] **Step 3: Add the minimal v26 module and session object**

```js
(() => {
  'use strict';
  const state = {
    readerSession: {
      payload: null,
      origin: null,
      view: 'reading',
      scrollAnchor: null,
      focusMode: false
    }
  };
  function setView(view){ state.readerSession.view = view; }
  function returnToReading(){ setView('reading'); }
  window.OAB_V26 = {...state, setView, returnToReading};
})();
```

Append `<script src="data/v26-patch.js"></script>` after `data/v25-patch.js` in `index.html`.

- [ ] **Step 4: Run the contract test**

Run: `python3 -m pytest tests/v26_reader_architecture.py -q`
Expected: PASS.

---

### Task 2: Single-column reading owner and removal of permanent sidebars

**Files:**
- Modify: `data/v26-patch.js`
- Modify: `tests/v26_reader_architecture.py`

**Interfaces:**
- Consumes: legacy `renderReader(payload)` output, `#readerArticle`, `.v16-reader-toc`, `.v16-reader-status`, `.v17-reader-chrome`.
- Produces: `mountReadingView(payload)`, `.v26-reader-shell`, `.v26-reader-toolbar`, single-column `#readerArticle`.

- [ ] **Step 1: Add failing behavioral test**

Use Playwright to serve `index.html`, log in with the existing test account, open a known reader route, then assert:

```python
assert page.locator('.v16-reader-toc').count() == 0
assert page.locator('.v16-reader-status').count() == 0
assert page.locator('#readerArticle').count() == 1
assert page.locator('.v26-reader-toolbar').count() == 1
```

- [ ] **Step 2: Run only this test and confirm failure**

Run: `python3 -m pytest tests/v26_reader_architecture.py -k single_column -q`
Expected: FAIL because the legacy TOC/status are still mounted.

- [ ] **Step 3: Implement `mountReadingView(payload)`**

Implementation requirements:
- capture the legacy article node after the base reader renders;
- detach and preserve `#readerArticle` instead of cloning it;
- remove legacy `.v16-reader-toc`, `.v16-reader-status`, `.v16-reader-command`, duplicated reader chrome and old side panels;
- mount `.v26-reader-shell > .v26-reader-toolbar + .v26-reading-stage`;
- place the original `#readerArticle` inside `.v26-reading-stage`;
- constrain body copy to 78–84ch while allowing the article card itself up to ~980px;
- toolbar actions: `Voltar`, `Índice`, `Seu estudo`, `Grifos`, `Anotações`, `A−`, `A+`, theme, `Foco`.

- [ ] **Step 4: Run the single-column test**

Run: `python3 -m pytest tests/v26_reader_architecture.py -k single_column -q`
Expected: PASS.

---

### Task 3: Deterministic origin tracking and scroll restoration

**Files:**
- Modify: `data/v26-patch.js`
- Modify: `tests/v26_reader_architecture.py`

**Interfaces:**
- Produces: `captureReaderPosition() -> {ratio, blockId, textOffset}`, `restoreReaderPosition(anchor)`, `rememberOrigin()`.

- [ ] **Step 1: Add failing tests for back-to-reading and scroll restoration**

Browser sequence:
1. open reader;
2. scroll to ~55%;
3. click `Seu estudo`;
4. click `Voltar à leitura`;
5. assert `readerSession.view === 'reading'` and restored scroll differs by no more than 120 px from the captured position.

- [ ] **Step 2: Run and verify failure**

Run: `python3 -m pytest tests/v26_reader_architecture.py -k restore -q`
Expected: FAIL because internal views do not exist.

- [ ] **Step 3: Implement position/origin ownership**

Use semantic-first restoration:
- nearest `[id]`, `h2`, `h3`, `.integral-section` as `blockId`/index;
- fallback ratio within `#readerArticle`;
- do not depend only on raw `window.scrollY`.

`origin` must record the route/payload active before `reader` when available, and fall back to the existing navigation stack.

- [ ] **Step 4: Run restoration test**

Expected: PASS.

---

### Task 4: Full-width Índice internal view

**Files:**
- Modify: `data/v26-patch.js`
- Modify: `tests/v26_reader_architecture.py`

**Interfaces:**
- Produces: `renderIndexView()`.

- [ ] **Step 1: Write failing test**

Assert clicking `Índice`:
- keeps global `route === 'reader'`;
- creates `.v26-internal-view[data-view="index"]`;
- displays `Voltar à leitura`;
- hides `#readerArticle` from the active layout;
- shows current chapter/subtopic highlighted.

- [ ] **Step 2: Run and confirm failure**

Run: `python3 -m pytest tests/v26_reader_architecture.py -k index_view -q`

- [ ] **Step 3: Implement `renderIndexView()`**

Build the list from `disciplineChapters(discipline)` / current reader payload. Clicking a chapter/subtopic must call the existing reader route with the exact `discipline`, `topicId`, `subtopicTitle`, then return to `view:'reading'`.

- [ ] **Step 4: Run index tests**

Expected: PASS.

---

### Task 5: Full-width “Seu estudo” internal view

**Files:**
- Modify: `data/v26-patch.js`
- Modify: `tests/v26_reader_architecture.py`

**Interfaces:**
- Produces: `renderStudyView()`.

- [ ] **Step 1: Write failing test**

Assert the view contains wide cards for:
- progress;
- time;
- unit questions;
- correct/wrong counts when available;
- highlights count;
- state `em andamento/concluído`;
- `Marcar como estudada`;
- `Fazer questões desta unidade`.

Also assert no card width is below 260 px at 1366px viewport.

- [ ] **Step 2: Run and verify failure**

Run: `python3 -m pytest tests/v26_reader_architecture.py -k study_view -q`

- [ ] **Step 3: Implement `renderStudyView()`**

Reuse existing sources:
- `progress.topics` for completion/time;
- current unit question IDs from the strict/contextual question map already used by v20/v21;
- `progress.answers` for correct/wrong counts;
- persisted highlights for the active reader key;
- adaptive microstate only when sample exists.

Never render this data as a permanent sidebar.

- [ ] **Step 4: Run study view tests**

Expected: PASS.

---

### Task 6: Full-width Grifos and Anotações internal views

**Files:**
- Modify: `data/v26-patch.js`
- Modify: `tests/v26_reader_architecture.py`

**Interfaces:**
- Produces: `renderHighlightsView()`, `renderNotesView()`.

- [ ] **Step 1: Write failing tests**

Highlights:
- opens internally;
- groups yellow/green/blue;
- each highlight has `Ir para este trecho` and remove action;
- returning to reading restores the highlighted location.

Notes:
- opens internally;
- can create/edit/delete a note for the active unit;
- never opens a browser tab.

- [ ] **Step 2: Run and confirm failure**

Run: `python3 -m pytest tests/v26_reader_architecture.py -k 'highlights or notes' -q`

- [ ] **Step 3: Implement both views**

For highlights, reuse the v17/v18 persisted highlight storage and semantic anchors; do not create a second highlight store.

For notes, store unit notes under an additive v26 namespace inside `progress` (for example `progress.readerNotes[readerKey]`) without mutating existing question notes.

- [ ] **Step 4: Run both view tests**

Expected: PASS.

---

### Task 7: Focus mode as a reading-view state, not a parallel architecture

**Files:**
- Modify: `data/v26-patch.js`
- Modify: `tests/v26_reader_architecture.py`

**Interfaces:**
- Produces: `setFocusMode(on)`.

- [ ] **Step 1: Write failing focus test**

Assert focus mode:
- keeps `readerSession.view === 'reading'`;
- hides global topbar and full reader toolbar;
- leaves reading content, progress strip, highlighter and `Sair do foco`;
- does not reintroduce TOC/status sidebars.

- [ ] **Step 2: Run and verify failure**

Run: `python3 -m pytest tests/v26_reader_architecture.py -k focus -q`

- [ ] **Step 3: Implement v26 focus owner**

Neutralize v24 focus controls by intercepting/removing the legacy focus button/listener before mounting the new toolbar. Keep the existing highlight dock only in `reading` and `focus`.

- [ ] **Step 4: Run focus test**

Expected: PASS.

---

### Task 8: Contextual question return path and no mode mixing

**Files:**
- Modify: `data/v26-patch.js`
- Modify: `tests/v26_reader_architecture.py`

**Interfaces:**
- Consumes: v21 contextual question mode (`qFilters.studyContext`, `questionIds`).
- Produces: deterministic `Voltar ao material` back to the exact reader payload.

- [ ] **Step 1: Write failing contextual-practice test**

Open questions from a reader unit and assert:
- no `Simulado 80`;
- no global filter panel;
- no global question search;
- `Voltar ao material` restores the exact discipline/chapter/subtopic;
- returning does not reset reader position unnecessarily.

- [ ] **Step 2: Run and verify failure or current gaps**

Run: `python3 -m pytest tests/v26_reader_architecture.py -k contextual_questions -q`

- [ ] **Step 3: Implement v26 reader-origin metadata for question launch**

Before opening contextual questions, store the exact current reader payload and semantic position in the study context, without changing free-bank behavior.

- [ ] **Step 4: Run contextual practice test**

Expected: PASS.

---

### Task 9: Mobile architecture and width QA

**Files:**
- Modify: `data/v26-patch.js`
- Modify: `tests/v26_reader_architecture.py`

**Interfaces:**
- No new public API.

- [ ] **Step 1: Add failing parameterized mobile test**

For widths `360, 390, 430, 768`, assert:
- `document.documentElement.scrollWidth <= window.innerWidth + 2`;
- no permanent `.v16-reader-toc` or `.v16-reader-status`;
- internal views use one column;
- minimum tap height for primary internal-view buttons is at least 40 px;
- highlighter does not overlap the last navigation/action button.

- [ ] **Step 2: Run mobile tests and record failures**

Run: `python3 -m pytest tests/v26_reader_architecture.py -k mobile -q`

- [ ] **Step 3: Add responsive v26 CSS**

Rules:
- 360/390/430: one-column internal views, compact toolbar with controlled horizontal overflow or `Mais`, no permanent sidebars;
- 768: still one-column reading, no restored sidebars;
- article padding scales down without reducing body below ~16.5–17px;
- dock positioned above bottom navigation/action region.

- [ ] **Step 4: Run all mobile tests**

Expected: PASS at all four widths.

---

### Task 10: Full regression, updater and v26 package

**Files:**
- Modify: `ATUALIZAR_GITHUB.cmd`
- Create: `QA_ENGENHARIA_v26.md`
- Create: `/mnt/data/OAB_Focus_SUPER_v26_FINAL_GITHUB.zip`

**Interfaces:**
- Package folder name: `OAB_Focus_SUPER_v26_GITHUB`.

- [ ] **Step 1: Run syntax validation**

Run:
```bash
node --check data/v26-patch.js
```
Expected: no output, exit 0.

- [ ] **Step 2: Run the full v26 browser suite**

Run:
```bash
python3 -m pytest tests/v26_reader_architecture.py -q
```
Expected: all PASS.

- [ ] **Step 3: Run preservation assertions**

Add/read a test that asserts:
- `window.OAB_QUESTIONS.length >= 2336`;
- no `maps`, `maps-hd` or `data/map-manifest.js` are in the package;
- scripts v15–v26 load in order and v26 is last;
- routes `prepare`, `review`, `highyield`, `questions`, `profile` still render without uncaught errors.

- [ ] **Step 4: Update `ATUALIZAR_GITHUB.cmd`**

The updater must verify `data/v26-patch.js`, identify itself as v26 and suggest commit summary `OAB Focus v26 - telas internas do leitor`.

- [ ] **Step 5: Write `QA_ENGENHARIA_v26.md` with actual test evidence**

Document exact commands, viewport sizes and results. Do not claim tests not run.

- [ ] **Step 6: Rename working folder and create final ZIP**

Run:
```bash
mv OAB_Focus_SUPER_v25_GITHUB OAB_Focus_SUPER_v26_GITHUB
zip -qr /mnt/data/OAB_Focus_SUPER_v26_FINAL_GITHUB.zip OAB_Focus_SUPER_v26_GITHUB
```

Expected: final ZIP exists and contains `index.html`, `data/v26-patch.js`, `ATUALIZAR_GITHUB.cmd` and QA report.
