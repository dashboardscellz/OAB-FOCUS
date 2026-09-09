import json,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
INDEX=(ROOT/'index.html').read_text(encoding='utf-8')

def test_v36_assets_load_after_v35_assets():
    for f in ['v36-content-governance.js','v36-curated-questions.js','v36-primary-prep.js']:
        assert f'data/{f}?v=36.0' in INDEX
    assert 'data/v36-primary-prep.css?v=36.0' in INDEX
    assert INDEX.index('data/v35-taxonomy.js?v=36.0') < INDEX.index('data/v36-primary-prep.js?v=36.0')

def test_all_local_data_scripts_use_v36_cache_key():
    tags=re.findall(r'<script[^>]*src="(data/[^"]+\.js(?:\?[^\"]*)?)"[^>]*>',INDEX)
    assert tags and all('?v=36.0' in t for t in tags),[t for t in tags if '?v=36.0' not in t]

def test_release_docs_and_version_markers_present():
    for name in ['AUDITORIA_JURIDICA_v36.md','QA_ENGENHARIA_v36.md','FONTES_V36.md','PROMPT_MESTRE_OAB_FOCUS_PRINCIPAL_v36.md']:
        assert (ROOT/name).exists(),name
    readme=(ROOT/'README.md').read_text(encoding='utf-8')
    assert 'v36' in readme and 'Lei 15.040/2024' in readme and 'ferramenta principal' in readme.lower()

def test_47_exam_still_has_80_questions():
    js=f'''global.window=global;require({json.dumps(str(ROOT/'data'/'v30-questions.js'))});console.log((global.OAB47_QUESTIONS||[]).length);'''
    out=subprocess.check_output(['node','-'],input=js,text=True,timeout=30).strip()
    assert out=='80'

def test_updater_mentions_v36_and_new_assets():
    s=(ROOT/'ATUALIZAR_GITHUB.cmd').read_text(encoding='utf-8',errors='ignore')
    assert 'v36' in s.lower()
    for f in ['v36-content-governance.js','v36-curated-questions.js','v36-primary-prep.js','v36-primary-prep.css']:
        assert f in s
