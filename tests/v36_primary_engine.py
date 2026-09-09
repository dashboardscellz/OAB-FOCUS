import json, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ENGINE=ROOT/'data'/'v36-primary-prep.js'
CSS=ROOT/'data'/'v36-primary-prep.css'

def run_engine(expr,extra=''):
    js=f'''
const fs=require('fs'),vm=require('vm');
const ctx={{window:{{}},globalThis:{{}},console,setTimeout,clearTimeout,Date,Math}};ctx.globalThis=ctx.window;vm.createContext(ctx);
vm.runInContext(fs.readFileSync({json.dumps(str(ENGINE))},'utf8'),ctx,{{timeout:30000}});
{extra}
console.log(JSON.stringify({expr}));
'''
    return json.loads(subprocess.check_output(['node','-'],input=js,text=True,timeout=60))

def test_engine_files_exist():
    assert ENGINE.exists() and CSS.exists()

def test_latest_exam_weight_fallback_sums_80_and_has_expected_distribution():
    w=run_engine('ctx.window.OAB_V36_ENGINE.FALLBACK_EXAM_WEIGHTS')
    assert sum(w.values())==80
    assert w['Ética']==8
    for d in ['Constitucional','Civil','Processo Civil','Penal','Processo Penal']:
        assert w[d]==6
    assert w['Empresarial']==4
    assert w['Filosofia']==2

def test_priority_score_rewards_exam_weight_weakness_and_overdue_review():
    extra='''
const E=ctx.window.OAB_V36_ENGINE;
const base={disciplineWeight:2,historical:0.3,weakness:0.2,overdue:0.1,coverageGap:0.2,difficulty:0.2,daysToExam:90};
const high={disciplineWeight:8,historical:0.7,weakness:0.8,overdue:0.9,coverageGap:0.8,difficulty:0.5,daysToExam:30};
ctx.low=E.priorityScore(base);ctx.high=E.priorityScore(high);
'''
    vals=run_engine('{low:ctx.low,high:ctx.high}',extra)
    assert vals['high']>vals['low']
    assert 0<=vals['low']<=100 and 0<=vals['high']<=100

def test_weighted_quota_builder_returns_exactly_80():
    extra='''
const E=ctx.window.OAB_V36_ENGINE;
ctx.q=E.normalizedQuota(E.FALLBACK_EXAM_WEIGHTS,80);
'''
    q=run_engine('ctx.q',extra)
    assert sum(q.values())==80
    assert q['Ética']==8 and q['Empresarial']==4

def test_simulation_builder_prefers_official_and_excludes_invalid_and_authorial_when_enough():
    extra='''
const E=ctx.window.OAB_V36_ENGINE;
const weights={Ética:2,Civil:2};
const qs=[];
for(const d of Object.keys(weights)){
  for(let i=0;i<5;i++)qs.push({id:d+'-off-'+i,discipline:d,answer:0,options:['a','b','c','d'],exam:'45º EOU',sourceType:'official'});
  for(let i=0;i<3;i++)qs.push({id:d+'-aut-'+i,discipline:d,answer:0,options:['a','b','c','d'],exam:'Autoral — OAB Focus',authorial:true,sourceType:'authorial-reviewed'});
}
qs.push({id:'bad',discipline:'Ética',answer:9,options:['a','b','c','d']});
ctx.ids=E.buildWeightedQueue(qs,weights,4,{preferUnanswered:false,answers:{}}).map(x=>x.id);
'''
    ids=run_engine('ctx.ids',extra)
    assert len(ids)==4
    assert all('-off-' in x for x in ids)

def test_css_has_primary_prep_components_and_mobile_rules():
    s=CSS.read_text(encoding='utf-8')
    for token in ['.v36-readiness','.v36-priority-reason','.v36-mission-grid','.v36-source-badge','@media (max-width: 768px)']:
        assert token in s

def test_runtime_weighted_simulation_updates_global_lexical_queue():
    js=f'''
const fs=require('fs'),vm=require('vm');
const ctx={{window:{{}},globalThis:{{}},console,setTimeout:(fn)=>fn(),clearTimeout,Date,Math,document:{{getElementById:()=>null}}}};ctx.globalThis=ctx.window;ctx.window.document=ctx.document;vm.createContext(ctx);
vm.runInContext(`
const QUESTIONS=[]; for(const d of ['Ética','Civil']){{for(let i=0;i<10;i++)QUESTIONS.push({{id:d+i,discipline:d,answer:0,options:['a','b','c','d'],exam:'47º EOU',sourceType:'official'}});}}
let progress={{answers:{{}}}},qQueue=[],qIndex=7,qFilters={{status:'unanswered'}};function startSimulation(){{}};function renderQuestionHost(){{globalThis.didRender=true;}};function markDirty(){{}};function toast(){{}};
`,ctx);
vm.runInContext(fs.readFileSync({json.dumps(str(ENGINE))},'utf8'),ctx,{{timeout:30000}});
vm.runInContext(`startSimulation(); globalThis.result={{len:qQueue.length,index:qIndex,status:qFilters.status,didRender:globalThis.didRender===true}};`,ctx);
console.log(JSON.stringify(ctx.window.result));
'''
    d=json.loads(subprocess.check_output(['node','-'],input=js,text=True,timeout=60))
    assert d['len']==20
    assert d['index']==0 and d['status']=='all' and d['didRender'] is True

def test_diagnostic_builder_returns_40_weighted_questions():
    extra='''
const E=ctx.window.OAB_V36_ENGINE,qs=[];
for(const [d,w] of Object.entries(E.FALLBACK_EXAM_WEIGHTS))for(let i=0;i<Math.max(6,w);i++)qs.push({id:d+i,discipline:d,answer:0,options:['a','b','c','d'],exam:'46º EOU',sourceType:'official'});
ctx.ids=E.buildDiagnosticQueue(qs,{answers:{}});
'''
    ids=run_engine('ctx.ids.map(x=>x.id)',extra)
    assert len(ids)==40

def test_legacy_generated_authorials_are_reclassified_as_drill_not_fgv_style():
    extra='''
const E=ctx.window.OAB_V36_ENGINE;
const q={id:'v34-auto-civil-x',exam:'Autoral — OAB Focus',sourceType:'authorial',authorial:true,source:'OAB Focus — criada exclusivamente a partir do material da unidade'};
ctx.q=E.normalizeAuthorialProvenance(q);
'''
    q=run_engine('ctx.q',extra)
    assert q['sourceType']=='authorial-drill'
    assert 'reforço de regra' in q['exam'].lower()
    assert 'não é questão oficial' in q['source'].lower()
