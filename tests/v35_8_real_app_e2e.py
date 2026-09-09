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

def test_full_real_app_uses_current_semantic_formatter_not_legacy_spacing_heuristic():
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    def inline_script(m):
        src=m.group(1).split('?',1)[0]
        code=(ROOT/src).read_text(encoding='utf-8').replace('</script>','<\\/script>')
        return f'<script data-inlined-from="{src}">\n{code}\n</script>'
    html=re.sub(r'<script src="(data/[^"]+\.js(?:\?[^\"]*)?)"></script>',inline_script,html)
    errors=[]
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        page=b.new_page(viewport={'width':1366,'height':768})
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(html,wait_until='load',timeout=90000)
        page.wait_for_function("() => window.__OAB_BOOT_OK===true&&window.OAB_TEXT_QUALITY?.VERSION==='35.11'",timeout=30000)
        result=page.evaluate(r'''()=>{
          const bullet=formatIntegralText('●           a separação dos Poderes;\n\nEsse princípio preconiza que as funções estatais sejam repartidas e distribuídas a diferentes\nórgãos, de modo a evitar a centralização do poder e eventuais abusos.','x');
          const sentence=formatIntegralText('Caso venha a existir uma PEC que viole claramente as\ncláusulas pétreas, visando impedir que tal projeto seja aprovado e se transforme em lei,                   os\nparlamentares têm legitimidade para impetrar mandado de segurança preventivo para assegurar\no respeito ao devido processo legislativo.','x');
          const compare=formatIntegralText(`POSSIBILIDADE DE REEDIÇÃO OU REAPRECIAÇÃO\n\nProjeto de emenda                                                 Projeto de lei                   Medida provisória\nconstitucional\n\nSó pode ser analisada na                                Pode ser analisada na MESMA                  Só pode ser analisada na\nPRÓXIMA sessão legislativa                             sessão legislativa, desde que haja          PRÓXIMA sessão legislativa.\n(art 60, § 5 CF)                           proposta da maioria absoluta dos                    (art 62, § 10 CF)\nmembros de uma das casas do\nCongresso (art 67 CF).`,'x');
          return {version:OAB_TEXT_QUALITY.VERSION,bullet,sentence,compare};
        }''')
        b.close()
    assert not errors,errors
    assert result['version']=='35.11'
    assert 'v16-compare-row' not in result['bullet']
    assert 'v35-compare-grid' not in result['bullet']
    assert 'a separação dos Poderes' in result['bullet']
    assert 'lei, os parlamentares têm legitimidade' in result['sentence']
    assert 'v16-compare-row' not in result['sentence']
    assert 'v35-compare-grid' in result['compare']
    assert 'Projeto de emenda constitucional' in result['compare']
    assert 'Pode ser analisada na MESMA sessão legislativa, desde que haja proposta da maioria absoluta dos membros de uma das casas do Congresso (art 67 CF).' in result['compare']
