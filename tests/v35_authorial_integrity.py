from pathlib import Path
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def node_eval(script: str):
    p = subprocess.run(['node', '-e', script], cwd=ROOT, text=True, capture_output=True)
    if p.returncode:
        raise AssertionError(p.stderr)
    return json.loads(p.stdout)


REPORTED_CONTEXT = '''
3. Tempo do Crime

Ou seja, o TEMPO do crime é o momento da ação ou omissão, adotando-se a TEORIA DA ATIVIDADE!

Exemplo: Pedro, menor de idade, com o intuito de matar Matheus, desferiu um tiro nele, que veio a
falecer uma semana depois. Para fins penais, o crime foi praticado no momento da ação de Pedro.

O Pedro praticou ato infracional, sendo assim, irá ser responsabilizado conforme o Estatuto da
Criança e do Adolescente.
'''


def test_rule_extractor_prefers_normative_proposition_over_example_specific_conclusion():
    r = node_eval(
        "const q=require('./data/v35-question-quality.js'); "
        f"console.log(JSON.stringify(q.extractRule({json.dumps(REPORTED_CONTEXT)}, 'Tempo do Crime')));"
    )
    rule = r['rule'].lower()
    assert 'momento da ação ou omissão' in rule
    assert 'pedro' not in rule
    assert 'matheus' not in rule
    assert not rule.startswith('para fins penais, o crime foi praticado')
    assert r['rule'].startswith('O tempo do crime')
    assert 'TEORIA DA ATIVIDADE' not in r['rule']
    assert r['rule'].endswith('.')


def test_quality_gate_rejects_orphan_character_introduced_only_by_an_option():
    q = {
        'statement': 'Clara e Felipe analisam uma situação penal e precisam definir o momento juridicamente relevante para a prática do crime. À luz do Código Penal, assinale a afirmativa correta.',
        'options': [
            'O crime considera-se praticado somente quando ocorre o resultado naturalístico.',
            'A definição temporal depende exclusivamente do início da investigação policial.',
            'O momento relevante é sempre o oferecimento da denúncia, independentemente da conduta.',
            'Para fins penais, o crime foi praticado no momento da ação de Pedro.'
        ],
        'answer': 3,
        'comment': 'Comentário técnico suficiente para o teste.'
    }
    r = node_eval(
        "const e=require('./data/v35-authorial-fgv.js'); "
        f"console.log(JSON.stringify(e.qualityGate({json.dumps(q, ensure_ascii=False)})));"
    )
    assert r['ok'] is False
    assert 'orphan_entity' in r['reasons']


def test_tempo_do_crime_question_contains_operational_facts_and_legal_distractors():
    rule = 'O tempo do crime é o momento da ação ou omissão, adotando-se a Teoria da Atividade.'
    r = node_eval(
        "const e=require('./data/v35-authorial-fgv.js'); "
        f"const q=e.buildQuestion({{id:'tempo-crime-v3519',discipline:'Penal',topic:'Tempo do Crime',seq:3,rule:{json.dumps(rule, ensure_ascii=False)},context:{json.dumps(REPORTED_CONTEXT, ensure_ascii=False)}}}); "
        "console.log(JSON.stringify(q));"
    )
    assert r is not None
    st = r['statement'].lower()
    # A factual problem must contain conduct + later result, not merely the topic name.
    assert re.search(r'(ação|dispar|conduta|golpe|ferimento)', st)
    assert re.search(r'(resultado|faleceu|morreu|óbito|dias? depois|posterior)', st)
    assert not re.search(r'receberam orientações divergentes sobre tempo do crime', st)
    joined_options = ' '.join(r['options']).lower()
    banned = [
        'conduz à conclusão oposta',
        'efeito jurídico previsto pode ser afastado',
        'depende de requisito adicional que não integra',
    ]
    for phrase in banned:
        assert phrase not in joined_options
    assert any('resultado' in o.lower() for o in r['options'])
    assert any(('ação' in o.lower() or 'omissão' in o.lower()) for o in r['options'])
    correct = r['options'][r['answer']]
    assert correct.startswith('O tempo do crime')
    assert 'TEORIA DA ATIVIDADE' not in correct


def test_rule_extractor_does_not_promote_an_example_paragraph_to_legal_rule_when_no_general_rule_exists():
    only_example = """Exemplo: Pedro, menor de idade, desferiu um tiro em Matheus. Para fins penais, o crime foi praticado no momento da ação de Pedro."""
    r = node_eval(
        "const q=require('./data/v35-question-quality.js'); "
        f"console.log(JSON.stringify(q.extractRule({json.dumps(only_example)}, 'Tempo do Crime')));"
    )
    assert r['rule'] == ''


def test_v3519_prompt_is_a_rejection_spec_not_a_soft_style_guide():
    p = ROOT / 'PROMPT_MESTRE_AUTOSSUFICIENCIA_QUESTOES_v35_19.md'
    assert p.exists()
    t = p.read_text(encoding='utf-8').lower()
    for needle in [
        'autossuficiente', 'personagem órfão', 'fato operacional', 'teste reverso',
        'unicidade do gabarito', 'rejeite', 'não tente remend', 'dificuldade jurídica',
        'enunciado decorativo', 'todos os fatos necessários'
    ]:
        assert needle in t
