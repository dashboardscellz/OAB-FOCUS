from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]

def test_engine_loaded_before_generators():
    idx=(ROOT/'index.html').read_text(encoding='utf-8')
    assert 'data/v35-authorial-fgv.js?v=35.18' in idx
    assert idx.index('v35-authorial-fgv.js?v=35.18') < idx.index('v20-patch.js') < idx.index('v34-patch.js')

def test_prompt_master_exists_and_bans_dead_prompts():
    p=(ROOT/'PROMPT_MESTRE_QUESTOES_AUTORAIS_ESTILO_FGV_v35_14.md').read_text(encoding='utf-8')
    low=p.lower()
    assert 'considerando o material' in low and 'proib' in low
    assert 'caso concreto' in low and 'distratores' in low

def test_old_generic_templates_removed_from_generators():
    txt=(ROOT/'data/v34-patch.js').read_text(encoding='utf-8')+'\n'+(ROOT/'data/v20-patch.js').read_text(encoding='utf-8')
    banned=['Considerando exclusivamente o conteúdo estudado','qual premissa deve orientar a solução de acordo com a unidade','compatível com o material da unidade','Sobre ${topic}, assinale a alternativa correta.']
    for b in banned: assert b not in txt

def test_generator_delegates_to_fgv_engine():
    v34=(ROOT/'data/v34-patch.js').read_text(encoding='utf-8')
    v20=(ROOT/'data/v20-patch.js').read_text(encoding='utf-8')
    assert 'OAB_V35_AUTHORIAL_FGV' in v34 and '.buildQuestion' in v34
    assert 'OAB_V35_AUTHORIAL_FGV' in v20 and '.buildQuestion' in v20

def test_engine_has_quality_gate_and_multiple_archetypes():
    js=(ROOT/'data/v35-authorial-fgv.js').read_text(encoding='utf-8')
    assert 'qualityGate' in js
    assert 'scenarioCatalog' in js and 'recentOpenings' in js and 'similarity' in js
    assert 'ethics' in js and 'international' in js and 'criminal' in js and 'constitutional' in js
    assert 'considerando o material' in js.lower()


def test_specialized_ethics_case_is_alive_and_distractors_are_plausible():
    js=(ROOT/'data/v35-authorial-fgv.js').read_text(encoding='utf-8')
    assert 'sociedade empresária que não possui advogado' in js
    assert 'Somente a postulação perante o Poder Judiciário' in js
    assert 'pessoas jurídicas' in js

def test_cache_bust_for_modified_generators():
    idx=(ROOT/'index.html').read_text(encoding='utf-8')
    assert 'data/v20-patch.js?v=35.18' in idx
    assert 'data/v34-patch.js?v=35.18' in idx
