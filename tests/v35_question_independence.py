from pathlib import Path
import re
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]

def inline_real_app():
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    def inline_script(m):
        src=m.group(1).split('?',1)[0]
        code=(ROOT/src).read_text(encoding='utf-8').replace('</script>','<\\/script>')
        return f'<script data-inlined-from="{src}">\n{code}\n</script>'
    return re.sub(r'<script src="(data/[^"]+\.js(?:\?[^\"]*)?)"></script>',inline_script,html)

def test_questions_tab_is_independent_from_prepare_context():
    html=inline_real_app(); errors=[]
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        page=b.new_page(viewport={'width':1366,'height':768})
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(html,wait_until='load',timeout=90000)
        page.wait_for_function("() => window.__OAB_BOOT_OK===true&&window.OAB_STATE&&window.OAB_QUESTION_NAV",timeout=30000)
        result=page.evaluate("""()=>{
          user={uid:'test-user',email:'test@example.invalid'};
          profile={name:'Teste',username:'teste',role:'student',active:true,approvalStatus:'approved'};
          progress=defaultProgress();progressOwnerUid='test-user';showApp();bindRoleUI();updateLevelUI();
          OAB_QUESTION_NAV.setBankFilters({discipline:'Processo Penal',topic:'',exam:'',status:'all',search:'inquérito',questionId:''});
          const path=OAB_V27.buildDisciplinePath('Constitucional');
          const unit=path.units.find(u=>u.questionIds?.length);
          const opened=OAB_V27.openVerifiedQuestions(unit);
          setRoute('prepare');
          const before=OAB_QUESTION_NAV.snapshot();
          document.querySelector('.v35-primary-nav [data-route="questions"]').click();
          const after=OAB_QUESTION_NAV.snapshot();
          return {opened,before,after,filters:OAB_STATE.snapshot().questionFilters,route};
        }""")
        b.close()
    assert not errors, errors
    assert result['opened'] is True
    assert result['before']['mode']=='context'
    assert result['after']['mode']=='bank'
    assert result['route']=='questions'
    assert result['filters']['discipline']=='Processo Penal'
    assert result['filters']['search']=='inquérito'
    assert 'questionIds' not in result['filters']
    assert 'studyContext' not in result['filters']

def test_contextual_prepare_questions_still_use_only_unit_question_ids():
    html=inline_real_app(); errors=[]
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        page=b.new_page(viewport={'width':1366,'height':768})
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(html,wait_until='load',timeout=90000)
        page.wait_for_function("() => window.__OAB_BOOT_OK===true&&window.OAB_STATE&&window.OAB_QUESTION_NAV",timeout=30000)
        result=page.evaluate("""()=>{
          user={uid:'test-user',email:'test@example.invalid'};
          profile={name:'Teste',username:'teste',role:'student',active:true,approvalStatus:'approved'};
          progress=defaultProgress();progressOwnerUid='test-user';showApp();bindRoleUI();updateLevelUI();
          OAB_QUESTION_NAV.setBankFilters({discipline:'Processo Penal',topic:'',exam:'',status:'all',search:'inquérito',questionId:''});
          const path=OAB_V27.buildDisciplinePath('Constitucional');
          const unit=path.units.find(u=>u.questionIds?.length);
          const opened=OAB_V27.openVerifiedQuestions(unit);buildQueue();
          return {opened,mode:OAB_QUESTION_NAV.snapshot().mode,queue:qQueue.map(q=>q.discipline),filters:OAB_STATE.snapshot().questionFilters};
        }""")
        b.close()
    assert not errors, errors
    assert result['opened'] is True
    assert result['mode']=='context'
    assert result['queue'] and all(x=='Constitucional' for x in result['queue'])
    assert result['filters']['discipline']=='Constitucional'
    assert result['filters']['questionIds']

def test_manual_filters_in_questions_bank_are_remembered_without_study_context():
    src=(ROOT/'data'/'v35-question-navigation.js').read_text(encoding='utf-8')
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    assert 'setBankFilters' in src
    assert 'questionIds' in src and 'studyContext' in src
    assert 'data-route="questions"' in src or "dataset.route==='questions'" in src
    assert 'data/v35-question-navigation.js?v=35.12' in html
    assert html.index('data/v35-question-navigation.js?v=35.12') > html.index('data/v35-text-quality.js?v=35.11')
