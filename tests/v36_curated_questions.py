import json, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
FILE=ROOT/'data'/'v36-curated-questions.js'

def load():
    js=r'''
const fs=require('fs'),vm=require('vm'),root=process.argv[2];
const ctx={window:{OAB_QUESTIONS:[],OAB_V16_QUESTION_MAP:{}},globalThis:{},console};ctx.globalThis=ctx.window;vm.createContext(ctx);
vm.runInContext(fs.readFileSync(root+'/data/v36-curated-questions.js','utf8'),ctx,{timeout:30000});
console.log(JSON.stringify({qs:ctx.window.OAB_V36_CURATED_QUESTIONS,pool:ctx.window.OAB_QUESTIONS,map:ctx.window.OAB_V16_QUESTION_MAP}));
'''
    return json.loads(subprocess.check_output(['node','-',str(ROOT)],input=js,text=True,timeout=60))

def test_curated_file_exists():
    assert FILE.exists()

def test_curated_bank_has_insurance_and_all_five_empresarial_topics():
    d=load();qs=d['qs']
    assert len(qs)>=18
    topics=set(q['topic'] for q in qs)
    assert 'Seguro — Lei 15.040/2024' in topics
    for t in ['Direito Societário','Direito Falimentar e Recuperacional','Títulos de Crédito','Teoria Geral do Direito Empresarial','Contratos Empresariais']:
        assert t in topics

def test_every_v36_authorial_is_transparent_and_structured():
    for q in load()['qs']:
        assert q['id'].startswith('v36-curated-')
        assert q['sourceType']=='authorial-reviewed'
        assert q['authorial'] is True
        assert q['excludeFromHistoricalStats'] is True
        assert q['qualityReviewVersion']=='36.0'
        assert q['reviewedAt']=='2026-09-08'
        assert len(q['options'])==4
        assert isinstance(q['answer'],int) and 0<=q['answer']<4
        r=q['research']
        assert r['basis'] and r['whyCorrect'] and r['trap'] and r['reviewRule']
        assert set(r['alternatives'])=={'A','B','C','D'}
        assert 'Questão autoral' in r['sourceNote']
        assert len(q['statement'].split())>=24

def test_curated_questions_are_inserted_once_and_strictly_mapped():
    d=load();assert len(d['pool'])==len(d['qs'])
    assert len(d['map'])==len(d['qs'])
    assert all(v['strict'] for v in d['map'].values())
