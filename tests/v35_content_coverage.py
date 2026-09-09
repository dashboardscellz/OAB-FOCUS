import json, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
INDEX=(ROOT/'index.html').read_text(encoding='utf-8')
TARGETS={
 'Filosofia':['Filosofia do Direito Contemporânea','Hermenêutica Jurídica','Conceito de Direito','Positivismo','Immanuel Kant'],
 'Financeiro':['Orçamento Público','PPA, LDO e LOA','Créditos Adicionais','Responsabilidade Fiscal','Regime Fiscal Sustentável'],
 'Internacional':['Direito Civil Internacional','Condição Jurídica do Estrangeiro','Competência Internacional','Sentença Estrangeira','Nacionalidade'],
 'Ambiental':['Política, Instrumentos e Sistema Nacional do Meio Ambiente','Flora e Direito Ambiental','Federação e Competências em Matéria Ambiental','Teoria Objetiva da Responsabilidade Ambiental','Tutela do Meio Ambiente Artificial'],
 'Direitos Humanos':['Pacto de San José da Costa Rica','Política Nacional de Direitos Humanos','Pacto Internacional sobre Direitos Civis e Políticos','Comissão Interamericana de Direitos Humanos','Estatuto da Pessoa com Deficiência'],
 'Empresarial':['Direito Societário','Direito Falimentar e Recuperacional','Títulos de Crédito','Teoria Geral do Direito Empresarial','Contratos Empresariais'],
}

def material_menu():
    marker='window.OAB_MATERIAL='
    start=INDEX.index(marker)+len(marker)
    obj,end=json.JSONDecoder().raw_decode(INDEX[start:])
    return obj

def runtime_integral():
    js=r'''
const fs=require('fs'),vm=require('vm');
const root=process.argv[2];
const ctx={window:{},globalThis:{},console};ctx.globalThis=ctx.window;vm.createContext(ctx);
vm.runInContext(fs.readFileSync(root+'/data/integral-material.js','utf8'),ctx,{timeout:20000});
vm.runInContext(fs.readFileSync(root+'/data/v35-content-coverage.js','utf8'),ctx,{timeout:20000});
console.log(JSON.stringify({disciplines:ctx.window.OAB_INTEGRAL.disciplines,meta:ctx.window.OAB_V35_9_CONTENT_COVERAGE}));
'''
    out=subprocess.check_output(['node','-',str(ROOT)],input=js,text=True,timeout=40)
    return json.loads(out)

def test_patch_is_loaded_immediately_after_integral_material():
    a=INDEX.index('data/integral-material.js?v=36.0')
    b=INDEX.index('data/v35-content-coverage.js?v=36.0')
    assert a < b
    assert '?v=35.8' not in INDEX

def test_all_menu_disciplines_have_runtime_theory():
    menu=material_menu()['disciplines']
    rt=runtime_integral()['disciplines']
    assert len(menu)==20
    assert set(d['name'] for d in menu)==set(rt)
    missing=[]
    for d in menu:
        theory=[s for s in rt[d['name']] if s.get('kind') in ('Teoria completa','Complemento aprofundado') and s.get('text','').strip()]
        if not theory: missing.append(d['name'])
    assert missing==[]

def test_target_disciplines_have_theory_for_every_menu_topic():
    menu={d['name']:[t['title'] for t in d['topics']] for d in material_menu()['disciplines']}
    rt=runtime_integral()['disciplines']
    for disc,expected in TARGETS.items():
        assert menu[disc]==expected
        actual=[s['title'] for s in rt[disc] if s.get('kind')=='Teoria completa']
        for title in expected:
            assert title in actual, (disc,title)
            sec=next(s for s in rt[disc] if s.get('kind')=='Teoria completa' and s.get('title')==title)
            assert len(sec.get('text','').split()) >= 250, (disc,title,len(sec.get('text','').split()))

def test_degraded_disciplines_no_longer_inject_global_legislation_into_every_topic():
    rt=runtime_integral()['disciplines']
    for disc in ['Financeiro','Internacional','Ambiental','Direitos Humanos','Empresarial']:
        assert not [s for s in rt[disc] if s.get('kind')=='Legislação completa']
        archive=[s for s in rt[disc] if s.get('kind')=='Legislação de referência' and s.get('title')=='Legislação integral']
        assert len(archive)==1 and len(archive[0].get('text',''))>5000
        law=[s for s in rt[disc] if s.get('kind')=='Lei seca e súmulas']
        assert {s['title'] for s in law}==set(TARGETS[disc])

def test_theory_has_complete_propositions_for_authorial_question_generator():
    rt=runtime_integral()['disciplines']
    quality=str(ROOT/'data/v35-question-quality.js')
    samples=[]
    for disc,titles in TARGETS.items():
        for title in titles:
            sec=next(s for s in rt[disc] if s.get('kind')=='Teoria completa' and s.get('title')==title)
            samples.append([disc,title,sec['text']])
    js=r'''
const q=require(process.argv[2]);const rows=JSON.parse(process.argv[3]);
const bad=[];for(const [d,t,text] of rows){const r=q.extractRule(text,t);if(!r.rule||!q.isCompleteLegalStatement(r.rule))bad.push([d,t,r]);}
console.log(JSON.stringify(bad));
'''
    out=subprocess.check_output(['node','-',quality,json.dumps(samples,ensure_ascii=False)],input=js,text=True,timeout=40)
    assert json.loads(out)==[]

def test_v359_metadata_reports_six_repaired_disciplines():
    meta=runtime_integral()['meta']
    assert meta['VERSION']=='35.9'
    assert set(meta['disciplines'])==set(TARGETS)
    assert all(x['theory']==5 for x in meta['applied'])
    assert next(x for x in meta['applied'] if x['discipline']=='Filosofia')['law']==0
    assert all(x['law']==5 for x in meta['applied'] if x['discipline']!='Filosofia')

def test_every_new_topic_can_generate_four_complete_options_and_structured_feedback():
    rt=runtime_integral()['disciplines']
    quality=str(ROOT/'data/v35-question-quality.js')
    samples=[]
    for disc,titles in TARGETS.items():
        for title in titles:
            sec=next(s for s in rt[disc] if s.get('kind')=='Teoria completa' and s.get('title')==title)
            law='\n'.join(s.get('text','') for s in rt[disc] if s.get('kind')=='Lei seca e súmulas' and s.get('title')==title)
            samples.append([disc,title,sec['text'],law])
    js=r'''
const q=require(process.argv[2]);
const rows=JSON.parse(process.argv[3]);
const bad=[];
for(const [d,t,text,law] of rows){
  const r=q.extractRule(text,t);
  const wrong=q.buildDistractors(r.rule,t);
  const opts=[r.rule,...wrong.slice(0,3)];
  const research=q.buildResearch(r.rule,opts,0,t,text+'\n'+law);
  if(opts.length!==4||opts.some(x=>!q.isCompleteLegalStatement(x))||!research||!research.whyCorrect||Object.keys(research.alternatives||{}).length<4)bad.push([d,t,opts,research]);
}
console.log(JSON.stringify(bad));
'''
    out=subprocess.check_output(['node','-',quality,json.dumps(samples,ensure_ascii=False)],input=js,text=True,timeout=40)
    assert json.loads(out)==[]
