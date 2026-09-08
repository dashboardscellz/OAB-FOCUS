from pathlib import Path
import json, re, subprocess

ROOT=Path(__file__).resolve().parents[1]
INDEX=(ROOT/'index.html').read_text(encoding='utf-8')
QFILE=ROOT/'data'/'v30-questions.js'
PATCH=ROOT/'data'/'v30-patch.js'

OFFICIAL='ABDCCDBBDCCADCCADACBACACBBABDCBCCDCDCADADADBADCCADBBCDBDBBDAACBDDCBBBDADBADABDCA'

def _load_questions():
    text=QFILE.read_text(encoding='utf-8')
    m=re.search(r'window\.OAB47_QUESTIONS\s*=\s*(\[.*?\]);\s*$', text, re.S)
    assert m, 'v30-questions.js must expose window.OAB47_QUESTIONS as JSON array'
    return json.loads(m.group(1))

def test_v30_files_exist():
    assert QFILE.exists()
    assert PATCH.exists()

def test_index_loads_v30_questions_before_app_constant_and_patch_after_v29():
    qpos=INDEX.index('data/v30-questions.js')
    constpos=INDEX.index('const QUESTIONS = window.OAB_QUESTIONS || [];')
    p29=INDEX.index('data/v29-patch.js')
    p30=INDEX.index('data/v30-patch.js')
    assert qpos < constpos
    assert p29 < p30

def test_exactly_80_new_official_questions():
    qs=_load_questions()
    assert len(qs)==80
    assert [q['id'] for q in qs]==[f'oab47-{i:02d}' for i in range(1,81)]
    assert [q['number'] for q in qs]==list(range(1,81))
    assert all(q['exam']=='47º EOU' for q in qs)
    assert all(q.get('officialStatus')=='preliminar-revisado-2026-09-07' for q in qs)

def test_official_preliminary_answer_key_matches_fgv_type_1():
    qs=_load_questions()
    actual=''.join('ABCD'[q['answer']] for q in qs)
    assert actual==OFFICIAL

def test_all_questions_have_four_options_topics_and_real_comments():
    qs=_load_questions()
    for q in qs:
        assert len(q['options'])==4
        assert all(isinstance(x,str) and len(x.strip())>=2 for x in q['options'])
        assert len(q['statement'])>=60
        assert q['discipline'] and q['topic']
        c=q['comment']
        assert 'Gabarito preliminar' in c and 'FGV' in c
        assert 'Fundamento:' in c
        assert len(c)>=150
        assert 'Regra-chave para revisão:' not in c



def test_question_17_uses_fgv_revised_preliminary_key():
    q=_load_questions()[16]
    assert 'ABCD'[q['answer']]=='D'
    assert 'Tratado de Marraqueche' in q['comment']
    assert 'alterou o gabarito preliminar em 07/09/2026' in q['comment']

def test_v30_patch_adds_exam_and_safe_context_map():
    text=PATCH.read_text(encoding='utf-8')
    assert "47º EOU" in text
    assert 'OAB_V16_QUESTION_MAP' in text
    assert 'officialStatus' in text
    assert '13 provas' in text or 'V13_COMPLETE_EXAMS.length' in text

def test_every_safe_mapping_points_to_existing_chapter_in_same_discipline():
    old=(ROOT/'data'/'v16-question-map.js').read_text(encoding='utf-8')
    om=re.search(r'window\.OAB_V16_QUESTION_MAP=(\{.*\});\s*$',old,re.S)
    assert om
    oldmap=json.loads(om.group(1))
    known={(v.get('discipline'),v.get('chapterId')) for v in oldmap.values()}
    text=PATCH.read_text(encoding='utf-8')
    mm=re.search(r'const SAFE_MAP=(\{.*?\});\n  if\(window\.OAB_V16_QUESTION_MAP',text,re.S)
    assert mm
    safe=json.loads(mm.group(1))
    bad=[(qid,v['discipline'],v['chapterId']) for qid,v in safe.items() if (v['discipline'],v['chapterId']) not in known]
    assert not bad, bad

def test_javascript_syntax():
    for f in (QFILE,PATCH):
        cp=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
        assert cp.returncode==0, cp.stderr

def test_historical_recurrence_uses_13_complete_exams_everywhere():
    index=INDEX
    v15=(ROOT/'data'/'v15-patch.js').read_text(encoding='utf-8')
    stale_patterns=[
        r'examCount\s*/\s*12',
        r'examCount\}\s*/12',
        r'12 provas completas',
        r'Histórico das 12 provas completas',
        r'/12 provas',
    ]
    stale=[]
    for source_name,text in [('index.html',index),('data/v15-patch.js',v15)]:
        for pattern in stale_patterns:
            if re.search(pattern,text):
                stale.append((source_name,pattern))
    assert not stale, stale
    assert "'47º EOU'" in index

def test_topics_are_semantically_specific_for_new_subjects():
    qs={q['number']:q for q in _load_questions()}
    expected={
        17:'Tratados Internacionais de Direitos Humanos',
        18:'Tribunal Penal Internacional',
        30:'Atos Administrativos',
        31:'Processo Administrativo',
        35:'Competências em Matéria Ambiental',
        36:'Responsabilidade Penal Ambiental',
        40:'Proteção de Dados Pessoais (LGPD)',
        41:'Direitos da Personalidade',
        64:'Jurisdição e Competência',
        76:'Ações Especiais',
        77:'Competência da Justiça do Trabalho',
        78:'Preparo Recursal',
        80:'Ação de Cumprimento',
    }
    for number,topic in expected.items():
        assert qs[number]['topic']==topic, (number, qs[number]['topic'])
