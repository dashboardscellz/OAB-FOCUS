from pathlib import Path
import json, subprocess, re

ROOT = Path(__file__).resolve().parents[1]
ENGINE = ROOT / 'data' / 'v35-authorial-fgv.js'
QUALITY = ROOT / 'data' / 'v35-question-quality.js'


def node_eval(script: str):
    p = subprocess.run(['node','-e',script], cwd=ROOT, text=True, capture_output=True)
    if p.returncode:
        raise AssertionError(p.stderr)
    return json.loads(p.stdout)


def test_reported_penal_time_case_is_semantically_coherent_and_has_no_exam_annotation():
    dirty_rule = 'OBS: Se a sentença tiver transitado em julgado e tiver lei posterior que favoreça o réu, cabe requerer ao juízo da execução penal a redução da pena imposta. *CAIU NA OAB 28*.'
    script = f"""
const e=require('./data/v35-authorial-fgv.js');
const q=e.buildQuestion({{
  id:'reported-penal-time', discipline:'Penal',
  topic:'Eficácia da Lei Penal no Tempo e no Espaço · Regra Geral', seq:1,
  rule:{json.dumps(dirty_rule)}, context:{json.dumps(dirty_rule)}
}});
console.log(JSON.stringify(q));
"""
    q = node_eval(script)
    assert q is not None
    joined = ' '.join([q['statement'], *q['options'], q.get('comment','')]).lower()
    assert 'caiu na oab' not in joined
    assert 'obs:' not in joined
    # The prompt must concern the actual rule (lex mitior / execution after final judgment),
    # not a random criminal-law vignette such as attempt or self-defence.
    st=q['statement'].lower()
    assert (('posterior' in st and ('favorável' in st or 'benéfica' in st)) or re.search(r'transitad[oa].{0,12}julgad', st) or 'execução penal' in st)
    assert 'iniciou a execução de um delito' not in q['statement'].lower()
    assert 'agressão atual' not in q['statement'].lower()
    assert len(q['options']) == 4
    assert len(set(x.lower() for x in q['options'])) == 4


def test_sanitize_rule_removes_obs_and_oab_exam_markers_before_options_are_built():
    dirty = 'OBS: A regra jurídica permanece aplicável. *CAIU NA OAB 38*'
    result = node_eval(f"const e=require('./data/v35-authorial-fgv.js'); console.log(JSON.stringify(e.sanitizeRule({json.dumps(dirty)}))); ")
    assert result == 'A regra jurídica permanece aplicável.'


def test_options_are_not_near_duplicate_rewrites_of_the_same_sentence():
    rule = 'Se a sentença tiver transitado em julgado e tiver lei posterior que favoreça o réu, cabe requerer ao juízo da execução penal a redução da pena imposta.'
    script = f"""
const e=require('./data/v35-authorial-fgv.js');
const q=e.buildQuestion({{id:'near-dups',discipline:'Penal',topic:'Eficácia da Lei Penal no Tempo e no Espaço',seq:2,rule:{json.dumps(rule)},context:{json.dumps(rule)}}});
function sim(a,b){{
 const toks=s=>new Set(s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').split(/\\s+/).filter(x=>x.length>2));
 const A=toks(a),B=toks(b); let i=0; for(const x of A) if(B.has(x)) i++;
 return i/Math.max(1,Math.min(A.size,B.size));
}}
let max=0; for(let i=0;i<q.options.length;i++) for(let j=i+1;j<q.options.length;j++) max=Math.max(max,sim(q.options[i],q.options[j]));
console.log(JSON.stringify({{max,options:q.options}}));
"""
    r = node_eval(script)
    assert r['max'] < 0.90, r['options']


def test_quality_extractor_does_not_select_oab_annotation_as_part_of_rule():
    text = 'Regra Geral\nOBS: Se houver lei posterior mais favorável ao réu, ela pode produzir efeitos na execução penal. *CAIU NA OAB 28*\n'
    result = node_eval(f"const q=require('./data/v35-question-quality.js'); console.log(JSON.stringify(q.extractRule({json.dumps(text)}, 'Regra Geral'))); ")
    assert 'CAIU NA OAB' not in result['rule'].upper()
    assert not result['rule'].upper().startswith('OBS:')

def test_v3518_prompt_documents_coherence_and_annotation_bans():
    p=ROOT/'PROMPT_MESTRE_AVALIACAO_FINAL_v35_18.md'
    assert p.exists()
    t=p.read_text(encoding='utf-8').lower()
    for needle in ['coerência', 'enunciado', 'alternativas', 'caiu na oab', 'repet', 'similaridade']:
        assert needle in t
