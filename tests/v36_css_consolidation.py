from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / 'index.html').read_text(encoding='utf-8')
MOBILE = (ROOT / 'data' / 'v35-mobile-app.css').read_text(encoding='utf-8')
SHELL = (ROOT / 'data' / 'v35-shell.css').read_text(encoding='utf-8')
MOBILE_JS = (ROOT / 'data' / 'v35-mobile-app.js').read_text(encoding='utf-8')


def test_v36_release_cache_markers_are_consistent():
    assert 'data/v35-shell.css?v=36.0' in INDEX
    assert 'data/v35-mobile-app.css?v=36.0' in INDEX
    assert 'data/v35-mobile-app.js?v=36.0' in INDEX
    assert "const VERSION='36.0'" in MOBILE_JS


def test_breakpoint_scale_is_documented_in_root_and_mobile_css():
    for token, value in [
        ('--bp-xs', '390px'),
        ('--bp-sm', '560px'),
        ('--bp-md', '768px'),
        ('--bp-lg', '950px'),
        ('--bp-xl', '1120px'),
    ]:
        assert f'{token}:{value}' in re.sub(r'\s+', '', INDEX)
    assert 'Canonical responsive scale: 390 / 560 / 768 / 950 / 1120' in MOBILE
    assert 'var(--bp-' not in ''.join(re.findall(r'@media[^\{]+', MOBILE)), 'CSS vars cannot drive native @media conditions'


def test_new_stylesheets_have_bounded_important_budget():
    combined = MOBILE.count('!important') + SHELL.count('!important')
    assert combined < 150, f'combined !important count is {combined}, expected < 150'


def test_shell_no_longer_contains_phone_breakpoint_overrides():
    # v36 makes v35-mobile-app.css the canonical phone/landscape source.
    assert '@media(max-width:768px)' not in SHELL
    assert '@media(max-width:430px)' not in SHELL
    assert '@media(max-width:390px)' not in SHELL
    assert '@media(max-width:360px)' not in SHELL


def test_keyboard_open_filter_sheet_has_one_canonical_rule():
    needle = 'body.v3516-keyboard-open #app .v3513-filter-sheet'
    assert MOBILE.count(needle) == 1
    assert re.search(
        r'body\.v3516-keyboard-open\s+#app\s+\.v3513-filter-sheet\s*\{[^}]*max-height:calc\(var\(--v3516-visual-h,\s*60dvh\)\s*-\s*6px\)',
        MOBILE,
        re.S,
    )


def test_mobile_source_owns_confirmed_hardening_rules():
    compact = re.sub(r'\s+', '', MOBILE)
    assert '#app .question-text{' in MOBILE
    assert 'white-space:pre-wrap' in MOBILE
    assert 'overflow-wrap:anywhere' in MOBILE
    assert '#app .home-welcome{' in MOBILE
    assert 'overflow:hidden' in MOBILE
    assert 'box-sizing:border-box' in MOBILE
    assert '#app.question-side{grid-template-columns:1fr' in compact


def test_reader_clearance_and_gutter_are_kept_in_canonical_mobile_source():
    compact = re.sub(r'\s+', '', MOBILE)
    assert 'padding:8px0calc(var(--v3513-nav-h)+var(--v3516-bottom-safe)+78px)' in compact
    assert 'padding:16pxvar(--v3513-gutter,14px)22px' in compact
    assert 'padding-bottom:calc(var(--v3513-nav-h)+var(--v3516-bottom-safe)+90px)' in compact


def test_input_16px_rule_is_scoped_to_mobile_media_only():
    selector = '#app input,#app select,#app textarea'
    assert MOBILE.count(selector) == 1
    pos = MOBILE.index(selector)
    first_media = MOBILE.index('@media(max-width:768px)')
    # Selector must live after the start of a mobile block, not as a global tail rule.
    assert pos > first_media
    assert 'font-size:16px' in MOBILE[pos:pos + 180]
