from pathlib import Path
import json, subprocess, re
ROOT=Path(__file__).resolve().parents[1]
ENGINE=ROOT/'data/v35-authorial-fgv.js'

BANNED=[
    'após um conflito relacionado a',
    'em uma controvérsia concreta envolvendo',
    'em caso relacionado a',
    'em situação envolvendo',
    'no curso de uma situação relacionada a',
]

def node_eval(script:str):
    out=subprocess.check_output(['node','-e',script],cwd=ROOT,text=True)
    return json.loads(out)


def test_prompt_master_diversity_exists_and_encodes_core_rule():
    p=ROOT/'PROMPT_MESTRE_DIVERSIDADE_QUESTOES_FGV_v35_15.md'
    assert p.exists()
    txt=p.read_text(encoding='utf-8').lower()
    assert 'diversidade semântica' in txt or 'diversidade semantica' in txt
    assert 'se for possível trocar apenas o nome do assunto' in txt or 'se for possivel trocar apenas o nome do assunto' in txt
    assert 'após um conflito' in txt and 'proib' in txt
    assert 'memória antirrepetição' in txt or 'memoria antirrepeticao' in txt


def test_engine_version_and_no_old_fallback_templates():
    js=ENGINE.read_text(encoding='utf-8').lower()
    assert "const version='35.18'" in js
    for phrase in BANNED:
        assert phrase not in js


def test_engine_has_many_semantic_families_and_opening_variants():
    js=ENGINE.read_text(encoding='utf-8')
    # Require breadth, not a tiny synonym list.
    for family in ['ethics','international','criminal','criminalProcedure','civilContracts','civilFamily','consumer','administrative','constitutional','tax','labor','laborProcedure','business','environment','eca','humanRights','financial','electoral','philosophy']:
        assert family in js
    assert 'recentOpenings' in js and 'similarity' in js
    assert 'scenarioCatalog' in js


def test_500_questions_have_diverse_openings_and_no_dominant_prefix():
    script=r'''
const e=require('./data/v35-authorial-fgv.js');
const topics=[
 ['Ética','Publicidade na Advocacia','A publicidade profissional deve observar caráter meramente informativo e discrição.'],
 ['Constitucional','Controle de Constitucionalidade','Compete ao Supremo Tribunal Federal processar e julgar a ação direta de inconstitucionalidade.'],
 ['Administrativo','Poder de Polícia','O poder de polícia condiciona o exercício de direitos em benefício do interesse público.'],
 ['Civil','Compra e Venda','A compra e venda transfere direitos e gera obrigações conforme os requisitos legais.'],
 ['Processo Civil','Agravo de Instrumento','Cabe agravo de instrumento nas hipóteses previstas em lei.'],
 ['Penal','Erro de Tipo','O erro sobre elemento constitutivo do tipo legal exclui o dolo.'],
 ['Processo Penal','Inquérito Policial','O inquérito policial é procedimento administrativo de natureza inquisitiva.'],
 ['Trabalho','Horas Extras','A jornada extraordinária produz os efeitos previstos na legislação trabalhista.'],
 ['Processo do Trabalho','Recurso Ordinário','O recurso ordinário é cabível nas hipóteses definidas pela CLT.'],
 ['Empresarial','Sociedade Limitada','A sociedade limitada rege-se pelas regras legais e pelo contrato social.'],
 ['Tributário','Imunidade Tributária','A imunidade tributária limita constitucionalmente o poder de tributar.'],
 ['Direitos Humanos','Sistema Interamericano','A proteção interamericana dos direitos humanos segue os tratados aplicáveis.'],
 ['Internacional','Conflito de Leis no Espaço','A lei aplicável às obrigações observa os elementos de conexão previstos na LINDB.'],
 ['Ambiental','Licenciamento Ambiental','O licenciamento ambiental é exigido nas hipóteses previstas na legislação.'],
 ['Consumidor','Responsabilidade pelo Fato do Produto','O fornecedor responde pelos danos decorrentes de defeito do produto nos termos do CDC.'],
 ['ECA','Adoção','A adoção observa os requisitos e efeitos previstos no Estatuto da Criança e do Adolescente.'],
 ['Filosofia','Positivismo Jurídico','O positivismo jurídico distingue validade jurídica de juízos morais.'],
 ['Financeiro','Créditos Adicionais','Créditos adicionais dependem das hipóteses e autorizações previstas no direito financeiro.'],
 ['Eleitoral','Inelegibilidades','As inelegibilidades incidem nas hipóteses constitucionais e legais.']
];
const qs=[];
for(let i=0;i<500;i++){
  const t=topics[i%topics.length];
  const q=e.buildQuestion({id:'d'+i,discipline:t[0],topic:t[1],seq:i+1,rule:t[2],context:''});
  if(q) qs.push(q.statement);
}
function prefix(s){return s.toLowerCase().replace(/[^a-záéíóúâêôãõç0-9 ]/gi,' ').split(/\s+/).slice(0,5).join(' ')}
const counts={};for(const s of qs){const p=prefix(s);counts[p]=(counts[p]||0)+1;}
const max=Math.max(...Object.values(counts));
console.log(JSON.stringify({n:qs.length,unique:new Set(qs).size,max,prefixes:Object.keys(counts).length,statements:qs.slice(0,20)}));
'''
    r=node_eval(script)
    assert r['n'] >= 480
    assert r['unique'] / r['n'] >= 0.90
    assert r['max'] <= 25  # no opening family may dominate >5% of 500
    assert r['prefixes'] >= 80
    low=' '.join(r['statements']).lower()
    for phrase in BANNED:
        assert phrase not in low


def test_international_conflict_of_laws_is_semantically_specific():
    script=r'''
const e=require('./data/v35-authorial-fgv.js');
const arr=[];
for(let i=1;i<=12;i++) arr.push(e.buildQuestion({id:'int'+i,discipline:'Internacional',topic:'Conflito de Leis no Espaço',seq:i,rule:'A lei aplicável às obrigações observa os elementos de conexão previstos na LINDB.',context:''}).statement);
console.log(JSON.stringify(arr));
'''
    arr=node_eval(script)
    text=' '.join(arr).lower()
    assert any(k in text for k in ['exterior','país','domicílio','brasil','contrato','sucessão','bens'])
    assert 'após um conflito relacionado a' not in text
    assert len(set(arr)) >= 10


def test_distractors_do_not_use_old_generic_crutches():
    js=ENGINE.read_text(encoding='utf-8').lower()
    assert 'depende sempre de autorização judicial prévia' not in js
    assert 'consequência jurídica é automática em qualquer hipótese' not in js


def test_index_cache_bumped_to_3518():
    idx=(ROOT/'index.html').read_text(encoding='utf-8')
    assert 'data/v35-authorial-fgv.js?v=35.18' in idx
    assert 'data/v20-patch.js?v=35.18' in idx
    assert 'data/v34-patch.js?v=35.18' in idx
