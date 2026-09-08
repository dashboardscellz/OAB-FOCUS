from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
INDEX=ROOT/'index.html'; CSS=ROOT/'data'/'v35-shell.css'; JS=ROOT/'data'/'v35-shell.js'
def css(): return CSS.read_text(encoding='utf-8')
def js(): return JS.read_text(encoding='utf-8')

def test_assets_loaded_after_v34():
    h=INDEX.read_text(encoding='utf-8')
    assert 'href="data/v35-shell.css?v=35.1"' in h
    assert 'src="data/v35-shell.js?v=35.1"' in h
    assert 'src="data/v35-auth.js?v=35.1"' in h
    assert h.index('src="data/v35-shell.js?v=35.1"') > h.index('src="data/v34-patch.js"')

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

def test_global_sidebar_hidden_and_context_rail_does_not_duplicate_study_or_reader():
    assert '.sidebar{display:none' in css().replace(' ','')
    s=js()
    assert "new Set(['admin'])" in s
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


def test_more_button_uses_same_visual_contract_as_primary_nav_buttons():
    s=css().replace(' ','')
    assert '.v35-primary-nav>button,.v35-more-wrap>button{' in s
    assert '.v35-primary-nav>button:hover,.v35-more-wrap>button:hover{' in s

def test_context_rail_never_shrinks_the_main_content_with_magic_left_padding():
    s=css().replace(' ','')
    assert '#app.v35-has-context.content{padding-left:248px' not in s
    assert 'position:fixed' not in s[s.find('#app.v35-has-context.v35-context-rail'):s.find('#app.v35-has-context.v35-context-rail')+500]

def test_questions_uses_semantic_simulation_label_instead_of_hardcoded_question_count():
    h=INDEX.read_text(encoding='utf-8')
    assert '>Simulado 80<' not in h
    assert '>Simulado completo<' in h

def test_reader_operational_headings_are_forced_to_v35_sans_typography():
    s=css().replace(' ','')
    for selector in ['#app.study-zone-headh2','#app.subtopic-reader-heroh2','#app.integral-section-headh2']:
        start=s.find(selector+'{')
        assert start>=0, selector
        block=s[start:s.find('}',start)+1]
        assert 'font-family:Inter' in block

def test_v35_navigation_clears_legacy_v34_active_state_classes():
    source=js()
    assert "classList.remove('v34-active-state')" in source or 'classList.remove("v34-active-state")' in source

def test_v35_css_neutralizes_legacy_active_state_inside_primary_navigation():
    source=css().replace(' ','')
    assert '.v35-primary-nav>button.v34-active-state' in source
    assert 'box-shadow:none!important' in source

def test_v35_home_hero_explicitly_resets_legacy_shadow_and_radius():
    source=css().replace(' ','')
    start=source.find('#app.dashboard-hero{')
    assert start>=0
    block=source[start:source.find('}',start)+1]
    assert 'box-shadow:none!important' in block
    assert 'border-radius:0!important' in block

def test_v35_versioned_assets_avoid_stale_github_pages_shell_cache():
    h=INDEX.read_text(encoding='utf-8')
    for asset in ['data/v35-shell.css?v=35.1','data/v35-auth.js?v=35.1','data/v35-shell.js?v=35.1']:
        assert asset in h
