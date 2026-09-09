from pathlib import Path
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
QUALITY = ROOT / 'data' / 'v35-question-quality.js'
V34 = ROOT / 'data' / 'v34-patch.js'
V20 = ROOT / 'data' / 'v20-patch.js'
INDEX = ROOT / 'index.html'
PROMPT = ROOT / 'PROMPT_MESTRE_QUALIDADE_QUESTOES_v35_7.md'


def node_eval(expr: str):
    path = str(QUALITY).replace('\\', '\\\\')
    js = f"const Q=require('{path}'); console.log(JSON.stringify({expr}));"
    p = subprocess.run(['node','-'], cwd=ROOT, text=True, input=js, capture_output=True)
    if p.returncode:
        raise AssertionError(p.stderr)
    return json.loads(p.stdout)


def test_quality_module_and_prompt_exist():
    assert QUALITY.exists()
    assert PROMPT.exists()


def test_reported_dangling_rule_is_rejected_and_multiline_rule_is_completed():
    text = '''
2. Atividades e atos privativos da advocacia
Essa centralidade do advogado no sistema jurídico se reflete na existência de funções que são
privativas da advocacia, como a postulação perante os órgãos do Poder Judiciário e as atividades de consultoria, assessoria e direção jurídicas.
Art. 1º da Lei 8.906/1994 disciplina as atividades privativas da advocacia.
'''
    result = node_eval(f"Q.extractRule({json.dumps(text)}, 'Funções Privativas de Advogado')")
    assert result['rule']
    assert not result['rule'].lower().rstrip('.').endswith('são')
    assert 'privativas da advocacia' in result['rule'].lower()


def test_complete_statement_validator_catches_dangling_alternative():
    bad = 'Essa centralidade do advogado no sistema jurídico se reflete na existência de funções que não são'
    good = 'A consultoria, a assessoria e a direção jurídicas constituem atividades privativas de advocacia.'
    assert node_eval(f"Q.isCompleteLegalStatement({json.dumps(bad)})") is False
    assert node_eval(f"Q.isCompleteLegalStatement({json.dumps(good)})") is True


def test_authorial_research_has_detailed_sections_and_legal_basis():
    opts = [
        'A consultoria, a assessoria e a direção jurídicas constituem atividades privativas de advocacia.',
        'A consultoria jurídica pode ser exercida livremente por qualquer pessoa, independentemente de inscrição profissional.',
        'A direção jurídica somente é privativa quando exercida perante órgão judicial.',
        'A assessoria jurídica deixa de ser atividade privativa quando prestada de forma remunerada.'
    ]
    context = 'Art. 1º, II, da Lei 8.906/1994 prevê como atividades privativas de advocacia as atividades de consultoria, assessoria e direção jurídicas.'
    result = node_eval(f"Q.buildResearch({json.dumps(opts[0])}, {json.dumps(opts)}, 0, 'Funções Privativas de Advogado', {json.dumps(context)})")
    assert len(result['whyCorrect']) >= 80
    assert 'Lei 8.906/1994' in result['basis']
    assert all(letter in result['alternatives'] for letter in ['A','B','C','D'])
    assert 'Questão autoral de fixação' not in result['whyCorrect']
    assert 'Regra diretamente extraída desta unidade' not in result['whyCorrect']


def test_question_audit_flags_dangling_duplicates_and_generic_comment():
    q = {
        'id':'x','discipline':'Ética','statement':'Assinale a correta.',
        'options':['A regra é válida.','A regra é válida.','A conclusão depende de','Outra alternativa completa.'],
        'answer':0,
        'comment':'Questão autoral de fixação — OAB Focus. Regra diretamente extraída desta unidade: teste'
    }
    issues = node_eval(f"Q.auditQuestion({json.dumps(q)})")
    codes = {x['code'] for x in issues}
    assert 'DUPLICATE_OPTIONS' in codes
    assert 'TRUNCATED_OPTION' in codes
    assert 'GENERIC_COMMENT' in codes


def test_v34_authorial_generator_uses_quality_engine_and_structured_research():
    src = V34.read_text(encoding='utf-8')
    assert 'OAB_V35_QUESTION_QUALITY' in src
    assert 'extractRule' in src
    assert 'buildResearch' in src
    assert 'research:' in src
    assert 'Regra diretamente extraída desta unidade' not in src


def test_v20_generator_uses_quality_gate_instead_of_raw_sentence_fragments():
    src = V20.read_text(encoding='utf-8')
    assert 'OAB_V35_QUESTION_QUALITY' in src
    assert 'extractRule' in src
    assert 'buildResearch' in src
    assert 'Fundamento-base da unidade' not in src


def test_quality_engine_loads_before_authorial_generators_and_uses_cache_version():
    html = INDEX.read_text(encoding='utf-8')
    marker = 'src="data/v35-question-quality.js?v=35.9"'
    assert marker in html
    assert html.index(marker) < html.index('data/v20-patch.js')
    assert html.index(marker) < html.index('data/v34-patch.js')


def test_prompt_requires_official_current_sources_and_rejects_invention():
    text = PROMPT.read_text(encoding='utf-8').lower()
    for needle in ['planalto', 'stf', 'stj', 'fgv', 'não invent', 'cada alternativa', 'legislação vigente', 'trilha']:
        assert needle in text


def test_static_bank_has_no_known_stray_open_parenthesis_corruptions():
    html = INDEX.read_text(encoding='utf-8')
    for bad in [
        '"(indeferir o pedido, pois a certidão',
        '"(Marcos pode promover denunciação da lide',
        '"(prescrição da pretensão punitiva, porque já foi ultrapassado o prazo prescricional entre a data do oferecimento',
    ]:
        assert bad not in html


def test_build_queue_excludes_questions_without_valid_answer_key():
    html = INDEX.read_text(encoding='utf-8')
    block = html[html.index('function buildQueue(){'):html.index('function stopQuestionTimer', html.index('function buildQueue(){'))]
    compact = block.replace(' ', '')
    assert 'Number.isInteger(q.answer)' in block
    assert 'q.answer<0' in compact
    assert 'q.answer>=q.options.length' in compact


def test_authorial_feedback_explains_each_generated_distractor_concretely():
    rule = 'As atividades de consultoria, assessoria e direção jurídicas são atividades privativas de advocacia.'
    opts = node_eval(f"Q.buildDistractors({json.dumps(rule)}, 'Funções Privativas de Advogado')")
    options = [rule] + opts
    result = node_eval(f"Q.buildResearch({json.dumps(rule)}, {json.dumps(options)}, 0, 'Funções Privativas de Advogado', {json.dumps('Art. 1º, II, da Lei 8.906/1994 prevê as atividades de consultoria, assessoria e direção jurídicas como privativas de advocacia.')})")
    wrong = [result['alternatives'][x] for x in ['B','C','D']]
    assert any('inverte' in x.lower() or 'nega' in x.lower() for x in wrong)
    assert any('requisito' in x.lower() for x in wrong)
    assert any('absolut' in x.lower() or 'exce' in x.lower() for x in wrong)
