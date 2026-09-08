from pathlib import Path
import pytest
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]; AUTH=ROOT/'data'/'v35-auth.js'
STUBS=r'''var firebaseConfig={databaseURL:'https://example.invalid',apiKey:'x'};var authSession=null,user=null,profile=null,progress=null,progressOwnerUid=null,currentStudy={discipline:'A'},studyTicker=null,saveTicker=null,qTimerStarted=null,currentQuestionId='q1',qQueue=['q1'],qIndex=1,selectedAnswer=2,routePayload={x:1},mobileSideOpen=true,dirty=true,readerScrollHandler=null;var v11AdminTimer=null;const SESSION_KEY='x';function slug(v=''){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}function technicalPassword(p){return 'OF@'+p+'!26'}function legacyTechnicalPassword(p){return 'OABF::'+p}function storageGet(){return null}function storageSet(){}function storageRemove(){}function showLogin(){}function showApp(){}function bindRoleUI(){}function updateLevelUI(){}function setRoute(){}function startSaveLoop(){}function prepareSearchCache(){}function mergeProgress(p){return p||{}}function stopV11LeaderboardStream(){}function stopAccountGuard(){}function keepSession(d,u){authSession={uid:d.localId,idToken:d.idToken,refreshToken:d.refreshToken,email:d.email,username:u,expiresAt:Date.now()+100000}}function publishV11Leaderboard(){}function startV11LeaderboardStream(){}function startAccountGuard(){}function updateV11Presence(){}function loadUsers(){}function toast(){}function closeModal(){}async function timedFetch(){throw new Error('network disabled')}async function authRequest(){throw new Error('not used')}function $(sel){return document.querySelector(sel)}'''
@pytest.fixture(scope='module')
def browser():
    with sync_playwright() as p:
        b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);yield b;b.close()

def page_for(browser):
    page=browser.new_page();page.set_content('<html><body><div id="app"></div></body></html>');page.add_script_tag(content=STUBS);page.add_script_tag(path=str(AUTH));page.wait_for_timeout(30);return page

def test_v35_exposes_account_runtime_diagnostics(): assert 'runtimeSnapshot' in AUTH.read_text(encoding='utf-8')

def test_v35_hash_identity_distinguishes_significant_punctuation(browser):
    page=page_for(browser)
    try:
        vals=page.evaluate("async()=>({a:await OAB_V35_AUTH.technicalEmailV35('manasses.lucas'),b:await OAB_V35_AUTH.technicalEmailV35('manasses-lucas'),c:OAB_V35_AUTH.canonicalUsernameKey('Manassés'),d:OAB_V35_AUTH.canonicalUsernameKey('manasses')})")
        assert vals['a']!=vals['b'];assert vals['c']==vals['d']=='manasses'
    finally: page.close()

def test_v35_runtime_reset_clears_previous_account_ui_state(browser):
    page=page_for(browser)
    try:
        snap=page.evaluate("()=>{OAB_V35_AUTH.resetAccountRuntimeState({clearIdentity:false});return OAB_V35_AUTH.runtimeSnapshot()}")
        assert snap['currentQuestionId'] is None and snap['queueLength']==0 and snap['selectedAnswer'] is None and snap['progressOwnerUid'] is None
    finally: page.close()
