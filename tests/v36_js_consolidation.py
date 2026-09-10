from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / 'index.html').read_text(encoding='utf-8')

CRITICAL = [
    'setRoute','renderRoute','renderHome','renderReader','renderDiscipline','renderStudy',
    'renderPrepare','renderAdmin','renderProfile','renderHighYield','saveProgress',
    'restoreSession','mergeProgress','defaultProgress','logout','completeLogin'
]

def declarations(name: str) -> int:
    return len(re.findall(rf'(?<![\w$])function\s+{re.escape(name)}\s*\(', INDEX))

def all_duplicate_names():
    names = re.findall(r'(?<![\w$])function\s+([A-Za-z_$][\w$]*)\s*\(', INDEX)
    return sorted({n for n in names if names.count(n) > 1})


def test_critical_global_functions_have_single_declaration():
    bad = {n: declarations(n) for n in CRITICAL if declarations(n) != 1}
    assert bad == {}


def test_no_duplicate_named_function_declarations_remain_in_index():
    assert all_duplicate_names() == []


def test_v36_keeps_external_patch_loading_order_intact():
    # Removing dead declarations must not reorder the historical patch chain.
    expected = ['data/v15-patch.js','data/v20-patch.js','data/v34-patch.js','data/v35-mobile-app.js']
    positions = [INDEX.index(x) for x in expected]
    assert positions == sorted(positions)
