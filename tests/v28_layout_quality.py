from pathlib import Path
import pytest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
V26 = ROOT / 'data' / 'v26-patch.js'
V28 = ROOT / 'data' / 'v28-patch.js'

@pytest.fixture(scope='module')
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        yield b
        b.close()


def mount_reader(browser, width=1041, height=595, subtopic='Controle de Constitucionalidade e Efeitos das Decisões no Controle Concentrado de Constitucionalidade'):
    page = browser.new_page(viewport={'width': width, 'height': height})
    page.set_content('<html><body><div class="sidebar"></div><div class="topbar"></div><main><div id="content" class="content"></div></main></body></html>')
    page.add_script_tag(content=r'''
      window.route='study'; window.routePayload={discipline:'Constitucional'};
      window.progress={topics:{},answers:{},highlights:{},readerNotes:{},readerPrefs:{},learningPath:{completed:{}},adaptive:{micro:{}}};
      window.qFilters={}; window.QUESTIONS=[]; window.OAB_QUESTIONS=[]; window.OAB_V16_QUESTION_MAP={};
      window.$=(s,r=document)=>r.querySelector(s); window.$$=(s,r=document)=>[...r.querySelectorAll(s)];
      window.esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      window.slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
      window.normalizeSearch=s=>window.slug(s).replace(/-/g,' ');
      window.markDirty=()=>{}; window.saveProgress=()=>Promise.resolve(); window.toast=()=>{};
      window.readerKey=(d,id)=>`${slug(d)}::${id}`;
      window.findDiscipline=name=>({id:'constitucional',name:'Constitucional'});
      window.disciplineChapters=()=>[{id:'chapter-direitos',title:'Direitos e Garantias Fundamentais',subtopics:['Controle de Constitucionalidade e Efeitos das Decisões no Controle Concentrado de Constitucionalidade'],hasTheory:true,theory:[],law:[]}];
      window.resolveStudyUnit=(disc,id)=>({id,title:'Direitos e Garantias Fundamentais',mode:'chapter',chapter:disciplineChapters()[0]});
      window.readingPositionFor=()=>null; window.subjectScore=()=>({n:0,raw:0});
      window.goBack=()=>{};
      window.safeRoute=(r,p)=>{ setRoute(r,p); if(r==='reader') renderReader(p); };
      window.setRoute=(r,p)=>{ route=r; routePayload=p||null; };
      window.renderQuestions=()=>{}; window.renderRoute=()=>{};
      window.extractSubtopics=(text='')=>String(text).split(/\n/).map(x=>x.trim()).filter(x=>x && x===x.toUpperCase());
      window.renderReader=(payload)=>{
        route='reader'; routePayload=payload;
        const c=document.getElementById('content');
        const title=payload.subtopicTitle||'Direitos e Garantias Fundamentais';
        c.innerHTML=`<div class="reader-shell v18-reader"><div class="v16-reader-grid"><aside class="v16-reader-toc"></aside><article id="readerArticle"><header class="v18-doc-header"><div class="trail">Constitucional › Direitos e Garantias Fundamentais › ${title}</div><h1>${title}</h1><p>Conteúdo integral desta unidade. A interface organiza a leitura sem reduzir o material jurídico.</p></header><section class="integral-section"><div class="integral-body"><p>${'Texto jurídico de exemplo para testar a largura confortável de leitura. '.repeat(80)}</p></div></section><button id="topicQuestions">Questões</button></article><aside class="v16-reader-status"></aside></div></div><div class="v18-highlight-dock">GRIFAR <button>Amarelo</button><button>Verde</button></div>`;
      };
    ''')
    page.add_script_tag(path=str(V26))
    page.add_script_tag(path=str(V28))
    page.evaluate("renderReader({discipline:'Constitucional',topicId:'chapter-direitos',subtopicTitle:%r})" % subtopic)
    page.wait_for_timeout(260)
    return page


def test_v28_script_is_loaded_after_v27():
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    assert '<script src="data/v28-patch.js"></script>' in html
    assert html.rfind('data/v28-patch.js') > html.rfind('data/v27-patch.js')


def test_v28_contract_exists():
    js=V28.read_text(encoding='utf-8')
    for token in ['isArtifactRawLine','isArtifactHeading','sanitizeReaderPayload','enhanceToolbar','buildBreadcrumb','decorateTitle','enhanceReaderLayout']:
        assert token in js


def test_table_like_pdf_line_is_rejected(browser):
    page=mount_reader(browser)
    try:
        assert page.evaluate("OAB_V28.isArtifactRawLine('STATUS DE EMENDA          STATUS DE NORMA SUPRALEGAL          STATUS DE')") is True
        assert page.evaluate("OAB_V28.isArtifactHeading('STATUS DE EMENDA STATUS DE NORMA SUPRALEGAL STATUS DE')") is True
    finally: page.close()


def test_legitimate_long_legal_heading_is_preserved(browser):
    page=mount_reader(browser)
    try:
        assert page.evaluate("OAB_V28.isArtifactHeading('Controle de Constitucionalidade e Efeitos das Decisões no Controle Concentrado de Constitucionalidade')") is False
    finally: page.close()


def test_stale_artifact_route_is_sanitized(browser):
    page=mount_reader(browser)
    try:
        result=page.evaluate("OAB_V28.sanitizeReaderPayload({discipline:'Constitucional',topicId:'chapter-direitos',subtopicTitle:'STATUS DE EMENDA STATUS DE NORMA SUPRALEGAL STATUS DE'})")
        assert result['topicId']=='chapter-direitos'
        assert result.get('subtopicTitle','')==''
    finally: page.close()


def test_toolbar_has_primary_navigation_and_disclosed_reading_settings(browser):
    page=mount_reader(browser)
    try:
        assert page.locator('.v28-toolbar-primary [data-v26-view]').count()==4
        assert page.locator('[data-v28-reading-toggle]').count()==1
        assert page.locator('[data-v28-reading-panel]').count()==1
        assert page.locator('.v26-toolbar-crumb').count()==0
        assert page.locator('[data-v28-reading-toggle]').get_attribute('aria-expanded')=='false'
    finally: page.close()


def test_reading_settings_escape_closes_and_restores_focus(browser):
    page=mount_reader(browser)
    try:
        toggle=page.locator('[data-v28-reading-toggle]')
        toggle.click()
        assert toggle.get_attribute('aria-expanded')=='true'
        page.keyboard.press('Escape')
        assert toggle.get_attribute('aria-expanded')=='false'
        assert page.evaluate("document.activeElement===document.querySelector('[data-v28-reading-toggle]')") is True
    finally: page.close()


def test_single_semantic_breadcrumb(browser):
    page=mount_reader(browser)
    try:
        crumbs=page.locator('nav[aria-label="Caminho do conteúdo"]')
        assert crumbs.count()==1
        assert crumbs.locator('[aria-current="page"]').count()==1
        assert page.locator('#readerArticle .trail').count()==0
    finally: page.close()


def test_long_title_gets_responsive_class(browser):
    page=mount_reader(browser)
    try:
        h1=page.locator('#readerArticle h1').first
        classes=h1.get_attribute('class') or ''
        assert 'v28-title-long' in classes or 'v28-title-very-long' in classes
    finally: page.close()


def test_1041_reader_toolbar_does_not_wrap_accidentally(browser):
    page=mount_reader(browser,1041,595)
    try:
        toolbar=page.locator('.v26-reader-toolbar')
        boxes=toolbar.locator(':scope > :not([hidden])').evaluate_all('els=>els.map(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom}))')
        # Desktop composition should remain a single deliberate row.
        assert max(x['top'] for x in boxes)-min(x['top'] for x in boxes) < 8
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
    finally: page.close()


@pytest.mark.parametrize('width',[320,360,390,430,768])
def test_reader_reflows_without_body_overflow(browser,width):
    page=mount_reader(browser,width,844)
    try:
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
        assert page.locator('.v26-reader-toolbar').count()==1
    finally: page.close()


def test_highlighter_dock_does_not_cover_last_reading_area(browser):
    page=mount_reader(browser,390,844)
    try:
        article=page.locator('#readerArticle')
        dock=page.locator('.v18-highlight-dock')
        assert article.evaluate("e=>parseFloat(getComputedStyle(e).paddingBottom)") >= 100
        if dock.count():
            assert dock.evaluate("e=>e.getBoundingClientRect().width") <= 390-20
    finally: page.close()
