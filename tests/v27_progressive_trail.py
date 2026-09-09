from pathlib import Path

import pytest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
V26 = ROOT / 'data' / 'v26-patch.js'
V27 = ROOT / 'data' / 'v27-patch.js'
V35STATE = ROOT / 'data' / 'v35-state.js'


@pytest.fixture(scope='module')
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        yield b
        b.close()


def bootstrap(browser, width=1366, height=900):
    page = browser.new_page(viewport={'width': width, 'height': height})
    page.set_content('''<html><body><div class="sidebar"></div><div class="topbar"></div><main><div id="content" class="content"></div></main></body></html>''')
    page.add_script_tag(content=r'''
      window.route='study'; window.routePayload={discipline:'Constitucional'};
      window.progress={
        topics:{'constitucional-teoria':{studySec:240}},
        answers:{}, highlights:{}, readerNotes:{}, adaptive:{micro:{}},
        learningPath:{completed:{},version:18}
      };
      window.QUESTIONS=[
        {id:'q1',discipline:'Constitucional',statement:'Q1',answer:0,options:['a','b','c','d']},
        {id:'q2',discipline:'Constitucional',statement:'Q2',answer:0,options:['a','b','c','d']},
        {id:'q3',discipline:'Constitucional',statement:'Q3',answer:0,options:['a','b','c','d']},
        {id:'q4',discipline:'Constitucional',statement:'Q4',answer:0,options:['a','b','c','d']},
        {id:'q5',discipline:'Constitucional',statement:'Q5',answer:0,options:['a','b','c','d']},
      ];
      window.OAB_QUESTIONS=window.QUESTIONS;
      window.OAB_V16_QUESTION_MAP={
        q1:{strict:true,discipline:'Constitucional',chapterId:'constitucional-teoria',subtopicStrict:true,subtopicTitle:'Poder Constituinte'},
        q2:{strict:true,discipline:'Constitucional',chapterId:'constitucional-teoria',subtopicStrict:true,subtopicTitle:'Poder Constituinte'},
        q3:{strict:true,discipline:'Constitucional',chapterId:'constitucional-teoria',subtopicStrict:true,subtopicTitle:'Poder Constituinte'},
        q4:{strict:true,discipline:'Constitucional',chapterId:'constitucional-teoria',subtopicStrict:true,subtopicTitle:'Poder Constituinte'},
        q5:{strict:true,discipline:'Constitucional',chapterId:'constitucional-teoria',subtopicStrict:true,subtopicTitle:'Poder Constituinte Originário'}
      };
      window.qFilters={}; window.qIndex=0;
      window.$=(s,r=document)=>r.querySelector(s); window.$$=(s,r=document)=>[...r.querySelectorAll(s)];
      window.esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      window.slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
      window.normalizeSearch=s=>window.slug(s).replace(/-/g,' ');
      window.markDirty=()=>{}; window.toast=()=>{}; window.saveProgress=()=>Promise.resolve(); window.formatTime=()=> '4 min';
      window.findDiscipline=name=>({id:'constitucional',name:'Constitucional',overview:'Base constitucional.'});
      window.disciplineChapters=()=>[
        {id:'constitucional-teoria',title:'Teoria da Constituição',subtopics:['Poder Constituinte','Poder Constituinte Originário'],hasTheory:true},
        {id:'constitucional-direitos',title:'Direitos Fundamentais',subtopics:['Dimensões dos Direitos Fundamentais'],hasTheory:true}
      ];
      window.resolveStudyUnit=(disc,id)=>{const c=disciplineChapters().find(x=>x.id===id);return c?{id:c.id,title:c.title,mode:'chapter',chapter:c}:null};
      window.readerKey=(d,id)=>`${d}::${id}`;
      window.readingPositionFor=(d,id)=>null;
      window.subjectScore=()=>({n:0,raw:0});
      window.materialSearchScore=()=>1; window.debounce=fn=>fn;
      window.safeRoute=(r,p)=>{route=r; routePayload=p||null; renderRoute();};
      window.setRoute=(r,p)=>{route=r;routePayload=p||null;};
      window.goBack=()=>{};
      window.renderQuestions=()=>{};
      window.renderPrepare=()=>{};
      window.renderRoute=()=>{ if(route==='study') renderStudy(routePayload); else if(route==='reader') renderReader(routePayload); };
      window.renderStudy=(payload)=>{
        const c=document.getElementById('content');
        if(payload?.discipline){
          c.innerHTML=`<div class="breadcrumbs"></div><article class="discipline-hero refined"><div><span class="eyebrow">DISCIPLINA</span><h2>${payload.discipline}</h2><p>Base constitucional.</p><div class="reader-meta"></div></div><div class="discipline-actions"><button id="fullMaterialBtn">Disciplina completa</button><button id="practiceDisc">Praticar questões</button></div></article><section class="section"><div class="study-toolbar"><input id="chapterSearch"></div></section><section class="section"><div id="chapterList"></div></section>`;
          return;
        }
        c.innerHTML='<div>Estudar</div>';
      };
      window.renderReader=(payload)=>{
        const c=document.getElementById('content');
        c.innerHTML=`<div class="reader-shell v18-reader"><div class="v16-reader-grid"><aside class="v16-reader-toc"></aside><article id="readerArticle"><header class="v18-doc-header"><div class="trail">Constitucional › Teoria da Constituição › ${payload.subtopicTitle||''}</div><h1>${payload.subtopicTitle||'Teoria da Constituição'}</h1></header><section id="zoneTheory"><div class="primary-material"><section class="integral-section"><div class="integral-body"><p>${'Texto jurídico. '.repeat(80)}</p></div></section></div></section><section id="zoneQuestions"><button id="topicQuestions">Resolver questões</button></section><footer class="v18-reader-footer"><div class="finish"><div><b>Quando terminar</b><small>Pratique</small></div><div class="finish-actions"><button id="v18CompleteUnit">Marcar como estudada</button><button id="v18UnitQuestions">Questões</button></div></div><div class="neighbors"><button id="v18NextUnit">próximo</button></div></footer></article><aside class="v16-reader-status"></aside></div></div>`;
        const key=`Constitucional|${payload.topicId}|${payload.subtopicTitle?slug(payload.subtopicTitle):'__chapter__'}`;
        document.getElementById('v18CompleteUnit').onclick=()=>{progress.learningPath.completed[key]={at:Date.now()};};
        document.getElementById('topicQuestions').onclick=()=>{};
        document.getElementById('v18UnitQuestions').onclick=()=>{};
      };
    ''')
    page.add_script_tag(path=str(V35STATE))
    page.add_script_tag(path=str(V26))
    page.add_script_tag(path=str(V27))
    return page


def test_v27_is_loaded_after_v26():
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    assert 'data/v27-patch.js' in html
    assert html.rfind('data/v27-patch.js') > html.rfind('data/v26-patch.js')


def test_v27_contract_exposes_progression_api():
    js=V27.read_text(encoding='utf-8')
    for token in ['buildDisciplinePath','unitState','requiredQuestionCount','openUnit','openVerifiedQuestions']:
        assert token in js


def test_required_question_sample_is_capped_at_three(browser):
    page=bootstrap(browser)
    try:
        unit=page.evaluate("OAB_V27.buildDisciplinePath('Constitucional').units[0]")
        assert unit['questionIds']==['q1','q2','q3','q4']
        assert unit['requiredQuestions']==3
    finally: page.close()


def test_wrong_answers_count_for_progress_but_score_does_not_gate(browser):
    page=bootstrap(browser)
    try:
        page.evaluate("progress.learningPath.completed['Constitucional|constitucional-teoria|poder-constituinte']={at:1}; progress.answers={q1:{correct:false},q2:{correct:false},q3:{correct:false}};")
        state=page.evaluate("OAB_V27.buildDisciplinePath('Constitucional').units[0].state")
        assert state=='completed'
    finally: page.close()


def test_no_verified_question_means_learning_completion_is_enough(browser):
    page=bootstrap(browser)
    try:
        page.evaluate("progress.learningPath.completed['Constitucional|constitucional-direitos|dimensoes-dos-direitos-fundamentais']={at:1};")
        unit=page.evaluate("OAB_V27.buildDisciplinePath('Constitucional').units[2]")
        assert unit['questionIds']==[]
        assert unit['requiredQuestions']==0
        assert unit['state']=='completed'
    finally: page.close()


def test_future_unit_is_locked_until_previous_cycle_finishes(browser):
    page=bootstrap(browser)
    try:
        states=page.evaluate("OAB_V27.buildDisciplinePath('Constitucional').units.map(u=>u.state)")
        assert states[0] in ('available','in_study')
        assert states[1]=='locked'
        assert states[2]=='locked'
    finally: page.close()


def test_questions_pending_state_after_learning(browser):
    page=bootstrap(browser)
    try:
        page.evaluate("progress.learningPath.completed['Constitucional|constitucional-teoria|poder-constituinte']={at:1}; progress.answers={q1:{correct:true}};")
        unit=page.evaluate("OAB_V27.buildDisciplinePath('Constitucional').units[0]")
        assert unit['state']=='questions_pending'
        assert unit['answeredQuestions']==1
        assert unit['requiredQuestions']==3
    finally: page.close()


def test_completed_unit_unlocks_next(browser):
    page=bootstrap(browser)
    try:
        page.evaluate("progress.learningPath.completed['Constitucional|constitucional-teoria|poder-constituinte']={at:1}; progress.answers={q1:{correct:false},q2:{correct:true},q3:{correct:false}};")
        states=page.evaluate("OAB_V27.buildDisciplinePath('Constitucional').units.map(u=>u.state)")
        assert states[0]=='completed'
        assert states[1]=='available'
    finally: page.close()


def test_discipline_page_becomes_guided_trail(browser):
    page=bootstrap(browser)
    try:
        page.evaluate("renderStudy({discipline:'Constitucional'})")
        page.wait_for_timeout(80)
        assert page.locator('.v27-trail-summary').count()==1
        assert page.locator('.v27-trail-unit').count()==3
        assert page.get_by_text('Trilha guiada', exact=False).count()>=1
        assert page.get_by_text('Consulta livre', exact=False).count()>=1
    finally: page.close()


def test_locked_unit_button_is_disabled(browser):
    page=bootstrap(browser)
    try:
        page.evaluate("renderStudy({discipline:'Constitucional'})"); page.wait_for_timeout(80)
        locked=page.locator('.v27-trail-unit[data-state="locked"] button[data-v27-unit-open]')
        assert locked.count()>=1
        assert locked.first.is_disabled()
    finally: page.close()


def test_v26_index_is_reframed_as_trail_without_sidebars(browser):
    page=bootstrap(browser)
    try:
        page.evaluate("route='reader'; routePayload={discipline:'Constitucional',topicId:'constitucional-teoria',subtopicTitle:'Poder Constituinte'}; renderReader(routePayload)")
        page.wait_for_timeout(260)
        assert page.locator('.v26-reader-toolbar [data-v26-view="index"]', has_text='Trilha').count()==1
        page.locator('.v26-reader-toolbar [data-v26-view="index"]').click(); page.wait_for_timeout(100)
        assert page.locator('.v27-trail-summary').count()==1
        assert page.locator('.v16-reader-toc').count()==0
        assert page.locator('.v16-reader-status').count()==0
    finally: page.close()


def test_reader_next_is_blocked_until_minimum_practice(browser):
    page=bootstrap(browser)
    try:
        page.evaluate("route='reader'; routePayload={discipline:'Constitucional',topicId:'constitucional-teoria',subtopicTitle:'Poder Constituinte'}; renderReader(routePayload)")
        page.wait_for_timeout(260)
        assert page.locator('.v27-progress-gate').count()==1
        assert page.locator('[data-v27-next-unit]').is_disabled()
        page.locator('#v18CompleteUnit').click(); page.wait_for_timeout(80)
        assert page.get_by_text('Questões pendentes', exact=False).count()>=1
        assert page.locator('[data-v27-next-unit]').is_disabled()
    finally: page.close()


def test_reader_unlocks_next_after_three_attempts_even_if_wrong(browser):
    page=bootstrap(browser)
    try:
        page.evaluate("progress.learningPath.completed['Constitucional|constitucional-teoria|poder-constituinte']={at:1}; progress.answers={q1:{correct:false},q2:{correct:false},q3:{correct:false}}; route='reader'; routePayload={discipline:'Constitucional',topicId:'constitucional-teoria',subtopicTitle:'Poder Constituinte'}; renderReader(routePayload)")
        page.wait_for_timeout(260)
        btn=page.locator('[data-v27-next-unit]')
        assert not btn.is_disabled()
        assert 'Próxima unidade' in btn.inner_text()
    finally: page.close()


@pytest.mark.parametrize('width',[360,390,430,768])
def test_trail_mobile_has_no_horizontal_overflow(browser,width):
    page=bootstrap(browser,width=width,height=844)
    try:
        page.evaluate("renderStudy({discipline:'Constitucional'})"); page.wait_for_timeout(100)
        assert page.evaluate('document.documentElement.scrollWidth') <= page.evaluate('innerWidth') + 2
        cols=page.locator('.v27-trail-unit').first.evaluate("e=>getComputedStyle(e).gridTemplateColumns").split(' ')
        assert len(cols) <= 2
        copy_box=page.locator('.v27-unit-copy').first.bounding_box()
        side_box=page.locator('.v27-unit-side').first.bounding_box()
        assert copy_box and side_box and side_box['y'] >= copy_box['y']
    finally: page.close()


def test_progressive_disclosure_opens_only_active_chapter_by_default(browser):
    page=bootstrap(browser)
    try:
        page.evaluate("renderStudy({discipline:'Constitucional'})"); page.wait_for_timeout(100)
        chapters=page.locator('details.v27-trail-chapter')
        assert chapters.count()==2
        assert page.locator('details.v27-trail-chapter[open]').count()==1
        assert chapters.nth(0).get_attribute('open') is not None
        assert chapters.nth(1).get_attribute('open') is None
    finally: page.close()


def test_search_opens_matching_chapter_and_does_not_hide_result(browser):
    page=bootstrap(browser)
    try:
        page.evaluate("renderStudy({discipline:'Constitucional'})"); page.wait_for_timeout(100)
        search=page.locator('#chapterSearch')
        search.fill('Direitos Fundamentais'); page.wait_for_timeout(80)
        visible_chapters=page.locator('details.v27-trail-chapter')
        assert visible_chapters.count()==1
        assert visible_chapters.first.get_attribute('open') is not None
        assert 'Dimensões dos Direitos Fundamentais' in visible_chapters.first.inner_text()
    finally: page.close()

def test_contextual_questions_replace_real_global_lexical_filters(browser):
    page=bootstrap(browser)
    try:
        # Real index.html declares qFilters with top-level `let`, so it is NOT window.qFilters.
        # Seed a stale Ethics context to reproduce the production bug.
        page.add_script_tag(content="let qFilters={discipline:'Ética',topic:'',exam:'',status:'all',search:'',questionId:'',questionIds:['eth-old'],studyContext:{discipline:'Ética',label:'Funções Privativas de Advogado'}};")
        page.evaluate("OAB_V27.openVerifiedQuestions(OAB_V27.buildDisciplinePath('Constitucional').units[0])")
        ctx=page.evaluate("qFilters")
        assert ctx['discipline']=='Constitucional'
        assert ctx['studyContext']['discipline']=='Constitucional'
        assert set(ctx['questionIds'])=={'q1','q2','q3','q4'}
    finally:
        page.close()


def test_v27_does_not_write_context_to_window_qfilters():
    js=V27.read_text(encoding='utf-8')
    assert 'window.qFilters=' not in js

def test_v27_release_cache_busts_context_fix():
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    assert '<script src="data/v27-patch.js?v=36.1"></script>' in html
