from pathlib import Path
import importlib.util

ROOT = Path(__file__).resolve().parents[1]
TOOL = ROOT / 'tools' / 'audit_ocr_suspects.py'


def load_tool():
    spec = importlib.util.spec_from_file_location('audit_ocr_suspects', TOOL)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(module)
    return module


def test_scanner_flags_known_oab_reference_errors_and_ocr_fragments():
    mod = load_tool()
    sample = '''OAB XXVIII (2019\nOAB XLIII (2025))\nOAB XXXIVII (2022)\nin.luix\nnlo-govemarnenlal\nEstados Pastes\n'''
    findings = mod.scan_text(sample, 'sample.js')
    cats = {f['category'] for f in findings}
    assert 'oab-parenthesis' in cats
    assert 'invalid-roman' in cats
    assert 'ocr-fragment' in cats
    joined = ' '.join(f['excerpt'] for f in findings)
    for bad in ['XXVIII (2019', 'XLIII (2025))', 'XXXIVII', 'in.luix', 'nlo-govemarnenlal', 'Estados Pastes']:
        assert bad in joined



def test_scanner_detects_references_after_escaped_newline_boundaries():
    mod = load_tool()
    sample = r'OAB XXIX (2019) 2X\nOAB XXVIII (2019\nOAB XLIII (2025))\n1º PASSO'
    findings = mod.scan_text(sample, 'integral-material.js')
    paren = [f for f in findings if f['category'] == 'oab-parenthesis']
    joined = ' '.join(f['excerpt'] for f in paren)
    assert 'XXVIII (2019' in joined
    assert 'XLIII (2025))' in joined

def test_scanner_does_not_flag_valid_oab_reference():
    mod = load_tool()
    findings = mod.scan_text('Questão da OAB XXXVII (2023).', 'sample.js')
    assert not [f for f in findings if f['category'] in {'oab-parenthesis', 'invalid-roman'}]


def test_report_generation_is_read_only(tmp_path):
    mod = load_tool()
    data = tmp_path / 'data'
    data.mkdir()
    src = data / 'sample.js'
    original = 'const x = "Estados Pastes";\n'
    src.write_text(original, encoding='utf-8')
    report = tmp_path / 'report.md'
    mod.audit_tree(data, report)
    assert src.read_text(encoding='utf-8') == original
    text = report.read_text(encoding='utf-8')
    assert 'Estados Pastes' in text
    assert 'sample.js' in text
