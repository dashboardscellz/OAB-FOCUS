from pathlib import Path
import re
import pytest
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
INDEX=ROOT/'index.html'
MOBILE_CSS=ROOT/'data'/'v35-mobile-app.css'
MOBILE_JS=ROOT/'data'/'v35-mobile-app.js'
SHELL_CSS=ROOT/'data'/'v35-shell.css'

VIEWPORTS=[(375,812),(390,844),(430,932),(768,1024)]

@pytest.fixture(scope='module')
def browser():
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        yield b
        b.close()

def base_styles():
    txt=INDEX.read_text(encoding='utf-8')
    return '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>',txt,re.S|re.I))+'\n'+SHELL_CSS.read_text(encoding='utf-8')+'\n'+MOBILE_CSS.read_text(encoding='utf-8')

def make_page(browser,w=390,h=844,route='home',content='<section class="dashboard-hero"><h2>Desktop hero</h2></section>'):
    p=browser.new_page(viewport={'width':w,'height':h})
    html=f'''<html><head><style>{base_styles()}</style></head><body>
    <section id="loginView" class="login-shell login-v11 hidden"><div>LOGIN SHOULD NOT SHOW</div></section>
    <div id="app" class="app-shell">
      <header class="v35-global-header"><div class="v35-mobile-topbar"><button class="v35-mobile-brand" data-route="home">OAB Focus</button><div class="v35-mobile-actions"><button id="v35MobileSearch">⌕</button><button id="v35MobileProfile">○</button></div></div></header>
      <main class="main-area"><div id="content" class="content">{content}</div></main>
      <nav class="bottom-nav mobile-only"><button data-route="home"><span>⌂</span><small>Início</small></button><button data-route="study"><span>▤</span><small>Estudar</small></button><button data-route="prepare"><span>◎</span><small>Prepare-se</small></button><button data-route="questions"><span>?</span><small>Questões</small></button><button data-v35-mobile-more><span>•••</span><small>Mais</small></button></nav>
    </div><div id="modalRoot"></div>
    <script>
      var route={route!r}, routePayload=null;
      var profile={{name:'Cellzinho Oliveira',username:'cellzinho',role:'user'}};
      var progress={{preparePlan:{{active:true,targetExam:'48º EOU'}},days:{{}},highlights:{{}},answers:{{}}}};
      function stats(){{return {{answered:88,accuracy:74,streak:4,studySec:3600,questionSec:900,wrong:12}}}}
      function levelInfo(){{return {{level:5,name:'Estrategista',pct:42,xp:840,prev:700,next:1000}}}}
      function currentOrRecommended(){{return {{discipline:'Constitucional',id:'chapter-poder-constituinte',title:'Poder Constituinte',mode:'chapter'}}}}
      function todayKey(){{return '2026-09-09'}}
      function preparePriorityItems(){{return [{{discipline:'Constitucional',topic:'Poder Constituinte',target:{{id:'chapter-poder-constituinte',title:'Poder Constituinte'}}}}]}}
      function formatTime(s){{return '01:15'}}
      function esc(s){{return String(s)}}
      function safeRoute(r,p){{route=r;routePayload=p||null;document.documentElement.dataset.lastRoute=r}}
      function setRoute(r,p){{safeRoute(r,p)}}
      function renderHome(){{document.getElementById('content').innerHTML='<section class="dashboard-hero"><h2>Desktop hero</h2></section>'}}
      function renderStudy(){{}}
      function renderPrepare(){{}}
      function renderQuestions(){{}}
      function renderRoute(){{}}
      function openGlobalSearch(){{}}
      window.OAB_QUESTION_NAV={{enterBank(){{document.documentElement.dataset.enteredBank='1'}}}};
    </script></body></html>'''
    p.set_content(html)
    p.add_script_tag(path=str(MOBILE_JS))
    p.wait_for_timeout(80)
    return p

def test_mobile_files_are_loaded_last_with_v3513_cache_bust():
    txt=INDEX.read_text(encoding='utf-8')
    assert 'data/v35-mobile-app.css?v=35.17' in txt
    assert 'data/v35-mobile-app.js?v=35.17' in txt
    assert txt.rfind('v35-mobile-app.js') > txt.rfind('v35-question-navigation.js')

def test_hidden_login_cannot_override_authenticated_app(browser):
    p=make_page(browser)
    try:
        assert p.locator('#loginView').evaluate("e=>getComputedStyle(e).display") == 'none'
        assert p.locator('#app').is_visible()
    finally:p.close()

@pytest.mark.parametrize('w,h',VIEWPORTS)
def test_mobile_shell_has_no_horizontal_overflow_and_bottom_nav_is_safe(browser,w,h):
    p=make_page(browser,w,h)
    try:
        assert p.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
        nav=p.locator('.bottom-nav').bounding_box(); assert nav
        assert nav['y']+nav['height'] <= h+2
        assert p.locator('.v35-mobile-topbar').is_visible()
    finally:p.close()

def test_mobile_home_replaces_desktop_dashboard_with_app_actions(browser):
    p=make_page(browser,390,844,'home')
    try:
        p.evaluate('window.OAB_MOBILE_APP.enhanceCurrentRoute()')
        assert p.locator('.v3513-mobile-home').is_visible()
        assert p.locator('.dashboard-hero').count()==0
        labels=p.locator('.v3513-quick-action').all_inner_texts()
        joined=' '.join(labels)
        for expected in ['Estudar','Questões','Prepare-se','Revisar']:
            assert expected in joined
        assert p.locator('.v3513-continue').is_visible()
    finally:p.close()

def test_mobile_quick_action_routes_through_existing_router(browser):
    p=make_page(browser,390,844,'home')
    try:
        p.evaluate('window.OAB_MOBILE_APP.enhanceCurrentRoute()')
        p.locator('.v3513-quick-action[data-mobile-go="questions"]').click()
        assert p.evaluate('document.documentElement.dataset.enteredBank')=='1'
        assert p.evaluate('document.documentElement.dataset.lastRoute')=='questions'
    finally:p.close()

def test_desktop_does_not_replace_home(browser):
    p=make_page(browser,1366,900,'home')
    try:
        p.evaluate('window.OAB_MOBILE_APP.enhanceCurrentRoute()')
        assert p.locator('.dashboard-hero').count()==1
        assert p.locator('.v3513-mobile-home').count()==0
    finally:p.close()

def test_study_cards_become_single_touch_rows_on_phone(browser):
    content='''<section class="study-hero"><h2>Estudar</h2></section><div class="toolbar"><div class="search-box"><input></div></div><div class="discipline-grid"><article class="discipline-card"><div class="disc-top"><span class="disc-initial">CO</span><span class="disc-score">70%</span></div><h3>Constitucional</h3><p>Visão geral</p></article><article class="discipline-card"><div class="disc-top"><span class="disc-initial">PP</span></div><h3>Processo Penal</h3><p>Visão geral</p></article></div>'''
    p=make_page(browser,390,844,'study',content)
    try:
        p.evaluate('window.OAB_MOBILE_APP.enhanceCurrentRoute()')
        cards=p.locator('.discipline-card')
        assert cards.count()==2
        a,b=cards.nth(0).bounding_box(),cards.nth(1).bounding_box()
        assert a and b and b['y']>a['y']+a['height']-2
        assert a['width']>340
    finally:p.close()


def test_render_wrapper_reapplies_mobile_home_after_legacy_render(browser):
    p=make_page(browser,390,844,'home')
    try:
        p.evaluate("document.getElementById('content').innerHTML='<div id=sentinel>before</div>'; renderHome()")
        p.wait_for_timeout(140)
        assert p.locator('.v3513-mobile-home').is_visible()
        assert p.locator('.dashboard-hero').count()==0
    finally:p.close()

def test_current_prepare_renderer_classes_stack_as_mobile_cards(browser):
    content='''<section class="v18-prepare-hero"><h2>48º EOU · jornada de aprendizagem</h2><p>Plano.</p></section><section class="v18-plan-grid"><article class="v18-today"><div class="v18-today-head"><div><h3>Etapa 1 · Constitucional</h3><p>Aprenda antes de cobrar.</p></div></div><div class="v18-learning-step"><span>1</span><div>Teoria</div><button class="btn">Continuar</button></div></article><aside class="v18-plan-side"><div class="v18-plan-card">Cobertura</div></aside></section>'''
    p=make_page(browser,390,844,'prepare',content)
    try:
        p.evaluate('window.OAB_MOBILE_APP.enhanceCurrentRoute()')
        today=p.locator('.v18-today').bounding_box(); side=p.locator('.v18-plan-side').bounding_box()
        assert today and side and side['y']>=today['y']+today['height']-2
        assert p.locator('.v18-learning-step .btn').evaluate('e=>e.getBoundingClientRect().height')>=44
    finally:p.close()

def test_reader_mobile_measure_and_touch_targets(browser):
    content='''<section class="v26-reader-shell"><div class="v26-reading-stage"><article id="readerArticle"><header class="v18-doc-header"><h1>Poder Constituinte</h1></header><button class="pill-btn">Teoria</button><section class="integral-section"><div class="integral-body"><p>Texto jurídico para leitura.</p></div></section></article></div></section>'''
    p=make_page(browser,390,844,'reader',content)
    try:
        p.evaluate('window.OAB_MOBILE_APP.enhanceCurrentRoute()')
        article=p.locator('#readerArticle').bounding_box(); assert article
        assert article['width'] <= 390
        assert p.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
        assert p.locator('.pill-btn').evaluate('e=>e.getBoundingClientRect().height') >= 44
    finally:p.close()
