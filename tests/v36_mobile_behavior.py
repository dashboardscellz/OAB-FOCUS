from pathlib import Path
import re
import pytest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / 'index.html').read_text(encoding='utf-8')
SHELL = (ROOT / 'data' / 'v35-shell.css').read_text(encoding='utf-8')
MOBILE = (ROOT / 'data' / 'v35-mobile-app.css').read_text(encoding='utf-8')


def base_styles():
    inline = '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', INDEX, re.S | re.I))
    return inline + '\n' + SHELL + '\n' + MOBILE


@pytest.fixture(scope='module')
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        yield b
        b.close()


def page(browser, width, height, route='questions', body_class='', content=''):
    p = browser.new_page(viewport={'width': width, 'height': height})
    html = f'''<!doctype html><html><head><style>{base_styles()}</style></head>
    <body class="{body_class}">
      <div id="app" class="app-shell" data-v3513-route="{route}">
        <header class="v35-global-header">
          <div class="v35-header-util">desktop util</div>
          <div class="v35-primary-nav">desktop nav</div>
          <div class="v35-mobile-topbar"><button class="v35-mobile-brand">OAB Focus</button><div class="v35-mobile-actions"><button>⌕</button></div></div>
        </header>
        <main class="main-area"><div class="content">{content}</div></main>
        <nav class="bottom-nav mobile-only">
          <button class="active"><span>⌂</span><small>Início</small></button><button><span>▤</span><small>Estudar</small></button><button><span>◎</span><small>Prepare-se</small></button><button><span>?</span><small>Questões</small></button><button><span>•••</span><small>Mais</small></button>
        </nav>
      </div>
    </body></html>'''
    p.set_content(html)
    return p


@pytest.mark.parametrize('width,height', [(360, 800), (375, 812), (393, 852)])
def test_phone_shell_has_no_horizontal_overflow_and_native_nav(browser, width, height):
    content = '<section class="question-panel"><p class="question-text">TextoExtremamenteLongoSemEspacosParaForcarAQuebraSemCriarScrollHorizontalNoPainelDaQuestao</p></section>'
    p = page(browser, width, height, content=content)
    try:
        assert p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
        assert p.locator('.v35-mobile-topbar').evaluate('e=>getComputedStyle(e).display') == 'flex'
        assert p.locator('.v35-header-util').evaluate('e=>getComputedStyle(e).display') == 'none'
        nav = p.locator('.bottom-nav').bounding_box()
        assert nav and nav['y'] + nav['height'] <= height + 1
        assert p.locator('.bottom-nav').evaluate('e=>getComputedStyle(e).position') == 'fixed'
    finally:
        p.close()


def test_study_toolbar_sits_below_safe_mobile_header(browser):
    content = '<div class="toolbar"><div class="search-box"><input></div></div><div style="height:1200px"></div>'
    p = page(browser, 393, 852, route='study', content=content)
    try:
        top = p.locator('.toolbar').evaluate('e=>parseFloat(getComputedStyle(e).top)')
        header_h = p.locator('.v35-global-header').evaluate('e=>e.getBoundingClientRect().height')
        assert top >= header_h - 1
    finally:
        p.close()


def test_question_side_stacks_only_below_xs_boundary(browser):
    cards = '<aside class="question-side"><div class="side-card">A</div><div class="side-card">B</div></aside>'
    p = page(browser, 375, 812, content=cards)
    try:
        a = p.locator('.side-card').nth(0).bounding_box(); b = p.locator('.side-card').nth(1).bounding_box()
        assert a and b and b['y'] >= a['y'] + a['height'] - 1
    finally:
        p.close()
    p = page(browser, 393, 852, content=cards)
    try:
        a = p.locator('.side-card').nth(0).bounding_box(); b = p.locator('.side-card').nth(1).bounding_box()
        assert a and b and abs(a['y'] - b['y']) < 2 and b['x'] > a['x']
    finally:
        p.close()


def test_reader_has_horizontal_gutter_and_bottom_clearance(browser):
    content = '''<section class="v26-reader-shell"><div class="v26-reading-stage"><article id="readerArticle"><div class="integral-section"><div class="integral-body"><p>Texto jurídico.</p></div></div></article></div></section><div class="v18-highlight-dock"><button class="tool">Grifo</button></div>'''
    p = page(browser, 393, 852, route='reader', body_class='v26-reader-active', content=content)
    try:
        body = p.locator('#readerArticle .integral-body')
        pl = body.evaluate('e=>parseFloat(getComputedStyle(e).paddingLeft)')
        pr = body.evaluate('e=>parseFloat(getComputedStyle(e).paddingRight)')
        pb = body.evaluate('e=>parseFloat(getComputedStyle(e).paddingBottom)')
        assert pl >= 12 and pr >= 12
        assert pb >= 80
        dock = p.locator('.v18-highlight-dock').bounding_box(); nav = p.locator('.bottom-nav').bounding_box()
        assert dock and nav and dock['y'] + dock['height'] <= nav['y'] - 5
    finally:
        p.close()


def test_keyboard_open_filter_sheet_uses_visual_viewport_height(browser):
    content = '<section class="v3513-filter-sheet" data-open="true"><div class="v3513-filter-body"><input></div></section>'
    p = page(browser, 393, 852, body_class='v3516-keyboard-open', content=content)
    try:
        p.evaluate("document.body.style.setProperty('--v3516-visual-h','500px')")
        max_h = p.locator('.v3513-filter-sheet').evaluate('e=>parseFloat(getComputedStyle(e).maxHeight)')
        assert 490 <= max_h <= 495
        assert p.locator('.bottom-nav').evaluate('e=>getComputedStyle(e).display') == 'none'
    finally:
        p.close()


def test_short_landscape_uses_mobile_shell_and_four_quick_actions(browser):
    content = '<div class="v3513-quick-grid">' + ''.join('<button class="v3513-quick-action">A</button>' for _ in range(4)) + '</div>'
    p = page(browser, 950, 500, route='home', content=content)
    try:
        assert p.locator('.v35-mobile-topbar').evaluate('e=>getComputedStyle(e).display') == 'flex'
        boxes = [p.locator('.v3513-quick-action').nth(i).bounding_box() for i in range(4)]
        assert all(boxes)
        assert max(b['y'] for b in boxes) - min(b['y'] for b in boxes) < 2
    finally:
        p.close()


def test_desktop_shell_is_unchanged_by_mobile_layer(browser):
    content = '<section class="dashboard-hero"><h2>Dashboard</h2></section>'
    p = page(browser, 1366, 900, route='home', content=content)
    try:
        assert p.locator('.v35-mobile-topbar').evaluate('e=>getComputedStyle(e).display') == 'none'
        assert p.locator('.bottom-nav').evaluate('e=>getComputedStyle(e).display') == 'none'
        assert p.locator('.v35-header-util').evaluate('e=>getComputedStyle(e).display') != 'none'
        width = p.locator('.content').bounding_box()['width']
        assert width < 1366
    finally:
        p.close()
