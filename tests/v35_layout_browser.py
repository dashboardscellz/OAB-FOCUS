from pathlib import Path
import re
import pytest
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
INDEX=ROOT/'index.html'; SHELL=ROOT/'data'/'v35-shell.js'; CSS=ROOT/'data'/'v35-shell.css'
VIEWPORTS=[(1366,768),(1440,900),(1920,1080),(768,1024),(430,932),(390,844),(360,800)]

def base_css():
    text=INDEX.read_text(encoding='utf-8')
    return '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>',text,re.S|re.I))+'\n'+CSS.read_text(encoding='utf-8')

APP_HTML='''<div id="app" class="app-shell"><aside class="sidebar"></aside><main class="main-area"><header class="topbar"></header><div id="content" class="content"><section class="dashboard-hero"><div class="dashboard-hero-copy"><span class="eyebrow">OAB FOCUS · SUA MESA DE ESTUDOS</span><h2>Manassés, seu próximo passo está aqui.</h2><p>Estude o conteúdo completo por capítulos, pratique e volte exatamente ao ponto onde parou.</p><div class="hero-actions"><button class="btn primary">Continuar estudo</button><button class="btn ghost">Abrir Prepare-se</button></div></div><aside class="hero-level-panel"><span>SEU NÍVEL</span><strong>LV 8</strong><b>Estrategista</b><div class="xp-track"><i style="width:63%"></i></div><small>12.490 XP acumulados</small></aside></section><section class="section command-grid"><article class="card command-card"><div><span class="eyebrow">HOJE</span><h3>Feche um ciclo completo</h3><p>Material explicado, questões e revisão.</p></div></article><article class="card path-card"><span class="eyebrow">PRIORIDADES</span><h3>O que estudar agora</h3><button class="trail-step"><span>01</span><div><b>Constitucional</b><small>Poder Constituinte Originário</small></div><em>novo</em></button></article></section></div></main><nav class="bottom-nav mobile-only"><button data-route="home" class="active"><span>⌂</span><small>Início</small></button><button data-route="study"><span>▤</span><small>Estudar</small></button><button data-route="prepare"><span>◎</span><small>Prepare-se</small></button><button data-route="questions"><span>?</span><small>Questões</small></button><button type="button" data-v35-mobile-more><span>•••</span><small>Mais</small></button></nav></div><div id="modalRoot"></div>'''
STUBS="""var route='home',profile={name:'Manassés',role:'admin'},currentStudy=null; function setRoute(r){route=r;} function openGlobalSearch(){} function openModal(x){document.getElementById('modalRoot').innerHTML=x;} function closeModal(){document.getElementById('modalRoot').innerHTML='';} function formatTime(){return '00:00';} window.OAB_V35_AUTH={logoutV35(){}};"""

@pytest.fixture(scope='module')
def browser():
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        yield b
        b.close()

def page_for(browser,w,h):
    page=browser.new_page(viewport={'width':w,'height':h})
    page.set_content(f'<html><head><style>{base_css()}</style></head><body>{APP_HTML}<script>{STUBS}</script></body></html>')
    page.add_script_tag(path=str(SHELL));page.wait_for_timeout(60);return page

def test_v35_layout_browser_matrix_is_documented():
    qa=(ROOT/'QA_ENGENHARIA_v35.md').read_text(encoding='utf-8')
    for w,h in VIEWPORTS: assert f'{w}x{h}' in qa

@pytest.mark.parametrize('w,h',VIEWPORTS)
def test_v35_shell_has_zero_horizontal_overflow(browser,w,h):
    page=page_for(browser,w,h)
    try:
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
        head=page.locator('.v35-global-header').bounding_box();assert head and head['width']>=w-2
        if w<=768:
            nav=page.locator('.bottom-nav').bounding_box();assert nav and nav['y']+nav['height']<=h+2
            assert page.locator('.v35-mobile-topbar').is_visible()
        else:
            assert page.locator('.v35-primary-nav').is_visible()
    finally: page.close()

def test_desktop_more_button_has_same_chrome_as_primary_routes(browser):
    page=page_for(browser,1440,900)
    try:
        styles=page.evaluate('''() => {
          const normal=document.querySelector('.v35-primary-nav > button[data-route="study"]');
          const more=document.querySelector('[data-v35-more]');
          const pick=el=>{const s=getComputedStyle(el);return {border:s.borderTopStyle,background:s.backgroundColor,color:s.color,fontSize:s.fontSize,fontWeight:s.fontWeight,paddingTop:s.paddingTop,paddingBottom:s.paddingBottom}};
          return {normal:pick(normal),more:pick(more)};
        }''')
        assert styles['more']==styles['normal']
    finally:
        page.close()

def test_study_and_reader_do_not_activate_duplicate_fixed_context_rail(browser):
    page=page_for(browser,1440,900)
    try:
        for route_name in ['study','reader']:
            state=page.evaluate('''routeName => {
              window.OAB_V35_SHELL.setV35ContextRail(routeName);
              const app=document.getElementById('app');
              const rail=document.querySelector('.v35-context-rail');
              const content=document.querySelector('.content');
              return {hasContext:app.classList.contains('v35-has-context'),railDisplay:getComputedStyle(rail).display,contentPaddingLeft:getComputedStyle(content).paddingLeft};
            }''', route_name)
            assert state['hasContext'] is False
            assert state['railDisplay']=='none'
    finally:
        page.close()

def test_admin_context_rail_stays_inside_centered_shell_without_overlap(browser):
    page=page_for(browser,1440,900)
    try:
        state=page.evaluate('''() => {
          window.OAB_V35_SHELL.setV35ContextRail('admin');
          const main=document.querySelector('.main-area').getBoundingClientRect();
          const rail=document.querySelector('.v35-context-rail').getBoundingClientRect();
          const content=document.querySelector('.content').getBoundingClientRect();
          return {mainX:main.x,mainRight:main.right,railRight:rail.right,contentX:content.x,scroll:document.documentElement.scrollWidth,inner:innerWidth};
        }''')
        assert state['mainX'] >= 90
        assert state['mainRight'] <= 1350
        assert state['railRight'] <= state['contentX']
        assert state['scroll'] <= state['inner'] + 2
    finally:
        page.close()

def test_navigation_does_not_accumulate_legacy_green_active_states(browser):
    page=page_for(browser,1440,900)
    try:
        state=page.evaluate("""() => {
          const nav=[...document.querySelectorAll('.v35-primary-nav > button[data-route]')];
          nav.find(b=>b.dataset.route==='home').classList.add('v34-active-state');
          nav.find(b=>b.dataset.route==='study').classList.add('v34-active-state');
          window.OAB_V35_SHELL.syncV35Navigation('prepare');
          return nav.map(b=>({route:b.dataset.route,active:b.classList.contains('active'),legacy:b.classList.contains('v34-active-state')}));
        }""")
        assert [x['route'] for x in state if x['active']]==['prepare']
        assert not any(x['legacy'] for x in state)
    finally:
        page.close()

def test_home_hero_is_compact_flat_and_uses_clear_action_hierarchy(browser):
    page=page_for(browser,1366,768)
    try:
        page.locator('.dashboard-hero .btn').nth(0).evaluate("e=>e.className='btn secondary'")
        page.locator('.dashboard-hero .btn').nth(1).evaluate("e=>e.className='btn ghost light'")
        state=page.evaluate("""() => {
          const hero=document.querySelector('.dashboard-hero');
          const primary=document.querySelector('.dashboard-hero .btn.secondary');
          const secondary=document.querySelector('.dashboard-hero .btn.ghost.light');
          const h=getComputedStyle(hero),p=getComputedStyle(primary),s=getComputedStyle(secondary);
          return {height:hero.getBoundingClientRect().height,shadow:h.boxShadow,radius:h.borderRadius,primaryBg:p.backgroundColor,primaryColor:p.color,secondaryBg:s.backgroundColor,secondaryBorder:s.borderTopColor};
        }""")
        assert state['height'] <= 190
        assert state['shadow']=='none'
        assert state['radius'] in ('0px','0')
        assert state['primaryBg'] not in ('rgba(0, 0, 0, 0)','rgb(255, 255, 255)')
        assert state['secondaryBg'] in ('rgb(255, 255, 255)','rgba(0, 0, 0, 0)')
    finally:
        page.close()

READER_HTML="""<div id='app' class='app-shell'><main class='main-area'><div id='content' class='content'><section class='v26-reader-shell'><div class='v26-reading-stage'><article id='readerArticle' class='reader-article v12'><header class='v18-doc-header'><div class='trail'>Constitucional › Teoria da Constituição › Poder Constituinte</div><div class='kicker'>Leitura principal</div><h1>Poder Constituinte</h1><p>Conteúdo integral desta unidade. A interface organiza a leitura sem reduzir ou substituir o material jurídico.</p><section id='v34StudyTimer' class='v34-study-timer'><div class='v34-time-card'><span><small>Sessão</small><b>00:11</b></span><span><small>Nesta unidade</small><b>00:11</b></span><span><small>Hoje</small><b>00:11</b></span><span><small>Total acumulado</small><b>00:11</b></span></div></section><div class='v18-doc-meta'><span>≈ 1 min de leitura</span><span>18 questões</span><span>6% lido</span></div></header><section class='study-zone' id='zoneTheory'><div class='study-zone-head'><div><span class='zone-kicker'>BASE DO ESTUDO</span><h2>Material explicado</h2><p>Trecho integral da unidade selecionada.</p></div></div><div class='primary-material'><section class='integral-section'><div class='integral-section-head'><span class='integral-kind'>TEORIA COMPLETA</span><h2>Teoria da Constituição › Poder Constituinte</h2></div><div class='integral-body'><h3>1. Poder Constituinte</h3><p>O poder constituinte é a capacidade de elaborar, modificar ou revogar uma Constituição.</p></div></section></div></section></article></div></section></div></main></div><div class='v18-highlight-dock'><span class='label'><b>GRIFAR</b><small>teoria, lei e súmulas</small></span><button></button><button></button><button></button><button class='tool'>Grifos</button></div>"""

def reader_page(browser,w=1366,h=768):
    page=browser.new_page(viewport={'width':w,'height':h})
    legacy="""body{margin:0}.content{width:min(calc(100% - 40px),1240px);margin:0 auto}.v26-reader-shell{width:100%;max-width:1240px;margin:0 auto}.v26-reading-stage{display:flex;justify-content:center}.v26-reading-stage #readerArticle{width:min(100%,980px);max-width:980px;padding:44px 62px 62px;box-sizing:border-box}.v18-doc-header{margin-bottom:38px}.v34-time-card{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.v34-time-card span{border:1px solid #ddd;padding:10px}.primary-material{border:1px solid #bcd;background:white;border-radius:18px;box-shadow:0 10px 30px #ddd}.integral-body{padding:22px 24px}.v18-highlight-dock{position:fixed;right:18px;bottom:18px;display:flex;gap:8px;padding:10px;background:white;border:1px solid #ddd}"""
    page.set_content(f"<html><head><style>{legacy}\n{CSS.read_text(encoding='utf-8')}</style></head><body class='v26-reader-active v18-reader-active'>{READER_HTML}</body></html>")
    return page

def test_reader_redesign_uses_wide_centered_article_and_integrated_timer(browser):
    page=reader_page(browser)
    try:
        state=page.evaluate("""() => { const article=document.querySelector('#readerArticle').getBoundingClientRect(); const timer=document.querySelector('#v34StudyTimer').getBoundingClientRect(); const dock=document.querySelector('.v18-highlight-dock').getBoundingClientRect(); return {articleX:article.x,articleW:article.width,timerX:timer.x,timerW:timer.width,dockCenter:dock.x+dock.width/2,viewport:innerWidth}; }""")
        assert state['articleW'] >= 900
        assert abs((state['articleX'] + state['articleW']/2) - state['viewport']/2) <= 4
        assert state['timerX'] >= state['articleX'] - 2
        assert state['timerX'] + state['timerW'] <= state['articleX'] + state['articleW'] + 2
        assert abs(state['dockCenter'] - state['viewport']/2) <= 4
    finally:
        page.close()
