from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
INDEX=ROOT/'index.html'; CSS=ROOT/'data'/'v35-shell.css'; JS=ROOT/'data'/'v35-shell.js'
def css(): return CSS.read_text(encoding='utf-8')
def js(): return JS.read_text(encoding='utf-8')

def test_assets_loaded_after_v34():
    h=INDEX.read_text(encoding='utf-8')
    assert 'href="data/v35-shell.css"' in h
    assert 'src="data/v35-shell.js"' in h
    assert h.index('src="data/v35-shell.js"') > h.index('src="data/v34-patch.js"')

def test_design_system_professional_width_and_sans_ui():
    s=css().replace(' ','')
    assert '--v35-shell-max:1240px' in s
    assert '--v35-reader-max:780px' in s
    assert 'font-family:Inter' in s

def test_desktop_two_level_navigation_and_routes():
    s=js()
    assert 'v35-global-header' in s and 'v35-primary-nav' in s
    for route in ['home','study','prepare','questions','review','performance','highyield']:
        assert f'data-route="{route}"' in s
    assert 'data-v35-more' in s

def test_global_sidebar_hidden_contextual_rail_only():
    assert '.sidebar{display:none' in css().replace(' ','')
    s=js(); assert "new Set(['study','reader','admin'])" in s
    assert 'v35-context-rail' in s

def test_dashboard_reader_and_controls_are_refined():
    s=css()
    for token in ['.dashboard-hero','.command-grid','.reader-shell','.primary-material','.reader-top']:
        assert token in s
    assert 'line-height:1.7' in s.replace(' ','') or 'line-height:1.68' in s.replace(' ','')

def test_mobile_breakpoints_safe_area_and_five_destinations():
    s=css()
    for width in ['768','430','390','360']: assert width in s
    assert 'env(safe-area-inset-bottom)' in s
    h=INDEX.read_text(encoding='utf-8')
    block=h[h.index('<nav class="bottom-nav'):h.index('</nav>',h.index('<nav class="bottom-nav'))]
    assert block.count('data-route=') <= 5
    assert 'Mais' in block

def test_mobile_more_sheet_routes():
    s=js(); assert 'openV35MoreSheet' in s
    for route in ['review','performance','highyield','ranking','profile','settings']:
        assert route in s

def test_shell_syncs_existing_route_changes():
    s=js(); assert 'syncV35Navigation' in s and 'mountV35Shell' in s
    assert 'setRoute' in s
