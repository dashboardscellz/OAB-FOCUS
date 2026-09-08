from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
AUTH=ROOT/'data'/'v35-auth.js'
INDEX=ROOT/'index.html'

def js(): return AUTH.read_text(encoding='utf-8')

def test_v35_auth_loaded_after_v34():
    html=INDEX.read_text(encoding='utf-8')
    assert 'src="data/v35-auth.js?v=35.4"' in html
    assert html.index('src="data/v35-auth.js?v=35.4"') > html.index('src="data/v34-patch.js"')

def test_canonical_identity_and_hash_email():
    s=js()
    assert 'canonicalUsernameKey' in s
    assert "normalize('NFD')" in s or 'normalize("NFD")' in s
    assert '[._-]' in s
    assert 'crypto.subtle.digest' in s and 'SHA-256' in s
    assert 'technicalEmailV35' in s and '@oabfocus.app' in s

def test_registration_is_token_scoped_and_never_keeps_created_session():
    s=js()
    assert 'dbRequestWithToken' in s
    assert 'auth=${encodeURIComponent(idToken)}' in s
    block=s[s.index('async function submitRegistrationV35'):s.index('async function signInUserV35')]
    assert 'keepSession(' not in block
    assert "authRequest('delete'" in block or 'authRequest("delete"' in block

def test_login_v35_then_validated_legacy_fallback():
    s=js(); block=s[s.index('async function signInUserV35'):s.index('async function completeLoginV35')]
    assert block.index('technicalEmailV35') < block.index('legacyTechnicalEmail')
    assert 'validateAuthenticatedProfile' in s
    assert 'canonicalUsernameKey(profileData.username)' in s
    assert 'canonicalUsernameKey(typedUsername)' in s
    assert 'USERNAME_PROFILE_MISMATCH' in s

def test_runtime_reset_clears_account_scoped_state():
    compact=js().replace(' ','').replace('\n','')
    for token in ['currentStudy=null','currentQuestionId=null','qQueue=[]','qIndex=0','selectedAnswer=null','routePayload=null','readerScrollHandler=null']:
        assert token in compact
    assert 'stopV11LeaderboardStream' in js()

def test_progress_save_is_uid_owned():
    compact=js().replace(' ','').replace('\n','')
    assert 'progressOwnerUid' in js()
    assert 'user.uid!==progressOwnerUid' in compact
    assert 'PROGRESS_OWNER_MISMATCH' in js()

def test_account_transitions_reset_and_set_owner_after_load():
    s=js()
    for name in ['completeLoginV35','restoreSessionV35','logoutV35']:
        assert name in s
    assert s.count('resetAccountRuntimeState') >= 4
    assert 'progressOwnerUid=user.uid' in s.replace(' ','').replace('\n','')
    assert 'runtimeSnapshot' in s

def test_registration_hook_replaces_legacy_handler():
    s=js()
    assert 'installRegistrationV35' in s
    assert "onsubmit=submitRegistrationV35" in s.replace(' ','') or 'submitRegistrationV35' in s
