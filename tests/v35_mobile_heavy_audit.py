from pathlib import Path
import re
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
INDEX=(ROOT/'index.html').read_text(encoding='utf-8')
CSS=(ROOT/'data/v35-mobile-app.css').read_text(encoding='utf-8')
JS=(ROOT/'data/v35-mobile-app.js').read_text(encoding='utf-8')
PROMPT=ROOT/'PROMPT_MESTRE_REVISAO_PESADA_MOBILE_v35_17.md'


def merged_css():
    inline='\n'.join(re.findall(r'<style[^>]*>(.*?)</style>',INDEX,re.S|re.I))
    shell=(ROOT/'data/v35-shell.css').read_text(encoding='utf-8')
    return inline+'\n'+shell+'\n'+CSS


def test_v3517_release_contract():
    assert 'v35-mobile-app.css?v=36.0' in INDEX
    assert 'v35-mobile-app.js?v=36.0' in INDEX
    assert "const VERSION='36.0'" in JS
    assert PROMPT.exists()


def test_prompt_is_adversarial_and_searches_bug_siblings():
    t=PROMPT.read_text(encoding='utf-8').lower()
    for term in ['bugs irmãos','p0','p1','p2','getboundingclientrect','elementsfrompoint','scrollwidth','safe-area','teclado virtual','320','430','!important','css injetado','final']:
        assert term in t, term


def test_mobile_neutralizes_desktop_hero_geometry_and_colors():
    assert re.search(r'#app\s+\.hero-card\{[^}]*min-height:0',CSS)
    assert re.search(r'data-v3513-route="study"[^\n]*\.study-hero\{[^}]*color:var\(--ink\)',CSS)
    assert re.search(r'data-v3513-route="study"[^\n]*\.study-hero\s+\.metric-chip\{[^}]*color:var\(--muted\)',CSS)
    assert re.search(r'data-v3513-route="study"[^\n]*\.study-hero:after\{[^}]*display:none',CSS)


def test_prepare_and_all_routes_reserve_bottom_navigation_space():
    assert 'scroll-padding-bottom:calc(var(--v3517-nav-h)' in CSS
    assert re.search(r'data-v3513-route="prepare"[^\n]*\.content\{[^}]*padding-bottom:calc\(var\(--v3517-nav-h\)',CSS)


def test_inactive_bottom_tabs_are_forced_transparent_and_single_active_logic_exists():
    assert re.search(r'\.bottom-nav button:not\(\.active\)\{[^}]*background:transparent',CSS)
    assert 'const moreActive=' in JS
    assert "tabs.forEach(b=>{b.classList.remove('active')" in JS
    assert "active.classList.add('active')" in JS


def test_study_hero_is_compact_and_visible_at_390px():
    html=f'''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>{merged_css()}</style></head><body><div id="app" class="app-shell" data-v3513-route="study"><main class="main-area"><div class="content"><section class="section"><article class="hero-card study-hero"><div class="hero-copy"><span class="eyebrow">DE ONDE PAROU</span><h2>Constitucional</h2><p>Teoria da Constituição › Poder Constituinte</p><div class="metric-row"><span class="metric-chip">195 estudados</span><span class="metric-chip">POSSIBILIDADE DE REEDIÇÃO OU REAPRECIAÇÃO</span></div></div><button class="btn primary">Continuar exatamente de onde parei</button></article></section></div></main><nav class="bottom-nav mobile-only"><button><span>⌂</span><small>Início</small></button><button class="active"><span>▤</span><small>Estudar</small></button><button><span>◎</span><small>Prepare-se</small></button><button><span>?</span><small>Questões</small></button><button><span>•••</span><small>Mais</small></button></nav></div></body></html>'''
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        page=b.new_page(viewport={'width':390,'height':844});page.set_content(html)
        hero=page.locator('.study-hero').bounding_box(); assert hero
        assert hero['height'] < 280, hero
        chip=page.locator('.study-hero .metric-chip').first
        color=chip.evaluate('e=>getComputedStyle(e).color')
        bg=chip.evaluate('e=>getComputedStyle(e).backgroundColor')
        assert color != 'rgb(255, 255, 255)', (color,bg)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
        b.close()


def test_prepare_last_content_can_scroll_clear_of_nav():
    html=f'''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>{merged_css()}</style></head><body><div id="app" class="app-shell" data-v3513-route="prepare"><main class="main-area"><div class="content"><div style="height:1000px"></div><button id="last" style="height:48px">Última ação</button></div></main><nav class="bottom-nav mobile-only"><button>Início</button><button>Estudar</button><button class="active">Prepare-se</button><button>Questões</button><button>Mais</button></nav></div></body></html>'''
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        page=b.new_page(viewport={'width':390,'height':844});page.set_content(html)
        page.locator('#last').scroll_into_view_if_needed();page.wait_for_timeout(30)
        last=page.locator('#last').bounding_box();nav=page.locator('.bottom-nav').bounding_box();assert last and nav
        assert last['y']+last['height'] <= nav['y']-8,(last,nav)
        b.close()
