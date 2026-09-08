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
