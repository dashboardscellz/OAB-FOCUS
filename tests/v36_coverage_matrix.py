import json, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
MATRIX=ROOT/'MATRIZ_COBERTURA_v36.md'
WEIGHTS={'Ética':8,'Filosofia':2,'Constitucional':6,'Direitos Humanos':2,'Eleitoral':2,'Internacional':2,'Financeiro':2,'Tributário':5,'Administrativo':5,'Ambiental':2,'Civil':6,'ECA':2,'Consumidor':2,'Empresarial':4,'Processo Civil':6,'Penal':6,'Processo Penal':6,'Previdenciário':2,'Trabalho':5,'Processo do Trabalho':5}
FLOORS={8:8000,6:8000,5:4500,4:4000,2:600}

def snapshot():
    js=r'''
const fs=require('fs'),vm=require('vm'),root=process.argv[2];const ctx={window:{},globalThis:{},console};ctx.globalThis=ctx.window;vm.createContext(ctx);
for(const f of ['integral-material.js','v35-content-coverage.js','v36-content-governance.js'])vm.runInContext(fs.readFileSync(root+'/data/'+f,'utf8'),ctx);
const out={};for(const [d,secs] of Object.entries(ctx.window.OAB_INTEGRAL.disciplines||{})){let theory=0,law=0;for(const s of secs){const n=String(s.text||'').trim().split(/\s+/).filter(Boolean).length;if(s.kind==='Teoria completa')theory+=n;else if(s.kind==='Lei seca e súmulas')law+=n;}out[d]={theory,law};}console.log(JSON.stringify(out));
'''
    return json.loads(subprocess.check_output(['node','-',str(ROOT)],input=js,text=True,timeout=60))

def test_all_20_disciplines_exist_and_theory_floor_scales_with_exam_weight():
    d=snapshot(); assert set(WEIGHTS)<=set(d)
    for name,w in WEIGHTS.items():
        assert d[name]['theory']>=FLOORS[w],(name,w,d[name]['theory'],FLOORS[w])

def test_high_and_medium_weight_disciplines_are_not_materially_shallower_than_low_weight_baseline():
    d=snapshot(); low=[d[n]['theory'] for n,w in WEIGHTS.items() if w==2]
    low_median=sorted(low)[len(low)//2]
    for name,w in WEIGHTS.items():
        if w>=4: assert d[name]['theory']>=low_median*1.8,(name,d[name]['theory'],low_median)

def test_coverage_matrix_document_exists_and_lists_all_disciplines():
    assert MATRIX.exists()
    s=MATRIX.read_text(encoding='utf-8')
    for name,w in WEIGHTS.items(): assert name in s and f'| {w} |' in s
