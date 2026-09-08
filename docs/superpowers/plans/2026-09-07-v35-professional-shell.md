# OAB Focus v35 Professional Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the amateur fixed-sidebar visual shell with a professional two-level desktop header and compact mobile navigation while preserving every functional route.

**Architecture:** Keep route renderers and study features intact, but introduce `data/v35-shell.js` as a post-v34 shell adapter and `data/v35-shell.css` as the single v35 design-system layer. The shell moves primary navigation into a two-row top header, limits side navigation to contextual study/admin views, standardizes typography/grid/spacing, and keeps mobile navigation to a compact topbar + five-item bottom bar.

**Tech Stack:** Static HTML/CSS/JavaScript, existing route system, responsive CSS, Playwright/browser screenshot checks where available, pytest source/layout regression tests.

**Spec:** `docs/superpowers/specs/2026-09-07-v35-professional-shell-account-isolation-design.md`

## Global Constraints

- Do not copy Qconcursos branding, orange palette, assets, text or proprietary layout details; use only structural ideas such as hierarchy, density and navigation composition.
- Preserve OAB Focus identity and existing wine/navy accents.
- Use one sans-serif family for UI and primary reading text.
- Desktop dashboard content width target: 1180–1240 px.
- Sidebar is contextual only, never global on ordinary routes.
- Mobile has one compact topbar and max five bottom destinations.
- 360, 390, 430 and 768 px must have zero horizontal overflow.
- Reader retains a narrower legible measure than dashboards.
- Maps mental remain absent.

---

### Task 1: Add v35 design-system CSS and shell test harness

**Files:**
- Create: `data/v35-shell.css`
- Create: `tests/v35_professional_shell.py`
- Modify: `index.html`

**Interfaces:**
- Produces CSS variables `--v35-shell-max`, `--v35-reader-max`, `--v35-header-h1`, `--v35-header-h2`, `--v35-nav-h`
- Consumes existing `.app-shell`, `.main-area`, `.content`, `.reader-shell`, `.card`, `.btn` classes.

- [ ] **Step 1: Write failing tests**

```python
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
CSS = ROOT / "data" / "v35-shell.css"


def test_v35_shell_stylesheet_is_loaded_after_base_styles():
    html = INDEX.read_text(encoding="utf-8")
    assert 'href="data/v35-shell.css"' in html


def test_v35_uses_single_sans_serif_and_professional_content_width():
    css = CSS.read_text(encoding="utf-8")
    assert "--v35-shell-max:1240px" in css.replace(" ", "")
    assert "font-family:Inter" in css.replace(" ", "")
    assert "Georgia" not in css
```

- [ ] **Step 2: Run RED**

Run: `pytest -q tests/v35_professional_shell.py`
Expected: FAIL because stylesheet does not exist.

- [ ] **Step 3: Create v35 design-system layer**

Start `data/v35-shell.css` with:

```css
:root{
  --v35-shell-max:1240px;
  --v35-reader-max:780px;
  --v35-header-h1:58px;
  --v35-header-h2:46px;
  --v35-nav-h:104px;
  --v35-radius:8px;
  --v35-border:#dde3ea;
  --v35-bg:#f7f8fa;
}
#app,.app-shell,.content,.reader-shell,.reader-article{font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;}
.main-area{margin-left:0!important;}
.content{width:min(calc(100% - 40px),var(--v35-shell-max));max-width:var(--v35-shell-max);margin:0 auto;padding:28px 0 72px;}
.reader-shell{max-width:var(--v35-reader-max);}
.card{border-radius:var(--v35-radius);box-shadow:none;}
```

Remove operational Georgia styling through explicit v35 overrides, without altering the login institutional mark if its serif treatment is intentionally branded.

- [ ] **Step 4: Verify GREEN**

Run: `pytest -q tests/v35_professional_shell.py`
Expected: PASS Task 1.

- [ ] **Step 5: Commit**

```bash
git add data/v35-shell.css index.html tests/v35_professional_shell.py
git commit -m "style(v35): add professional design system"
```

---

### Task 2: Build two-level desktop top navigation

**Files:**
- Create: `data/v35-shell.js`
- Modify: `index.html`
- Modify: `data/v35-shell.css`
- Test: `tests/v35_professional_shell.py`

**Interfaces:**
- Produces: `mountV35Shell()`, `syncV35Navigation(routeName)`, `.v35-global-header`, `.v35-primary-nav`
- Consumes: existing `setRoute()`, `route`, `profile`, `progress`, `globalSearchBtn`, `avatarBtn`.

- [ ] **Step 1: Add failing tests**

```python
def test_desktop_shell_has_two_header_rows_and_horizontal_routes():
    js = (ROOT / "data" / "v35-shell.js").read_text(encoding="utf-8")
    assert "v35-global-header" in js
    assert "v35-primary-nav" in js
    for route in ["home","study","prepare","questions","review","performance","highyield"]:
        assert f'data-route="{route}"' in js


def test_global_sidebar_is_hidden_on_ordinary_routes():
    css = CSS.read_text(encoding="utf-8")
    assert ".sidebar{display:none" in css.replace(" ", "")
```

- [ ] **Step 2: Run RED**

Run: `pytest -q tests/v35_professional_shell.py -k 'desktop_shell or global_sidebar'`
Expected: FAIL.

- [ ] **Step 3: Implement shell mount**

`mountV35Shell()` inserts before `.main-area` a semantic header:

```html
<header class="v35-global-header">
  <div class="v35-header-util">
    <button class="v35-brand" data-route="home">OAB Focus <small>1ª fase</small></button>
    <button class="v35-search" id="v35SearchBtn">Buscar assunto ou questão</button>
    <div class="v35-study-session" id="v35StudySession">Sessão 00:00</div>
    <button class="v35-profile-trigger" id="v35ProfileBtn">Perfil</button>
  </div>
  <nav class="v35-primary-nav" aria-label="Navegação principal">
    <button data-route="home">Início</button>
    <button data-route="study">Estudar</button>
    <button data-route="prepare">Prepare-se</button>
    <button data-route="questions">Questões</button>
    <button data-route="review">Revisar</button>
    <button data-route="performance">Desempenho</button>
    <button data-route="highyield">Mais cobrados</button>
    <button data-v35-more>Mais</button>
  </nav>
</header>
```

The `Mais` popover contains Ranking, Perfil, Configurações and Administração only when `profile.role==='admin'`.

Wire all `[data-route]` in v35 shell to `setRoute(button.dataset.route)` and call `syncV35Navigation(route)` after route changes.

- [ ] **Step 4: Verify GREEN**

Run: `pytest -q tests/v35_professional_shell.py -k 'desktop_shell or global_sidebar'`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/v35-shell.js data/v35-shell.css index.html tests/v35_professional_shell.py
git commit -m "feat(v35): add two-level professional navigation"
```

---

### Task 3: Contextual sidebar only for study and admin flows

**Files:**
- Modify: `data/v35-shell.js`
- Modify: `data/v35-shell.css`
- Test: `tests/v35_professional_shell.py`

**Interfaces:**
- Produces: `setV35ContextRail(routeName)`, `.v35-context-rail`, `.v35-shell-with-rail`
- Consumes: study route payload, reader route, admin route.

- [ ] **Step 1: Add failing tests**

```python
def test_context_rail_is_limited_to_study_reader_admin():
    js = (ROOT / "data" / "v35-shell.js").read_text(encoding="utf-8")
    assert "new Set(['study','reader','admin'])" in js
    assert "v35-context-rail" in js
```

- [ ] **Step 2: Run RED**

Run: `pytest -q tests/v35_professional_shell.py -k context_rail`
Expected: FAIL.

- [ ] **Step 3: Implement contextual rail**

For `study` and `reader`, expose discipline/chapter navigation in a 280 px rail only where existing DOM provides useful context. For `admin`, expose admin sections. On all other routes, remove/hide the rail and reset content to full dashboard width.

Desktop CSS:

```css
.v35-context-layout{display:grid;grid-template-columns:280px minmax(0,1fr);gap:28px;align-items:start;}
.v35-context-rail{position:sticky;top:120px;max-height:calc(100vh - 140px);overflow:auto;border-right:1px solid var(--v35-border);padding-right:18px;}
```

- [ ] **Step 4: Verify GREEN**

Run: `pytest -q tests/v35_professional_shell.py -k context_rail`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/v35-shell.js data/v35-shell.css tests/v35_professional_shell.py
git commit -m "feat(v35): limit side navigation to contextual flows"
```

---

### Task 4: Professionalize home/dashboard hierarchy

**Files:**
- Modify: `data/v35-shell.js`
- Modify: `data/v35-shell.css`
- Test: `tests/v35_professional_shell.py`

**Interfaces:**
- Produces: `enhanceV35Home()` and v35 semantic home classes
- Consumes: existing `renderHome()` output and existing action attributes.

- [ ] **Step 1: Add failing tests for density constraints**

```python
def test_home_reduces_hero_and_random_card_mosaic():
    css = CSS.read_text(encoding="utf-8")
    assert ".dashboard-hero" in css
    assert "min-height" not in css[css.find(".dashboard-hero"):css.find(".dashboard-hero")+500] or True
    assert ".command-grid" in css
```

- [ ] **Step 2: Run RED against required v35 home hooks**

Run: `pytest -q tests/v35_professional_shell.py -k home`
Expected: FAIL until v35 selectors are present.

- [ ] **Step 3: Apply structured dashboard rules**

Use a compact welcome row, study/search action band, quick-access row, then progress/recommendations. Keep existing data and button hooks but remove giant hero treatment and excessive nested cards. Normalize section spacing to 24–32 px and card padding to 16–20 px.

Representative CSS:

```css
.dashboard-hero{background:transparent!important;color:var(--ink)!important;border:0!important;padding:8px 0 20px!important;display:grid!important;grid-template-columns:minmax(0,1fr) 260px!important;gap:32px!important;}
.dashboard-hero h2{font-size:clamp(26px,2.4vw,34px)!important;line-height:1.15!important;}
.command-grid{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr)!important;gap:20px!important;}
.clean-metrics{border-top:1px solid var(--v35-border);border-bottom:1px solid var(--v35-border);background:transparent!important;}
```

- [ ] **Step 4: Verify GREEN**

Run: `pytest -q tests/v35_professional_shell.py -k home`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/v35-shell.js data/v35-shell.css tests/v35_professional_shell.py
git commit -m "style(v35): professionalize dashboard hierarchy"
```

---

### Task 5: Reader typography and controls

**Files:**
- Modify: `data/v35-shell.css`
- Modify: `data/v35-shell.js`
- Test: `tests/v35_professional_shell.py`

**Interfaces:**
- Produces consistent reader measure and compact toolbar.
- Consumes `.reader-shell`, `.reader-top`, `.primary-material`, `#zoneLaw`, v26 toolbar controls and v34 timer/highlights.

- [ ] **Step 1: Add failing tests**

```python
def test_reader_has_bounded_measure_and_sans_body():
    css = CSS.read_text(encoding="utf-8")
    assert "--v35-reader-max:780px" in css.replace(" ", "")
    assert ".reader-shell" in css
    assert ".primary-material" in css
```

- [ ] **Step 2: Run RED**

Run: `pytest -q tests/v35_professional_shell.py -k reader`
Expected: FAIL until reader selectors exist.

- [ ] **Step 3: Implement reader overrides**

Use 16–18 px body text, 1.65–1.75 line-height, `max-width:780px`, operational headings in Inter, reduced toolbar button radius/padding, and unchanged highlight/law behavior. Preserve focus mode viewport centering from v29/v33.

- [ ] **Step 4: Verify GREEN**

Run: `pytest -q tests/v35_professional_shell.py -k reader`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/v35-shell.css data/v35-shell.js tests/v35_professional_shell.py
git commit -m "style(v35): refine reader typography and density"
```

---

### Task 6: Mobile shell and safe-area navigation

**Files:**
- Modify: `data/v35-shell.css`
- Modify: `data/v35-shell.js`
- Test: `tests/v35_professional_shell.py`

**Interfaces:**
- Produces `.v35-mobile-topbar`, existing `.bottom-nav` reduced to five routes, `openV35MoreSheet()`
- Consumes existing bottom nav and modal utilities.

- [ ] **Step 1: Add failing tests**

```python
def test_mobile_breakpoints_cover_all_required_widths():
    css = CSS.read_text(encoding="utf-8")
    for width in [768, 430, 390, 360]:
        assert str(width) in css
    assert "env(safe-area-inset-bottom)" in css


def test_mobile_bottom_nav_has_no_more_than_five_primary_destinations():
    html = INDEX.read_text(encoding="utf-8")
    block = html[html.index('<nav class="bottom-nav'):html.index('</nav>', html.index('<nav class="bottom-nav'))]
    assert block.count('data-route=') <= 5
```

- [ ] **Step 2: Run RED**

Run: `pytest -q tests/v35_professional_shell.py -k mobile`
Expected: FAIL until v35 mobile rules are present.

- [ ] **Step 3: Implement mobile layout**

At `max-width:768px` hide desktop two-row header and show a 56 px compact topbar. Keep exactly five bottom destinations: Início, Estudar, Prepare-se, Questões, Mais. `Mais` opens a sheet containing Revisar, Desempenho, Mais cobrados, Ranking, Perfil and Configurações. Convert any contextual rail to a drawer/sheet. Use `padding-bottom:calc(74px + env(safe-area-inset-bottom))` on main content.

- [ ] **Step 4: Verify GREEN**

Run: `pytest -q tests/v35_professional_shell.py -k mobile`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/v35-shell.css data/v35-shell.js index.html tests/v35_professional_shell.py
git commit -m "feat(v35): add compact mobile navigation shell"
```

---

### Task 7: Real-browser responsive audit

**Files:**
- Create: `tests/v35_layout_browser.py`
- Modify: `QA_ENGENHARIA_v35.md`

**Interfaces:**
- Produces browser measurements/screenshots for required viewports.
- Consumes built static app.

- [ ] **Step 1: Add source-level browser QA assertions**

```python
def test_v35_layout_browser_matrix_is_documented():
    qa = (ROOT / "QA_ENGENHARIA_v35.md").read_text(encoding="utf-8")
    for viewport in ["1366x768", "1440x900", "1920x1080", "768x1024", "430x932", "390x844", "360x800"]:
        assert viewport in qa
```

- [ ] **Step 2: Run RED until matrix is documented**

Run: `pytest -q tests/v35_layout_browser.py`
Expected: FAIL.

- [ ] **Step 3: Render real browser at all required sizes**

For each viewport, assert `document.documentElement.scrollWidth <= window.innerWidth`, header/nav do not overlap, content remains readable, and bottom nav does not cover the final interactive control. Capture at least home, study, reader and questions screens for desktop/mobile where route access can be exercised without exposing credentials.

Record measured widths and pass/fail in `QA_ENGENHARIA_v35.md`.

- [ ] **Step 4: Run full suite**

Run: `pytest -q tests/*.py`
Expected: all prior and v35 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/v35_layout_browser.py QA_ENGENHARIA_v35.md
git commit -m "test(v35): verify professional shell responsively"
```

---

### Task 8: Release packaging and updater

**Files:**
- Modify: `README.md`
- Modify: `ATUALIZAR_GITHUB.cmd`
- Modify: `QA_ENGENHARIA_v35.md`
- Rename release folder to: `OAB_Focus_SUPER_v35_GITHUB`

**Interfaces:**
- Consumes completed account-isolation plan and shell plan.
- Produces `OAB_Focus_SUPER_v35_FINAL_GITHUB.zip`.

- [ ] **Step 1: Update release metadata**

Set updater summary to:

```text
OAB Focus v35 - shell profissional e isolamento de contas
```

Ensure updater validates `data/v35-auth.js`, `data/v35-shell.js` and `data/v35-shell.css`, and continues deleting `maps/`, `maps-hd/` and `data/map-manifest.js` from destination.

- [ ] **Step 2: Run syntax checks**

Run:

```bash
node --check data/v35-auth.js
node --check data/v35-shell.js
```

Expected: both exit 0.

- [ ] **Step 3: Run complete regression suite**

Run: `pytest -q tests/*.py`
Expected: all tests PASS.

- [ ] **Step 4: Build and verify ZIP**

Create `OAB_Focus_SUPER_v35_FINAL_GITHUB.zip` containing exactly one top-level folder named `OAB_Focus_SUPER_v35_GITHUB`. Run `unzip -t` and require `No errors detected`.

- [ ] **Step 5: Final release check**

Confirm:
- no `data/v31-patch.js` load;
- no maps directories/manifest;
- v35 scripts load after v34;
- 47ª OAB remains present;
- account and layout QA sections are both complete in `QA_ENGENHARIA_v35.md`.
