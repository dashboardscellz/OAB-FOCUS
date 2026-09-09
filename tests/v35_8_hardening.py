from pathlib import Path
import json, subprocess, re
ROOT=Path(__file__).resolve().parents[1];INDEX=ROOT/'index.html';STATE=ROOT/'data'/'v35-state.js';AUTH=ROOT/'data'/'v35-auth.js';QUALITY=ROOT/'data'/'v35-question-quality.js';CSS=ROOT/'data'/'v35-shell.css';RULES=ROOT/'database.rules.json'
def test_state_service_and_context_migration():
    h=INDEX.read_text(encoding='utf-8');assert STATE.exists();assert 'src="data/v35-state.js?v=36.0"' in h;assert h.index('data/v35-state.js?v=36.0')<h.index('data/v15-patch.js?v=36.0')
    src=STATE.read_text(encoding='utf-8');
    for x in ['getQuestionFilters','setQuestionFilters','patchQuestionFilters','openQuestionContext','snapshot']: assert x in src
    for n in ['v15-patch.js','v16-patch.js','v18-patch.js','v20-patch.js','v27-patch.js']: assert 'OAB_STATE.openQuestionContext' in (ROOT/'data'/n).read_text(encoding='utf-8')
    assert 'window.qFilters' not in (ROOT/'data'/'v27-patch.js').read_text(encoding='utf-8')
def test_final_runtime_queue_rejects_invalid_answer_keys():
    s=(ROOT/'data'/'v15-patch.js').read_text(encoding='utf-8');b=s[s.index('buildQueue=function(){'):s.index('const v15RenderQuestionsBase',s.index('buildQueue=function(){'))];assert 'hasValidAnswerKey(q)' in b
def test_sync_status_contract():
    a=AUTH.read_text(encoding='utf-8');c=CSS.read_text(encoding='utf-8');assert 'syncSnapshot' in a and 'data-sync-status' in a and '.v35-sync-status' in c
    for x in ['saving','saved','retrying']: assert x in a
def test_all_data_scripts_v358():
    h=INDEX.read_text(encoding='utf-8');tags=re.findall(r'<script[^>]*src="(data/[^"]+\.js(?:\?[^\"]*)?)"[^>]*>',h);assert len(tags)>=25;assert all('?v=36.0' in t for t in tags),[t for t in tags if '?v=36.0' not in t]
def test_firebase_validation():
    d=json.loads(RULES.read_text(encoding='utf-8'));assert d['rules']['.read'] is False and d['rules']['.write'] is False;p=d['rules']['users']['$uid']['profile']
    for f in ['name','username','role','active','approvalStatus']: assert '.validate' in p[f]
def test_comment_trust_classifier_and_labels():
    path=str(QUALITY).replace('\\','\\\\');js=f'''const Q=require("{path}");console.log(JSON.stringify([Q.commentTrust({{comment:'x',research:{{whyCorrect:'x',basis:'Lei',alternatives:{{A:'a',B:'b',C:'c',D:'d'}}}},qualityReviewVersion:'35.7'}}),Q.commentTrust({{comment:'Gabarito A. Regra-chave para revisão: teste'}}),Q.commentTrust({{authorial:true,researchVersion:'v35.7-authorial',research:{{whyCorrect:'x',basis:'Lei',alternatives:{{A:'a',B:'b',C:'c',D:'d'}}}}}})]));''';r=subprocess.run(['node','-'],cwd=ROOT,text=True,input=js,capture_output=True);assert r.returncode==0,r.stderr;vals=json.loads(r.stdout);assert vals==['reviewed','legacy','generated-reviewed']
    h=INDEX.read_text(encoding='utf-8');assert 'Comentário revisado' in h and 'Comentário legado' in h and 'comment-trust-badge' in h
def test_release_docs_present():
    assert (ROOT/'AUDITORIA_TECNICA_HUMANA_v35_7_2026-09-08.md').exists();assert (ROOT/'docs/superpowers/plans/2026-09-08-v35-8-hardening.md').exists()
