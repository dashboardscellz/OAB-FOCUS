from pathlib import Path
import re
import pytest
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
INDEX=ROOT/'index.html'; CSS=ROOT/'data'/'v35-shell.css'; MCSS=ROOT/'data'/'v35-mobile-app.css'; MJS=ROOT/'data'/'v35-mobile-app.js'

@pytest.fixture(scope='module')
def browser():
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);yield b;b.close()

def page(browser):
    raw=INDEX.read_text(encoding='utf-8'); base='\n'.join(re.findall(r'<style[^>]*>(.*?)</style>',raw,re.S|re.I))
    p=browser.new_page(viewport={'width':390,'height':844})
    p.set_content(f'''<html><head><style>{base}\n{CSS.read_text(encoding='utf-8')}\n{MCSS.read_text(encoding='utf-8')}</style></head><body><div id="app" class="app-shell"><header class="v35-global-header"><div class="v35-mobile-topbar">OAB Focus</div></header><main class="main-area"><div id="content" class="content"><div class="filter-panel"><div class="filter-grid"><select id="fDisc"><option value="">Todas</option><option value="Processo Penal">Processo Penal</option></select><select id="fTopic"><option value="">Todos assuntos</option><option value="Inquérito Policial">Inquérito Policial</option></select><select id="fExam"><option value="">Todos exames</option><option>47º EOU</option></select><select id="fStatus"><option value="all">Todas</option><option value="wrong">Erradas</option></select><input id="fSearch" value=""></div><div class="filter-summary">5048 questões</div></div><div class="question-layout"><article class="question-panel"><div class="question-number">QUESTÃO 1</div><p class="question-text">Enunciado</p><div class="answers"><button class="answer">A</button></div></article><aside class="question-side"><div class="side-card">Stats</div></aside></div></div></main><nav class="bottom-nav"><button data-route="questions">Questões</button></nav></div><div id="modalRoot"></div><script>
      var route='questions', routePayload=null, profile={{name:'Cellzinho'}}, progress={{}};
      function safeRoute(r){{route=r}} function setRoute(r){{route=r}} function renderQuestions(){{}} function renderRoute(){{}}
      window.OAB_QUESTION_NAV={{enterBank(){{document.documentElement.dataset.bank='1'}}}};
      document.getElementById('fSearch').addEventListener('input',e=>document.documentElement.dataset.search=e.target.value);
      document.getElementById('fDisc').addEventListener('change',e=>document.documentElement.dataset.disc=e.target.value);
    </script></body></html>''')
    p.add_script_tag(path=str(MJS));p.wait_for_timeout(60);p.evaluate('window.OAB_MOBILE_APP.enhanceCurrentRoute()');return p

def test_question_bank_has_mobile_search_and_filter_button(browser):
    p=page(browser)
    try:
        assert p.locator('.v3513-question-tools').is_visible()
        assert p.locator('#v3513QuestionSearch').is_visible()
        assert p.locator('#v3513FilterToggle').is_visible()
    finally:p.close()

def test_real_filter_panel_is_moved_into_bottom_sheet_not_cloned(browser):
    p=page(browser)
    try:
        assert p.locator('.v3513-filter-sheet .filter-panel').count()==1
        assert p.locator('#fDisc').count()==1
        p.locator('#v3513FilterToggle').click()
        assert p.locator('.v3513-filter-sheet').get_attribute('data-open')=='true'
        p.wait_for_timeout(240)
        assert p.locator('#fDisc').is_visible()
    finally:p.close()

def test_search_proxy_drives_existing_search_input(browser):
    p=page(browser)
    try:
        p.locator('#v3513QuestionSearch').fill('inquérito')
        assert p.locator('#fSearch').input_value()=='inquérito'
        assert p.evaluate('document.documentElement.dataset.search')=='inquérito'
    finally:p.close()

def test_filter_controls_keep_existing_listeners(browser):
    p=page(browser)
    try:
        p.locator('#v3513FilterToggle').click()
        p.locator('#fDisc').select_option('Processo Penal')
        assert p.evaluate('document.documentElement.dataset.disc')=='Processo Penal'
    finally:p.close()

def test_question_panel_owns_mobile_width_and_side_moves_below(browser):
    p=page(browser)
    try:
        q=p.locator('.question-panel').bounding_box(); side=p.locator('.question-side').bounding_box();
        assert q and side
        assert q['width']>350
        assert side['y']>=q['y']+q['height']-2
        assert p.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
    finally:p.close()
