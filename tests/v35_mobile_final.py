from pathlib import Path
import re
import pytest
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
INDEX=ROOT/'index.html'
BASE_CSS=ROOT/'data'/'v35-shell.css'
MOBILE_CSS=ROOT/'data'/'v35-mobile-app.css'
MOBILE_JS=ROOT/'data'/'v35-mobile-app.js'

VIEWPORTS=[(360,640),(375,667),(375,812),(390,844),(412,915),(430,932),(844,390)]

@pytest.fixture(scope='module')
def browser():
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        yield b
        b.close()

def styles():
    raw=INDEX.read_text(encoding='utf-8')
    inline='\n'.join(re.findall(r'<style[^>]*>(.*?)</style>',raw,re.S|re.I))
    return inline+'\n'+BASE_CSS.read_text(encoding='utf-8')+'\n'+MOBILE_CSS.read_text(encoding='utf-8')

def page(browser,w=390,h=844,route='home',content=''):
    p=browser.new_page(viewport={'width':w,'height':h})
    p.set_content(f'''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>{styles()}</style></head><body><div id="loginView" class="login-v11 hidden"></div><div id="app" class="app-shell"><header class="v35-global-header"><div class="v35-mobile-topbar"><div class="v35-mobile-brand">OAB Focus</div><div class="v35-mobile-actions"><button>⌕</button><button>○</button></div></div></header><main class="main-area"><div id="content" class="content">{content}</div></main><nav class="bottom-nav mobile-only"><button data-route="home"><span>⌂</span><small>Início</small></button><button data-route="study"><span>▤</span><small>Estudar</small></button><button data-route="prepare"><span>◎</span><small>Prepare-se</small></button><button data-route="questions"><span>?</span><small>Questões</small></button><button data-v35-mobile-more><span>•••</span><small>Mais</small></button></nav></div><div class="v35-sync-status saved" data-sync-status="saved">Salvo</div><div id="modalRoot"></div><script>var route={route!r};var routePayload=null;var profile={{name:'Cellzinho'}};var progress={{}};function stats(){{return {{accuracy:0,answered:0,wrong:0,streak:0}}}}function levelInfo(){{return {{level:1,name:'Calouro',pct:0,xp:0,prev:0,next:200}}}}function currentOrRecommended(){{return {{title:'Dos Crimes em Espécie',discipline:'Penal',id:'penal-crimes'}}}}function todayKey(){{return 'x'}}function safeRoute(r,p){{route=r}}function setRoute(r,p){{route=r}}function renderRoute(){{}}window.OAB_QUESTION_NAV={{enterBank(){{}},snapshot(){{return {{mode:'bank'}}}}}};</script></body></html>''')
    p.add_script_tag(path=str(MOBILE_JS));p.wait_for_timeout(80)
    p.evaluate('window.OAB_MOBILE_APP.enhanceCurrentRoute()')
    return p

def test_version_and_cache_are_v3516():
    idx=INDEX.read_text(encoding='utf-8')
    assert 'v35-mobile-app.css?v=35.16' in idx
    assert 'v35-mobile-app.js?v=35.16' in idx
    assert "const VERSION='35.16'" in MOBILE_JS.read_text(encoding='utf-8')

def test_home_level_and_today_never_escape_viewport(browser):
    for w,h in VIEWPORTS[:6]:
        p=page(browser,w,h,'home')
        try:
            for sel in ['.v3513-home-head','.v3513-level-pill','.v3513-section-title','.v3513-today','.v3513-quick-grid']:
                box=p.locator(sel).bounding_box(); assert box, sel
                assert box['x'] >= -1, (w,sel,box)
                assert box['x']+box['width'] <= w+1, (w,sel,box)
            assert p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
        finally:p.close()

def test_all_primary_mobile_targets_are_at_least_44px(browser):
    p=page(browser,390,844,'home')
    try:
        targets=p.locator('.v35-mobile-actions button,.bottom-nav button,.v3513-plan-card button')
        for i in range(targets.count()):
            b=targets.nth(i).bounding_box(); assert b
            assert b['height'] >= 44, (i,b)
            assert b['width'] >= 44, (i,b)
    finally:p.close()

def test_saved_status_is_transient_not_permanent_overlay(browser):
    p=page(browser,390,844,'home')
    try:
        sync=p.locator('[data-sync-status]')
        assert sync.count()==1
        p.wait_for_timeout(1900)
        assert sync.evaluate("e=>getComputedStyle(e).opacity") == '0'
        assert sync.evaluate("e=>getComputedStyle(e).pointerEvents") == 'none'
    finally:p.close()

def test_reader_highlighter_and_bottom_nav_do_not_overlap(browser):
    content='''<section class="v26-reader-shell"><div class="v26-reader-toolbar"><button class="v26-toolbar-btn">Voltar</button></div><div class="v26-reading-stage"><article id="readerArticle"><section class="integral-body"><p>Texto jurídico longo para leitura confortável no celular.</p></section></article></div></section>'''
    p=page(browser,390,844,'reader',content)
    try:
        p.evaluate("document.body.classList.add('v26-reader-active'); const d=document.createElement('div');d.className='v18-highlight-dock';d.innerHTML='<span class=label><b>GRIFAR</b><small>teoria, lei e súmulas</small></span>'+['yellow','green','blue','pink','purple','orange'].map(x=>'<button class=\"v18-color '+x+'\"></button>').join('')+'<button class=tool>Grifos <span class=count>0</span></button>';document.body.appendChild(d)")
        p.wait_for_timeout(50)
        nav=p.locator('.bottom-nav').bounding_box(); dock=p.locator('.v18-highlight-dock').bounding_box(); assert nav and dock
        assert dock['y']+dock['height'] <= nav['y']-6, (dock,nav)
        assert dock['x']>=8 and dock['x']+dock['width']<=382
        assert p.locator('.v18-highlight-dock .label').evaluate("e=>getComputedStyle(e).display")=='none'
    finally:p.close()

def test_reader_body_text_and_question_text_are_mobile_readable():
    css=MOBILE_CSS.read_text(encoding='utf-8')
    assert re.search(r'question-text\{[^}]*font-size:1(?:\.0+)?rem',css)
    assert re.search(r'integral-body p[^}]*font-size:1(?:\.0+)?rem',css)

def test_mobile_safe_area_and_landscape_constraints(browser):
    css=MOBILE_CSS.read_text(encoding='utf-8')
    assert 'safe-area-inset-top' in css
    assert 'safe-area-inset-bottom' in css
    p=page(browser,844,390,'home')
    try:
        assert p.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
        nav=p.locator('.bottom-nav').bounding_box(); assert nav
        assert nav['y']+nav['height'] <= 391
    finally:p.close()


def test_last_loaded_mobile_runtime_css_beats_legacy_reader_patch(browser):
    p=page(browser,390,844,'reader','<section class="v26-reader-shell"><div class="v26-reading-stage"><article id="readerArticle"><p>Leitura</p></article></div></section>')
    try:
        # Simulates v28's dynamically injected mobile rule that historically moved the dock onto the bottom nav.
        p.evaluate("const legacy=document.createElement('style');legacy.id='legacy-v28-sim';legacy.textContent='@media(max-width:760px){body.v26-reader-active .v18-highlight-dock{left:12px!important;right:12px!important;width:auto!important;max-width:none!important;bottom:10px!important}}';document.head.appendChild(legacy);document.body.classList.add('v26-reader-active');const d=document.createElement('div');d.className='v18-highlight-dock';d.innerHTML='<button class=\"v18-color yellow\"></button><button class=tool>Grifos</button>';document.body.appendChild(d);window.OAB_MOBILE_APP.installRuntimeCss?.();")
        p.wait_for_timeout(40)
        assert p.locator('#v3516-mobile-runtime-css').count()==1
        nav=p.locator('.bottom-nav').bounding_box();dock=p.locator('.v18-highlight-dock').bounding_box();assert nav and dock
        assert dock['y']+dock['height'] <= nav['y']-6,(dock,nav)
        assert p.locator('#v3516-mobile-runtime-css').evaluate("e=>e.compareDocumentPosition(document.getElementById('legacy-v28-sim')) & Node.DOCUMENT_POSITION_PRECEDING") != 0
    finally:p.close()
