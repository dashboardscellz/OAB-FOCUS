import base64,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
INDEX=(ROOT/'index.html').read_text(encoding='utf-8')
V16=(ROOT/'data'/'v16-patch.js').read_text(encoding='utf-8')
V17=(ROOT/'data'/'v17-patch.js').read_text(encoding='utf-8')
V18=(ROOT/'data'/'v18-patch.js').read_text(encoding='utf-8')
V19=(ROOT/'data'/'v19-patch.js').read_text(encoding='utf-8')
SHELL=(ROOT/'data'/'v35-shell.css').read_text(encoding='utf-8')
V29=(ROOT/'data'/'v29-patch.js').read_text(encoding='utf-8')
INTEGRAL=(ROOT/'data'/'integral-material.js').read_text(encoding='utf-8')


def test_let01_verified_tables_are_encoded_without_manual_column_spacing():
    assert '[[TABLE: Ato Simples x Ato Composto x Ato Complexo]]' in INTEGRAL
    assert '[[TABLE: Alteração do regime de trabalho]]' in INTEGRAL
    assert 'ATO SIMPLES                                             ATO COMPOSTO' not in INTEGRAL
    assert 'PRESENCIAL PARA O REMOTO                                                      REMOTO PARA O PRESENCIAL' not in INTEGRAL


def test_let01_unreviewed_fixed_layout_is_preserved_and_flagged_not_reordered():
    assert 'integral-layout-preserved' in V16
    assert 'Revisão estrutural pendente' in V16
    assert 'rawLayout' in V16


def test_let02_semantic_table_renderer_has_caption_headers_and_scopes():
    for token in ['<table class="integral-semantic-table"','<caption>','scope="col"','<thead>','<tbody>']:
        assert token in V16


def test_let03_only_v19_applies_reader_font_family_in_patch_chain():
    assert 'font-family:var(--font-read)!important' in V19
    assert not re.search(r'\.v17-reader \.integral-body\{[^}]*font-family:',V17)
    assert not re.search(r'\.v18-reader \.integral-body\{[^}]*font-family:',V18)
    assert not re.search(r'\.integral-body\{[^}]*font-family:',SHELL)
    assert '--font-read:Georgia,"Times New Roman",serif' in INDEX


def test_let04_admin_and_rank_responsive_source_of_truth_is_v29_1180():
    # index must not hide/reshape these structures at 900; v29 owns responsive collapse at 1180
    m=re.search(r'@media\(max-width:900px\)\{(.*?)\}\s*@media\(max-width:620px\)',INDEX,re.S)
    assert m
    block=m.group(1)
    assert '.admin-user-head' not in block
    assert '.admin-user-row' not in block
    assert '.platform-rank-head' not in block
    assert '.platform-rank-row' not in block
    assert '@media(max-width:1180px)' in V29
    assert '.admin-user-head{display:none!important}' in V29
    assert '.platform-rank-head{display:none!important}' in V29


def test_let05_v36_mobile_breakpoint_coverage_is_explicit():
    css=(ROOT/'data'/'v36-primary-prep.css').read_text(encoding='utf-8')
    for width in (768,430,390,360):
        assert re.search(rf'@media\s*\(max-width:\s*{width}px\)',css)


def test_let06_institutional_photo_is_external_cacheable_asset():
    assert 'data:image/webp;base64,' not in INDEX
    assert 'assets/manasses.webp?v=36.1' in INDEX
    assert 'decoding="async"' in INDEX
    p=ROOT/'assets'/'manasses.webp'
    assert p.exists() and p.stat().st_size>1000
    assert p.read_bytes()[:4]==b'RIFF' and p.read_bytes()[8:12]==b'WEBP'


def test_all_local_data_assets_use_v36_1_cache_key():
    refs=re.findall(r'(?:src|href)="(data/[^"?#]+\.(?:js|css))(\?v=[^"]+)?"',INDEX)
    assert refs
    stale=[(p,q) for p,q in refs if q!='?v=36.1']
    assert not stale,stale[:20]
