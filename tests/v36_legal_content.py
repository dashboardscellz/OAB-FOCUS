import json, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
PATCH=ROOT/'data'/'v36-content-governance.js'


def runtime_integral():
    js=r'''
const fs=require('fs'),vm=require('vm');
const root=process.argv[2];
const ctx={window:{},globalThis:{},console};ctx.globalThis=ctx.window;vm.createContext(ctx);
for(const f of ['data/integral-material.js','data/v35-content-coverage.js','data/v36-content-governance.js']){
  vm.runInContext(fs.readFileSync(root+'/'+f,'utf8'),ctx,{timeout:30000});
}
console.log(JSON.stringify({disciplines:ctx.window.OAB_INTEGRAL.disciplines,meta:ctx.window.OAB_V36_CONTENT_GOVERNANCE}));
'''
    out=subprocess.check_output(['node','-',str(ROOT)],input=js,text=True,timeout=60)
    return json.loads(out)


def test_v36_content_governance_patch_exists():
    assert PATCH.exists()


def test_civil_insurance_uses_lei_15040_and_not_revoked_cc_block():
    rt=runtime_integral()['disciplines']
    legal='\n'.join(s.get('text','') for s in rt['Civil'] if s.get('kind') in ('Lei seca e súmulas','Legislação completa','Legislação de referência'))
    # Recorta entre SEGURO e FIANÇA para testar o bloco que o aluno realmente vê.
    start=legal.upper().find('SEGURO')
    end=legal.upper().find('FIANÇA',start+1)
    assert start>=0 and end>start
    insurance=legal[start:end]
    assert 'Lei 15.040/2024' in insurance or 'Lei nº 15.040/2024' in insurance
    for art in ['757','760','766','772','776','782','785','786','798']:
        assert f'Art. {art} CC' not in insurance
    assert 'revogados' in insurance.lower() and '757 a 802' in insurance
    assert '11/12/2025' in insurance


def test_empresarial_five_core_chapters_are_deep_enough():
    rt=runtime_integral()['disciplines']
    titles=['Direito Societário','Direito Falimentar e Recuperacional','Títulos de Crédito','Teoria Geral do Direito Empresarial','Contratos Empresariais']
    for title in titles:
        sec=next(s for s in rt['Empresarial'] if s.get('kind')=='Teoria completa' and s.get('title')==title)
        words=len(sec.get('text','').split())
        assert words>=800,(title,words)
        assert 'OAB Focus v36' in sec.get('source','')


def test_v36_governance_metadata_has_official_sources_and_review_date():
    meta=runtime_integral()['meta']
    assert meta['VERSION']=='36.0'
    assert meta['reviewedAt']=='2026-09-08'
    assert meta['civilInsurance']['law']=='Lei 15.040/2024'
    assert meta['civilInsurance']['status']=='revisado-fonte-oficial'
    assert len(meta['empresarial']['chapters'])==5
    assert all(x['status']=='revisado-fonte-oficial' for x in meta['empresarial']['chapters'])
