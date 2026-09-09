from pathlib import Path

import pytest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
V26 = ROOT / 'data' / 'v26-patch.js'


@pytest.fixture(scope='module')
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        yield b
        b.close()


def mount_reader(browser, width=1366, height=900):
    page = browser.new_page(viewport={'width': width, 'height': height})
    page.set_content('''
      <html><body>
        <div class="sidebar"></div><div class="topbar"></div>
        <main class="main-area"><div id="content" class="content"></div></main>
        <div class="v18-highlight-dock">GRIFAR</div>
      </body></html>
    ''')
    page.add_script_tag(content=r'''
      window.route='reader';
      window.routePayload={discipline:'Constitucional',topicId:'constitucional-teoria',subtopicTitle:'Poder Constituinte'};
      window.__prevRoute={route:'prepare',payload:{day:2}};
      window.progress={
        topics:{'constitucional-teoria':{studySec:420}},
        answers:{q1:{correct:true},q2:{correct:false},q9:{correct:true}},
        highlights:{'Constitucional::constitucional-teoria::poder-constituinte':[
          {id:'h1',color:'yellow',quote:'trecho amarelo',sectionKey:'sec-1',start:0,end:14},
          {id:'h2',color:'blue',quote:'trecho azul',sectionKey:'sec-2',start:2,end:12}
        ]},
        readerNotes:{},
        adaptive:{micro:{}}
      };
      window.OAB_V16_QUESTION_MAP={q1:{strict:true,discipline:'Constitucional',chapterId:'constitucional-teoria',subtopicStrict:true,subtopicTitle:'Poder Constituinte'},q2:{strict:true,discipline:'Constitucional',chapterId:'constitucional-teoria',subtopicStrict:true,subtopicTitle:'Poder Constituinte'},q9:{strict:true,discipline:'Civil',chapterId:'civil-outro',subtopicStrict:true,subtopicTitle:'Outro'}};
      window.qFilters={}; window.qIndex=0;
      window.$=(s,r=document)=>r.querySelector(s); window.$$=(s,r=document)=>[...r.querySelectorAll(s)];
      window.esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      window.slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      window.markDirty=()=>{}; window.toast=()=>{}; window.saveProgress=()=>Promise.resolve();
      window.setRoute=(r,p)=>{ window.route=r; window.routePayload=p||null; };
      window.safeRoute=(r,p)=>window.setRoute(r,p);
      window.goBack=(fallback)=>{ window.route=(window.__prevRoute||fallback).route; window.routePayload=(window.__prevRoute||fallback).payload||null; };
      window.findDiscipline=name=>({id:'constitucional',name:'Constitucional'});
      window.resolveStudyUnit=(disc,id)=>({id:'constitucional-teoria',title:'Teoria da Constituição',chapter:{id:'constitucional-teoria',title:'Teoria da Constituição',subtopics:['Poder Constituinte','Poder Constituinte Originário','Poder Constituinte Derivado'],hasTheory:true}});
      window.disciplineChapters=disc=>[
        {id:'constitucional-teoria',title:'Teoria da Constituição',subtopics:['Poder Constituinte','Poder Constituinte Originário','Poder Constituinte Derivado'],hasTheory:true},
        {id:'constitucional-direitos',title:'Direitos Fundamentais',subtopics:['Dimensões dos Direitos Fundamentais','Aplicabilidade'],hasTheory:true}
      ];
      window.readerKey=(d,id)=>`${d}::${id}`;
      window.renderRoute=()=>{};
      window.renderReader=(payload)=>{
        const content=document.getElementById('content');
        content.innerHTML=`
          <div class="reader-shell v18-reader">
            <div class="v17-reader-chrome"><button id="legacyBack">Voltar</button></div>
            <div class="v16-reader-grid">
              <aside class="v16-reader-toc"><div class="toc-label">NESTA LEITURA</div><button class="v16-toc-link active">Poder Constituinte</button></aside>
              <article id="readerArticle">
                <header class="v18-doc-header"><div class="trail">Constitucional › Teoria da Constituição › Poder Constituinte</div><h1>Poder Constituinte</h1><p>Conteúdo integral desta unidade.</p></header>
                <section class="study-zone" id="zoneTheory"><div class="primary-material">
                  <section class="integral-section" data-section-key="sec-1" id="sec-1"><h2>1. Poder Constituinte</h2><div class="integral-body"><p>${'Texto jurídico de teste. '.repeat(45)}</p></div></section>
                  <section class="integral-section" data-section-key="sec-2" id="sec-2"><h2>2. Poder Constituinte Originário</h2><div class="integral-body"><p>${'Segundo bloco de conteúdo. '.repeat(45)}</p></div></section>
                  <section class="integral-section" data-section-key="sec-3" id="sec-3"><h2>3. Poder Constituinte Derivado</h2><div class="integral-body"><p>${'Terceiro bloco de conteúdo. '.repeat(45)}</p></div></section>
                </div></section>
                <section id="zoneQuestions"><button id="topicQuestions">Resolver 18 questões</button></section>
                <section class="v16-reader-end"><div class="v16-reader-end-card"><button id="v16CompleteUnit">Marcar como estudado</button><button id="v18CompleteUnit">Marcar como estudada</button><button id="v16EndQuestions">Questões (18)</button></div></section>
              </article>
              <aside class="v16-reader-status"><div class="v16-status-card"><small>Progresso nesta leitura</small><strong>24%</strong></div><div class="v16-status-card"><small>Questões desta unidade</small><strong>18</strong></div><div class="v16-status-card"><small>Grifos nesta unidade</small><strong>2</strong></div></aside>
            </div>
          </div>`;
        document.getElementById('topicQuestions').onclick=()=>{ window.qFilters={questionIds:['q1','q2','q3'],studyContext:{discipline:'Constitucional',label:'Poder Constituinte',chapterId:'constitucional-teoria',subtopic:'Poder Constituinte'}}; window.safeRoute('questions'); };
        document.getElementById('v16CompleteUnit').onclick=()=>{ window.progress.topics['constitucional-teoria'].completedAt=Date.now(); };
        document.getElementById('v18CompleteUnit').onclick=()=>{ window.progress.learningPath={completed:{'Constitucional|constitucional-teoria|poder-constituinte':{at:Date.now()}},version:18}; };
      };
    ''')
    page.add_script_tag(path=str(V26))
    page.evaluate("renderReader(routePayload)")
    page.wait_for_timeout(220)
    return page


def test_v26_script_is_loaded_last():
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    assert '<script src="data/v26-patch.js?v=36.0"></script>' in html
    assert html.rfind('data/v26-patch.js') > html.rfind('data/v25-patch.js')


def test_v26_session_contract_exists():
    js = V26.read_text(encoding='utf-8')
    for token in ['readerSession', 'setView', 'returnToReading', 'scrollAnchor', 'origin']:
        assert token in js


def test_single_column_reader_removes_permanent_sidebars(browser):
    page=mount_reader(browser)
    try:
        assert page.locator('.v16-reader-toc').count() == 0
        assert page.locator('.v16-reader-status').count() == 0
        assert page.locator('#readerArticle').count() == 1
        assert page.locator('.v26-reader-toolbar').count() == 1
    finally: page.close()



def test_reader_tracks_real_origin_before_entering_reader(browser):
    page=mount_reader(browser)
    try:
        page.evaluate("""() => {
          window.OAB_V26.readerSession.origin=null;
          delete window.__prevRoute;
          route='prepare'; routePayload={day:7,source:'journey'};
          setRoute('reader',{discipline:'Constitucional',topicId:'constitucional-teoria',subtopicTitle:'Poder Constituinte'});
          renderReader(routePayload);
        }""")
        page.wait_for_timeout(230)
        origin=page.evaluate('window.OAB_V26.readerSession.origin')
        assert origin['route']=='prepare'
        assert origin['payload']['day']==7
        page.locator('[data-v26-action="back"]').click(); page.wait_for_timeout(30)
        assert page.evaluate('route')=='prepare'
        assert page.evaluate('routePayload.day')==7
    finally: page.close()

def test_index_view_is_internal_and_returns_to_reading(browser):
    page=mount_reader(browser)
    try:
        page.locator('[data-v26-view="index"]').click()
        page.wait_for_timeout(40)
        assert page.evaluate('route') == 'reader'
        assert page.locator('.v26-internal-view[data-view="index"]').count() == 1
        page.get_by_role('button', name='Voltar à leitura').click()
        page.wait_for_timeout(40)
        assert page.locator('#readerArticle').count() == 1
        assert page.evaluate('window.OAB_V26.readerSession.view') == 'reading'
    finally: page.close()


def test_study_view_uses_wide_cards(browser):
    page=mount_reader(browser)
    try:
        page.locator('[data-v26-view="study"]').click(); page.wait_for_timeout(40)
        assert page.locator('.v26-internal-view[data-view="study"]').count() == 1
        cards=page.locator('.v26-study-card')
        assert cards.count() >= 4
        widths=cards.evaluate_all('els => els.map(e=>e.getBoundingClientRect().width)')
        assert min(widths) >= 260
        assert page.get_by_role('button', name='Marcar como estudada').count() == 1
        assert page.get_by_role('button', name='Fazer questões desta unidade').count() >= 1
        assert page.get_by_text('1/2', exact=True).count() == 1
    finally: page.close()




def test_mark_studied_uses_legacy_learning_completion(browser):
    page=mount_reader(browser)
    try:
        page.locator('[data-v26-view="study"]').click(); page.wait_for_timeout(30)
        page.locator('[data-v26-complete]').click(); page.wait_for_timeout(30)
        assert page.evaluate("!!progress.learningPath?.completed?.['Constitucional|constitucional-teoria|poder-constituinte']")
    finally: page.close()

def test_study_view_shows_domain_when_adaptive_sample_exists(browser):
    page=mount_reader(browser)
    try:
        page.evaluate("""() => {
          progress.adaptive.micro['Constitucional|constitucional-teoria|poder-constituinte']={attempts:6,mastery:72,fragility:28};
        }""")
        page.locator('[data-v26-view="study"]').click(); page.wait_for_timeout(40)
        assert page.get_by_text('72%', exact=True).count()>=1
        assert page.get_by_text('Fragilidade 28', exact=False).count()>=1
    finally: page.close()

def test_scroll_position_restores_after_internal_view(browser):
    page=mount_reader(browser,height=720)
    try:
        page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight * 0.48)'); page.wait_for_timeout(40)
        before=page.evaluate('window.scrollY')
        assert before > 0
        page.locator('[data-v26-view="study"]').click(); page.wait_for_timeout(40)
        anchor=page.evaluate('window.OAB_V26.readerSession.scrollAnchor')
        assert anchor and ('ratio' in anchor) and ('blockId' in anchor)
        assert page.evaluate('window.scrollY') <= 10
        page.get_by_role('button', name='Voltar à leitura').click(); page.wait_for_timeout(80)
        after=page.evaluate('window.scrollY')
        assert abs(after-before) <= 140
    finally: page.close()



def test_internal_views_hide_reading_highlighter(browser):
    page=mount_reader(browser)
    try:
        page.locator('[data-v26-view="study"]').click(); page.wait_for_timeout(30)
        assert page.locator('body.v26-internal-active').count()==1
        display=page.locator('.v18-highlight-dock').evaluate("e=>getComputedStyle(e).display")
        assert display=='none'
        page.get_by_role('button', name='Voltar à leitura').click(); page.wait_for_timeout(30)
        assert page.locator('body.v26-internal-active').count()==0
    finally: page.close()

def test_highlights_and_notes_are_internal(browser):
    page=mount_reader(browser)
    try:
        page.locator('[data-v26-view="highlights"]').click(); page.wait_for_timeout(30)
        assert page.locator('.v26-internal-view[data-view="highlights"]').count()==1
        assert page.get_by_text('trecho amarelo').count()>=1
        assert page.get_by_role('button', name='Ir para este trecho').count()>=1
        page.get_by_role('button', name='Voltar à leitura').click(); page.wait_for_timeout(30)
        page.locator('[data-v26-view="notes"]').click(); page.wait_for_timeout(30)
        assert page.locator('.v26-internal-view[data-view="notes"]').count()==1
        assert page.locator('textarea').count()>=1
    finally: page.close()



def test_contextual_questions_capture_exact_reader_origin(browser):
    page=mount_reader(browser,height=720)
    try:
        page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight * 0.35)'); page.wait_for_timeout(30)
        page.locator('[data-v26-view="study"]').click(); page.wait_for_timeout(30)
        page.get_by_role('button', name='Fazer questões desta unidade').click(); page.wait_for_timeout(30)
        assert page.evaluate('route') == 'questions'
        origin=page.evaluate('qFilters.studyContext.readerOrigin')
        assert origin
        assert origin['payload']['discipline'] == 'Constitucional'
        assert origin['payload']['topicId'] == 'constitucional-teoria'
        assert origin['payload']['subtopicTitle'] == 'Poder Constituinte'
        assert 'scrollAnchor' in origin and origin['scrollAnchor']
    finally: page.close()

def test_focus_is_reading_state_without_sidebars(browser):
    page=mount_reader(browser)
    try:
        page.locator('[data-v26-action="focus"]').click(); page.wait_for_timeout(40)
        assert page.evaluate('window.OAB_V26.readerSession.view') == 'reading'
        assert page.locator('body.v26-focus').count()==1
        assert page.locator('.v16-reader-toc').count()==0
        assert page.locator('.v16-reader-status').count()==0
        assert page.get_by_role('button', name='Sair do foco').count()==1
    finally: page.close()


@pytest.mark.parametrize('width',[360,390,430,768])
def test_mobile_reader_has_no_horizontal_overflow(browser,width):
    page=mount_reader(browser,width=width,height=844)
    try:
        doc=page.evaluate('document.documentElement.scrollWidth')
        viewport=page.evaluate('innerWidth')
        assert doc <= viewport + 2
        assert page.locator('.v16-reader-toc').count()==0
        assert page.locator('.v16-reader-status').count()==0
        page.locator('[data-v26-view="study"]').click(); page.wait_for_timeout(30)
        assert page.locator('.v26-study-grid').evaluate("e=>getComputedStyle(e).gridTemplateColumns.split(' ').length") == 1
    finally: page.close()


def test_preserves_question_floor_and_maps_removed():
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    assert html.count('"statement":') >= 2336
    assert not (ROOT/'maps').exists()
    assert not (ROOT/'maps-hd').exists()
    assert not (ROOT/'data'/'map-manifest.js').exists()
