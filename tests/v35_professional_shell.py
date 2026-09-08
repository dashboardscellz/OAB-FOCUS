from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
INDEX=ROOT/'index.html'; CSS=ROOT/'data'/'v35-shell.css'; JS=ROOT/'data'/'v35-shell.js'
def css(): return CSS.read_text(encoding='utf-8')
def js(): return JS.read_text(encoding='utf-8')

def test_assets_loaded_after_v34():
    h=INDEX.read_text(encoding='utf-8')
    assert 'href="data/v35-shell.css?v=35.5"' in h
    assert 'src="data/v35-shell.js?v=35.5"' in h
    assert 'src="data/v35-auth.js?v=35.5"' in h
    assert h.index('src="data/v35-shell.js?v=35.5"') > h.index('src="data/v34-patch.js"')

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
    for asset in ['data/v35-shell.css?v=35.5','data/v35-auth.js?v=35.5','data/v35-shell.js?v=35.5']:
        assert asset in h

def test_v35_reader_redesign_declares_single_centered_reading_architecture():
    source=css().replace(' ','')
    assert '--v35-reader-frame:1000px' in source
    assert '--v35-reading-measure:760px' in source
    for selector in ['body.v26-reader-active#app.content','body.v26-reader-active.v26-reader-shell','body.v26-reader-active.v26-reading-stage#readerArticle']:
        assert selector in source


def test_v35_reader_timer_is_rehomed_into_document_header_before_metadata():
    source=js()
    assert 'enhanceV35Reader' in source
    assert "document.getElementById('v34StudyTimer')" in source
    assert "header.querySelector('.v18-doc-meta')" in source
    assert 'insertBefore(timer,meta)' in source.replace(' ','')


def test_v35_reader_highlighter_is_centered_and_content_reserves_space_for_it():
    source=css().replace(' ','')
    assert 'body.v26-reader-active.v18-highlight-dock{' in source
    start=source.find('body.v26-reader-active.v18-highlight-dock{')
    block=source[start:source.find('}',start)+1]
    assert 'left:50%!important' in block
    assert 'transform:translateX(-50%)!important' in block
    assert 'right:auto!important' in block
    assert 'bottom:18px!important' in block
    article=source[source.find('body.v26-reader-active.v26-reading-stage#readerArticle{'):]
    article=article[:article.find('}')+1]
    assert 'padding-bottom:' in article


def test_v35_reader_primary_material_is_flat_not_nested_card_on_card():
    source=css().replace(' ','')
    selector='body.v26-reader-active.v18-reader.primary-material{'
    start=source.find(selector)
    assert start>=0
    block=source[start:source.find('}',start)+1]
    assert 'border:0!important' in block
    assert 'box-shadow:none!important' in block
    assert 'background:transparent!important' in block

def test_v35_reader_removes_redundant_practice_and_legacy_finish_blocks():
    source=js()
    for selector in ["#zoneQuestions",".v20-practice-shell",".v16-reader-end",".v18-reader-footer","[data-reader-jump=\"questions\"]"]:
        assert selector in source
    assert 'cleanupV35ReaderRedundancy' in source


def test_v35_reader_css_defensively_hides_redundant_practice_and_legacy_finish_blocks():
    source=css().replace(' ','')
    for selector in ['body.v26-reader-active#zoneQuestions','body.v26-reader-active.v20-practice-shell','body.v26-reader-active.v16-reader-end','body.v26-reader-active.v18-reader-footer','body.v26-reader-active[data-reader-jump=\"questions\"]']:
        assert selector in source

def test_v35_4_login_polish_installs_after_legacy_login_patches():
    source=js()
    assert 'installV35LoginPolish' in source
    assert 'v35LoginPolish' in source
    assert '#loginView .showcase-photo-wrap' in source
    assert '#loginView .login-form-v11' in source


def test_v35_4_short_desktop_founder_photo_has_real_editorial_presence():
    source=js().replace(' ','')
    # final runtime override must beat the old v33 220/250px portrait limits
    assert 'min-height:330px!important' in source or 'min-height:320px!important' in source
    assert 'height:clamp(330px,60vh,410px)!important' in source or 'height:clamp(320px,58vh,360px)!important' in source
    assert 'grid-template-columns:minmax(250px,320px)minmax(300px,1fr)!important' in source or 'grid-template-columns:minmax(260px,330px)minmax(300px,1fr)!important' in source


def test_v35_4_login_form_has_safe_viewport_gutters_and_no_horizontal_clipping():
    source=js().replace(' ','')
    assert '#loginView.login-v11{max-width:100vw!important;overflow:hidden!important' in source
    assert '#loginView.login-form-v11{min-width:0!important;max-width:100%!important' in source
    assert '#loginView.login-card-v11{width:min(100%,512px)!important;max-width:512px!important' in source


def test_v35_4_questions_get_contextual_sticky_exit_control():
    source=js()
    assert 'enhanceV35Questions' in source
    assert 'v35-question-exit' in source
    assert 'questionOrigin' in source
    assert 'Voltar' in source
    css_source=css().replace(' ','')
    assert '.v35-question-exit{' in css_source
    start=css_source.find('.v35-question-exit{')
    block=css_source[start:css_source.find('}',start)+1]
    assert 'position:sticky' in block
    assert 'z-index:' in block


def test_v35_4_cache_version_is_bumped():
    h=INDEX.read_text(encoding='utf-8')
    for asset in ['data/v35-shell.css?v=35.5','data/v35-auth.js?v=35.5','data/v35-shell.js?v=35.5']:
        assert asset in h
