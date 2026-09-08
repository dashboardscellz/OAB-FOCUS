from pathlib import Path
import json, re, subprocess

ROOT=Path(__file__).resolve().parents[1]
INDEX=(ROOT/'index.html').read_text(encoding='utf-8')
QFILE=ROOT/'data'/'v30-questions.js'
RESEARCH=ROOT/'data'/'v34-research.js'
PATCH=ROOT/'data'/'v34-patch.js'
CURRENT_KEY='ABDCCDBBDCCADCCADACBACACBBABDCBCCDCDCADADADBADCCADBBCDBDBBDAACBDDCBBBDADBADABDCA'

def load_qs():
    text=QFILE.read_text(encoding='utf-8')
    m=re.search(r'window\.OAB47_QUESTIONS\s*=\s*(\[.*?\]);\s*$', text, re.S)
    assert m
    return json.loads(m.group(1))

def test_v34_files_exist_and_load_after_v33():
    assert RESEARCH.exists() and PATCH.exists()
    assert INDEX.index('data/v33-patch.js') < INDEX.index('data/v34-research.js') < INDEX.index('data/v34-patch.js')

def test_current_official_revised_preliminary_key_is_canonical():
    qs=load_qs()
    assert ''.join('ABCD'[q['answer']] for q in qs)==CURRENT_KEY
    assert 'ABCD'[qs[16]['answer']]=='D'
    assert all(q.get('officialStatus')=='preliminar-revisado-2026-09-07' for q in qs)

def test_every_47th_question_has_structured_specific_research_feedback():
    text=RESEARCH.read_text(encoding='utf-8')
    assert 'window.OAB47_RESEARCH' in text
    # one structured record per official question
    ids=set(re.findall(r'"oab47-(\d{2})"\s*:', text))
    assert ids=={f'{i:02d}' for i in range(1,81)}
    for required in ['whyCorrect','basis','trap','alternatives','sourceNote']:
        assert required in text

def test_wrong_answer_feedback_is_explicit_and_error_log_is_structured():
    text=PATCH.read_text(encoding='utf-8')
    assert 'Você marcou' in text and '— incorreta' in text
    assert 'Por que sua alternativa está errada' in text
    assert 'Análise das alternativas' in text
    assert 'errorLog' in text and 'selectedOption' in text and 'correctOption' in text
    assert 'conceptConfused' in text and 'legalBasis' in text

def test_all_study_units_receive_three_strict_questions_and_authorial_are_labelled():
    text=PATCH.read_text(encoding='utf-8')
    assert 'MIN_UNIT_QUESTIONS=3' in text
    assert 'ensureCoverageForChapters' in text
    assert 'OAB_V35_QUESTION_QUALITY' in text
    assert 'buildResearch' in text and 'isCompleteLegalStatement' in text
    assert 'excludeFromHistoricalStats:true' in text.replace(' ', '')
    assert 'subtopicStrict:' in text and '!!subtopic' in text
    assert 'sourceType:"authorial"' in text.replace(' ', '') or "sourceType:'authorial'" in text.replace(' ', '')

def test_trail_hierarchy_is_decontaminated_and_parent_slice_stops_before_child():
    text=PATCH.read_text(encoding='utf-8')
    assert 'cleanTrailSubtopics' in text
    assert 'directIntroForSubtopic' in text
    for noise in ['SUMÁRIO','STATUS DE EMENDA','STATUS DE NORMA SUPRALEGAL']:
        assert noise in text
    assert 'hasDescendant' in text

def test_highlights_cover_theory_law_and_summaries_with_six_colors():
    text=PATCH.read_text(encoding='utf-8')
    for color in ['yellow','green','blue','pink','purple','orange']:
        assert color in text
    assert '#zoneLaw .integral-body' in text
    assert 'scope' in text and 'law' in text and 'theory' in text

def test_visual_state_feedback_and_accessibility_are_centralized():
    text=PATCH.read_text(encoding='utf-8')
    assert 'aria-pressed' in text
    assert 'v34-active-state' in text
    assert 'v34-action-loading' in text
    assert 'Abrindo seu estudo' in text
    assert 'enhanceActionStates' in text

def test_visible_active_timer_and_session_history_are_present():
    text=PATCH.read_text(encoding='utf-8')
    for label in ['Sessão','Nesta unidade','Hoje','Total acumulado']:
        assert label in text
    assert 'studySessions' in text
    assert 'visibilitychange' in text
    assert '90000' in text

def test_no_maps_reintroduced():
    assert not (ROOT/'maps').exists()
    assert not (ROOT/'maps-hd').exists()
    assert not (ROOT/'data'/'map-manifest.js').exists()

def test_javascript_syntax():
    for f in (RESEARCH,PATCH):
        cp=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
        assert cp.returncode==0, cp.stderr
