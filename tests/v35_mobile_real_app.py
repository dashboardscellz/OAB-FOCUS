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

def test_full_real_app_mobile_home_and_bank_are_bounded():
    errors=[]
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        page=b.new_page(viewport={'width':390,'height':844})
        page.on('pageerror',lambda e: errors.append(str(e)))
        page.set_content(inline_real_app(),wait_until='load',timeout=90000)
        page.wait_for_function("() => window.__OAB_BOOT_OK===true&&window.OAB_MOBILE_APP?.VERSION==='35.17'",timeout=30000)
        result=page.evaluate("""()=>{
          user={uid:'mobile-test',email:'mobile@example.invalid'};
          profile={name:'Cellzinho',username:'cellzinho',role:'student',active:true,approvalStatus:'approved'};
          progress=defaultProgress();progressOwnerUid='mobile-test';showApp();bindRoleUI();updateLevelUI();setRoute('home');
          OAB_MOBILE_APP.enhanceCurrentRoute();
          const pill=document.querySelector('.v3513-level-pill')?.getBoundingClientRect();
          const nav=document.querySelector('.bottom-nav')?.getBoundingClientRect();
          const homeOk=!!document.querySelector('.v3513-mobile-home');
          const overflow=document.documentElement.scrollWidth-innerWidth;
          setRoute('questions');OAB_MOBILE_APP.enhanceCurrentRoute();
          const qTools=!!document.querySelector('.v3513-question-tools');
          const qOverflow=document.documentElement.scrollWidth-innerWidth;
          return {homeOk,pill:{left:pill?.left,right:pill?.right},nav:{top:nav?.top,bottom:nav?.bottom},overflow,qTools,qOverflow,mobile:OAB_MOBILE_APP.isMobile()};
        }""")
        b.close()
    assert not errors,errors
    assert result['mobile'] is True
    assert result['homeOk'] is True
    assert result['pill']['left'] >= 0 and result['pill']['right'] <= 391
    assert result['nav']['bottom'] <= 845
    assert result['overflow'] <= 1
    assert result['qTools'] is True
    assert result['qOverflow'] <= 1
