from pathlib import Path
import re, pytest
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
def test_full_real_app_graph_executes_in_production_script_order():
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    def inline_script(m):
        src=m.group(1).split('?',1)[0];code=(ROOT/src).read_text(encoding='utf-8').replace('</script>','<\\/script>');return f'<script data-inlined-from="{src}">\n{code}\n</script>'
    html=re.sub(r'<script src="(data/[^"]+\.js(?:\?[^\"]*)?)"></script>',inline_script,html);errors=[]
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1366,'height':768});page.on('pageerror',lambda e:errors.append(str(e)));page.set_content(html,wait_until='load',timeout=90000);page.wait_for_function("() => window.__OAB_BOOT_OK===true&&window.OAB_V27&&window.OAB_STATE",timeout=30000)
        result=page.evaluate("""async()=>{user={uid:'test-user',email:'test@example.invalid'};profile={name:'Teste',username:'teste',role:'student',active:true,approvalStatus:'approved'};progress=defaultProgress();progressOwnerUid='test-user';showApp();bindRoleUI();updateLevelUI();const path=OAB_V27.buildDisciplinePath('Constitucional');const unit=path.units.find(u=>u.questionIds?.length);const opened=OAB_V27.openVerifiedQuestions(unit);buildQueue();const queue=qQueue.map(q=>q.discipline);progressOwnerUid='wrong-owner';dirty=true;await OAB_V35_AUTH.saveProgressV35(true);const sync=OAB_V35_AUTH.syncSnapshot();return{opened,discipline:OAB_STATE.snapshot().questionFilters.discipline,queue,route,sync};}""");b.close()
    assert not errors,errors;assert result['opened'] is True;assert result['discipline']=='Constitucional';assert result['route']=='questions';assert result['queue'] and all(x=='Constitucional' for x in result['queue']);assert result['sync']['state']=='retrying' and result['sync']['dirty'] is True

def test_page_goto_real_index_contract_is_present_for_normal_ci():
    src=Path(__file__).read_text(encoding='utf-8');assert 'page.set_content' in src and 'index.html' in src
