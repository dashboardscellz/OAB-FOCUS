from pathlib import Path
import re
import pytest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'index.html'
V26 = ROOT / 'data' / 'v26-patch.js'
V28 = ROOT / 'data' / 'v28-patch.js'
V29 = ROOT / 'data' / 'v29-patch.js'


def base_css():
    text = INDEX.read_text(encoding='utf-8')
    return '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', text, re.S | re.I))


@pytest.fixture(scope='module')
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        yield b
        b.close()


def page_with_css(browser, body, width=1024, height=800):
    page = browser.new_page(viewport={'width': width, 'height': height})
    page.set_content(f'<html><head><style>{base_css()}</style></head><body>{body}</body></html>')
    if V29.exists():
        page.add_script_tag(path=str(V29))
    page.wait_for_timeout(30)
    return page


def shell(inner):
    return f'<div class="app-shell"><aside class="sidebar"></aside><main class="main-area">{inner}</main></div>'


def test_v29_script_is_loaded_last():
    html = INDEX.read_text(encoding='utf-8')
    assert '<script src="data/v29-patch.js?v=35.9"></script>' in html
    assert html.rfind('data/v29-patch.js') > html.rfind('data/v28-patch.js')


def mount_reader(browser, width=1366, height=900):
    page = browser.new_page(viewport={'width': width, 'height': height})
    page.set_content('''
      <html><head><style>
        :root{--sidebar:264px;--line:#e4e8ec;--surface:#fff;--surface-2:#f4f6f8;--ink:#0d1b2a;--muted:#5a6675;--brand:#2458d3}
        *{box-sizing:border-box} body{margin:0}.sidebar{position:fixed;left:0;top:0;bottom:0;width:264px}.main-area{margin-left:264px;min-height:100vh}.content{padding:28px 34px 64px;max-width:1440px;margin:0 auto}
        #readerArticle{background:#fff;border:1px solid #e4e8ec;border-radius:20px;min-height:1800px}
      </style></head><body>
        <aside class="sidebar"></aside><main class="main-area"><div id="content" class="content"></div></main>
        <div class="v18-highlight-dock">GRIFAR</div>
      </body></html>
    ''')
    page.add_script_tag(content=r'''
      window.route='reader'; window.routePayload={discipline:'Constitucional',topicId:'teoria',subtopicTitle:'Poder Constituinte'};
      window.progress={topics:{teoria:{studySec:120}},answers:{},highlights:{},readerNotes:{},readerPrefs:{},learningPath:{completed:{}},adaptive:{micro:{}}};
      window.qFilters={}; window.OAB_QUESTIONS=[]; window.QUESTIONS=[]; window.OAB_V16_QUESTION_MAP={};
      window.$=(s,r=document)=>r.querySelector(s); window.$$=(s,r=document)=>[...r.querySelectorAll(s)];
      window.esc=s=>String(s??''); window.slug=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
      window.readerKey=(d,id)=>`${d}::${id}`; window.markDirty=()=>{}; window.saveProgress=()=>Promise.resolve(); window.toast=()=>{};
      window.findDiscipline=()=>({id:'constitucional',name:'Constitucional'});
      window.disciplineChapters=()=>[{id:'teoria',title:'Teoria da Constituição',subtopics:['Poder Constituinte']}];
      window.resolveStudyUnit=()=>({id:'teoria',title:'Teoria da Constituição',mode:'chapter',chapter:disciplineChapters()[0]});
      window.readingPositionFor=()=>null; window.safeRoute=()=>{}; window.goBack=()=>{}; window.setRoute=(r,p)=>{route=r;routePayload=p};
      window.renderRoute=()=>{}; window.renderQuestions=()=>{};
      window.renderReader=(payload)=>{
        route='reader'; routePayload=payload;
        document.getElementById('content').innerHTML=`<div class="reader-shell v18-reader"><div class="v16-reader-grid"><article id="readerArticle"><header class="v18-doc-header"><div class="trail">Constitucional › Teoria da Constituição › Poder Constituinte</div><h1>Poder Constituinte</h1><p>Conteúdo integral desta unidade.</p></header><section class="integral-section"><div class="integral-body"><p>${'Texto jurídico de leitura. '.repeat(160)}</p></div></section><button id="topicQuestions">Questões</button></article></div></div>`;
      };
    ''')
    page.add_script_tag(path=str(V26))
    page.add_script_tag(path=str(V28))
    if V29.exists(): page.add_script_tag(path=str(V29))
    page.evaluate("renderReader(routePayload)")
    page.wait_for_timeout(220)
    return page


def test_focus_uses_viewport_center_instead_of_sidebar_offset(browser):
    page = mount_reader(browser, 1366, 900)
    try:
        page.locator('[data-v28-reading-toggle]').click()
        page.locator('[data-v26-action="focus"]').click()
        page.wait_for_timeout(50)
        assert page.locator('body.v26-focus').count() == 1
        margin = page.locator('.main-area').evaluate("e=>parseFloat(getComputedStyle(e).marginLeft)")
        assert margin == 0
        centers = page.evaluate('''() => {
          const r=document.querySelector('#readerArticle').getBoundingClientRect();
          return {article:(r.left+r.right)/2, viewport:innerWidth/2, left:r.left, right:r.right};
        }''')
        assert abs(centers['article'] - centers['viewport']) <= 4
        assert centers['left'] >= 12 and centers['right'] <= 1366-12
    finally:
        page.close()


@pytest.mark.parametrize('width',[768,861,900,1024])
def test_prepare_configuration_never_overflows_its_card(browser,width):
    body=shell('''<div class="content"><div class="plan-config"><div class="plan-config-grid">
      <label>Prova-alvo<select><option>48º EOU · 20/12/2026</option></select></label>
      <label>Tempo real por dia<select><option>3 horas por dia</option></select></label>
      <label>Data personalizada<input type="date" value="2026-12-20"></label>
    </div></div></div>''')
    page=page_with_css(browser,body,width)
    try:
        grid=page.locator('.plan-config-grid')
        assert grid.evaluate('e=>e.scrollWidth <= e.clientWidth + 1')
        assert all(page.locator('.plan-config label').evaluate_all('els=>els.map(e=>e.scrollWidth <= e.clientWidth + 1)'))
        assert all(page.locator('.plan-config select,.plan-config input').evaluate_all('els=>els.map(e=>e.getBoundingClientRect().right <= e.parentElement.getBoundingClientRect().right + 1)'))
    finally: page.close()


def test_question_layout_does_not_crush_question_on_compact_desktop(browser):
    body=shell('''<div class="content"><div class="question-layout"><section class="question-panel"><p class="question-text">Enunciado jurídico longo.</p></section><aside class="question-side"><div class="side-card">Sessão</div></aside></div></div>''')
    page=page_with_css(browser,body,900)
    try:
        width=page.locator('.question-panel').evaluate('e=>e.getBoundingClientRect().width')
        assert width >= 430
    finally: page.close()


def test_prepare_choices_are_not_narrow_cards_on_compact_desktop(browser):
    body=shell('<div class="content"><div class="plan-options">'+''.join('<button class="plan-option"><strong>90</strong><b>dias</b><small>Construção sólida com revisão e prática.</small></button>' for _ in range(4))+'</div></div>')
    page=page_with_css(browser,body,1024)
    try:
        widths=page.locator('.plan-option').evaluate_all('els=>els.map(e=>e.getBoundingClientRect().width)')
        assert min(widths) >= 220
    finally: page.close()


def test_login_has_no_intrinsic_grid_overflow_in_breakpoint_gap(browser):
    body='''<section class="login-shell login-v11"><div class="login-showcase"><div class="showcase-main"><div class="showcase-photo-wrap"></div><div class="showcase-story"><h1>Estude para a OAB com método</h1></div></div></div><div class="login-form-v11"><form class="login-card login-card-v11"><h2>Acesso individual</h2><label>Usuário<input value="usuario"></label></form></div></section>'''
    page=page_with_css(browser,body,920)
    try:
        shell_el=page.locator('.login-v11')
        assert shell_el.evaluate('e=>e.scrollWidth <= e.clientWidth + 1')
    finally: page.close()


def test_ranking_identity_cannot_escape_its_cell(browser):
    body=shell('''<div class="content"><div class="platform-rank-row"><div class="platform-rank-pos">1</div><div class="platform-rank-user"><b>Nome de usuário extremamente comprido para testar quebra</b><small>usuario.muito.longo.sem.quebras@example.com</small></div><div>LV 123</div><div>123h</div><div>2336 questões</div></div></div>''')
    page=page_with_css(browser,body,360)
    try:
        cell=page.locator('.platform-rank-user')
        assert cell.evaluate('e=>e.scrollWidth <= e.clientWidth + 1')
    finally: page.close()


def test_admin_table_stacks_before_fixed_columns_become_too_wide(browser):
    body=shell('''<div class="content"><div class="admin-user-table"><div class="admin-user-head"><div>Usuário</div><div>Status</div><div>Nível</div><div>Atividade</div><div>Ações</div></div><div class="admin-user-row"><div class="admin-user-name"><b>Nome muito longo de usuário</b><small>email.muito.longo@example.com</small></div><div>Ativo</div><div>LV 25</div><div>Hoje</div><div class="admin-actions"><button class="btn">Aprovar</button><button class="btn">Suspender</button></div></div></div></div>''')
    page=page_with_css(browser,body,1024)
    try:
        assert page.locator('.admin-user-head').evaluate("e=>getComputedStyle(e).display") == 'none'
        row=page.locator('.admin-user-row')
        assert row.evaluate('e=>e.scrollWidth <= e.clientWidth + 1')
    finally: page.close()


def test_high_yield_card_stops_using_three_cramped_columns(browser):
    body=shell('''<div class="content"><article class="hy-card"><div class="hy-rank">01</div><div class="hy-title"><b>Controle de Constitucionalidade e Efeitos das Decisões no Controle Concentrado de Constitucionalidade</b></div><div class="hy-actions"><button class="btn primary">Estudar conteúdo</button><button class="btn ghost">Resolver questões</button></div></article></div>''')
    page=page_with_css(browser,body,1024)
    try:
        title_w=page.locator('.hy-title').evaluate('e=>e.getBoundingClientRect().width')
        assert title_w >= 360
        assert page.locator('.hy-card').evaluate('e=>e.scrollWidth <= e.clientWidth + 1')
    finally: page.close()


def test_long_unbroken_tokens_wrap_inside_common_blocks(browser):
    token='PROCESSO000000000000000000000000000000000000000000000000000000000000000'
    body=shell(f'''<div class="content"><article class="card"><h4>{token}</h4><p>{token}</p></article><div class="section-title"><h3>{token}</h3><a>Ver todos</a></div></div>''')
    page=page_with_css(browser,body,360)
    try:
        for sel in ['.card','.card h4','.section-title']:
            assert page.locator(sel).evaluate('e=>e.scrollWidth <= e.clientWidth + 1')
    finally: page.close()

def test_wide_reader_tables_scroll_inside_article_instead_of_page(browser):
    cells=''.join(f'<td>Coluna jurídica extremamente longa {i} com conteúdo sem redução</td>' for i in range(12))
    body=shell(f'''<div class="content"><article id="readerArticle"><div class="integral-body"><table><tbody><tr>{cells}</tr></tbody></table></div></article></div>''')
    page=page_with_css(browser,body,390)
    try:
        table=page.locator('#readerArticle table')
        assert table.evaluate("e=>['auto','scroll'].includes(getComputedStyle(e).overflowX)")
        assert page.locator('#readerArticle').evaluate('e=>e.scrollWidth <= e.clientWidth + 1')
    finally: page.close()
