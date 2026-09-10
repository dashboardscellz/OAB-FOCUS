from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = ROOT / 'index.html'
CSS_PATH = ROOT / 'data' / 'v35-mobile-app.css'
JS_PATH = ROOT / 'data' / 'v35-mobile-app.js'

INDEX = INDEX_PATH.read_text(encoding='utf-8')
CSS = CSS_PATH.read_text(encoding='utf-8')
JS = JS_PATH.read_text(encoding='utf-8')


def compact(s: str) -> str:
    return re.sub(r'\s+', '', s)


def test_release_cache_is_current():
    assert 'v35-mobile-app.css?v=36.0' in INDEX
    assert 'v35-mobile-app.js?v=36.0' in INDEX
    assert "const VERSION='36.0'" in JS


def test_bug1_study_toolbar_uses_safe_area_top_offset():
    assert re.search(
        r'#app\[data-v3513-route="study"\]\s+\.toolbar[^\{]*\{[^}]*top:calc\(var\(--v3513-top-h\)\s*\+\s*var\(--v3516-top-safe\)\)',
        CSS,
        re.S,
    )


def test_bug2_question_text_wraps_without_horizontal_overflow():
    assert re.search(
        r'#app\s+\.question-text\{[^}]*white-space:pre-wrap;[^}]*overflow-wrap:anywhere;[^}]*word-break:normal',
        CSS,
        re.S,
    )


def test_bug3_reader_reserves_space_for_highlight_dock_and_bottom_nav():
    assert 'padding:8px 0 calc(var(--v3513-nav-h) + var(--v3516-bottom-safe) + 78px);' in CSS
    assert re.search(
        r'body\.v26-reader-active\s+#readerArticle\s+\.integral-body\{[^}]*padding-bottom:calc\(var\(--v3513-nav-h\)\s*\+\s*var\(--v3516-bottom-safe\)\s*\+\s*90px\)',
        CSS,
        re.S,
    )


def test_bug4_legacy_reader_top_offset_removed_from_index_mobile_breakpoint():
    assert '.reader-top{top:66px}' not in INDEX


def test_bug5_filter_sheet_uses_visual_viewport_when_keyboard_is_open():
    assert 'body.v3516-keyboard-open #app .v3513-filter-sheet{max-height:calc(var(--v3516-visual-h, 60dvh) - 6px);}' in CSS


def test_bug6_question_side_stacks_below_390px():
    m = re.search(r'@media\(max-width:390px\)\{(.*?)\n\}', CSS, re.S)
    assert m, 'missing max-width:390px block'
    assert '#app .question-side{' in m.group(1)
    assert 'grid-template-columns:1fr;' in m.group(1)


def test_bug7_reader_integral_body_has_mobile_horizontal_gutter():
    assert re.search(
        r'body\.v26-reader-active\s+#readerArticle\s+\.integral-body\{[^}]*padding:16px\s+var\(--v3513-gutter,14px\)\s+22px',
        CSS,
        re.S,
    )


def test_bug8_16px_inputs_rule_is_only_inside_mobile_media():
    media_end = CSS.find('\n}', CSS.find('@media(max-width:768px),(max-width:950px) and (max-height:500px){'))
    first_media = CSS[CSS.find('@media(max-width:768px),(max-width:950px) and (max-height:500px){'):media_end+2]
    assert '#app input,#app select,#app textarea{font-size:16px;}' in first_media
    outside = CSS[media_end+2:]
    assert '#app input,#app select,#app textarea{font-size:16px;}' not in outside


def test_bug9_bottom_nav_has_canonical_display_grid():
    assert re.search(
        r'@media\(max-width:768px\),\(max-width:950px\) and \(max-height:500px\)\{.*?#app\s+\.bottom-nav\{[^}]*display:grid;[^}]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)',
        CSS,
        re.S,
    )


def test_bug10_home_welcome_is_clipped_to_mobile_width():
    assert re.search(
        r'#app\s+\.home-welcome\{[^}]*overflow:hidden;[^}]*max-width:100%;[^}]*box-sizing:border-box',
        CSS,
        re.S,
    )
