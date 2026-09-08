# OAB Focus v35 Account Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate cross-account state leakage and username collisions while preserving all legacy accounts and progress.

**Architecture:** Add a focused `data/v35-auth.js` layer loaded after v34 that owns canonical username identity, collision-resistant technical emails, token-scoped registration writes, runtime reset, and progress ownership guards. Keep the existing Firebase REST integration and remote data paths intact; compatibility is provided by deterministic v35 login first and validated legacy fallback second.

**Tech Stack:** Static HTML/CSS/JavaScript, Firebase Identity Toolkit REST, Firebase Realtime Database REST, Web Crypto API, pytest-based source/behavior regression tests.

**Spec:** `docs/superpowers/specs/2026-09-07-v35-professional-shell-account-isolation-design.md`

## Global Constraints

- Preserve material jurídico integral, 2.416+ questions, v34 trail, progress, Firebase, ranking, admin, review, timer, highlights, 47ª OAB and legacy login.
- New registrations use identity version 35 only.
- Legacy login may succeed only when canonical typed username equals canonical `profile.username`.
- `users/{uid}/progress` remains the remote progress path.
- Theme remains device-global and is not cleared by account runtime reset.
- Maps mental must remain absent.
- v31 must not be reintroduced.

---

### Task 1: Canonical username identity and v35 technical email

**Files:**
- Create: `data/v35-auth.js`
- Test: `tests/v35_account_isolation.py`
- Modify: `index.html` script tail

**Interfaces:**
- Produces: `canonicalUsernameKey(username: string): string`, `technicalEmailV35(username: string): Promise<string>`, `legacyTechnicalEmail(username: string): string`
- Consumes: existing `slug()`, `firebaseConfig`, `technicalPassword()`

- [ ] **Step 1: Write failing tests for canonicalization and collision resistance**

```python
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUTH = ROOT / "data" / "v35-auth.js"
INDEX = ROOT / "index.html"


def test_v35_auth_is_loaded_after_v34():
    html = INDEX.read_text(encoding="utf-8")
    assert 'src="data/v35-auth.js"' in html
    assert html.index('src="data/v35-auth.js"') > html.index('src="data/v34-patch.js"')


def test_canonical_username_preserves_significant_punctuation():
    js = AUTH.read_text(encoding="utf-8")
    assert "canonicalUsernameKey" in js
    assert "normalize('NFD')" in js or 'normalize("NFD")' in js
    assert "[._-]" in js


def test_v35_email_uses_sha256_and_not_slug_as_identity():
    js = AUTH.read_text(encoding="utf-8")
    assert "crypto.subtle.digest('SHA-256'" in js or 'crypto.subtle.digest("SHA-256"' in js
    assert "@oabfocus.app" in js
    assert "technicalEmailV35" in js
```

- [ ] **Step 2: Run tests and verify RED**

Run: `pytest -q tests/v35_account_isolation.py`
Expected: FAIL because `data/v35-auth.js` does not exist and script is not loaded.

- [ ] **Step 3: Implement canonical identity helpers**

Create `data/v35-auth.js` with:

```javascript
(function(){
  function canonicalUsernameKey(username=''){
    return String(username)
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .toLowerCase()
      .replace(/\s+/g,' ');
  }
  function assertNewUsername(username=''){
    const raw=String(username).trim();
    if(!raw) throw new Error('Informe um nome de usuário.');
    if(/\s/.test(raw)) throw new Error('O nome de usuário não pode conter espaços.');
    if(!/^[\p{L}\p{N}._-]+$/u.test(raw)) throw new Error('Use apenas letras, números, ponto, hífen ou sublinhado.');
    return raw;
  }
  function legacyTechnicalEmail(username=''){
    return `${slug(username)||'aluno'}@oabfocus.app`;
  }
  async function sha256Hex(value){
    const bytes=new TextEncoder().encode(value);
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  async function technicalEmailV35(username=''){
    const key=canonicalUsernameKey(username);
    if(!key) throw new Error('Nome de usuário inválido.');
    return `${await sha256Hex(`oabfocus:v35:${key}`)}@oabfocus.app`;
  }
  window.OAB_V35_AUTH={canonicalUsernameKey,assertNewUsername,legacyTechnicalEmail,technicalEmailV35};
})();
```

Load it after `data/v34-patch.js` in `index.html`.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `pytest -q tests/v35_account_isolation.py`
Expected: PASS for Task 1 tests.

- [ ] **Step 5: Commit**

```bash
git add data/v35-auth.js index.html tests/v35_account_isolation.py
git commit -m "feat(v35): add collision-resistant account identity"
```

---

### Task 2: Token-scoped database writes for registration

**Files:**
- Modify: `data/v35-auth.js`
- Test: `tests/v35_account_isolation.py`

**Interfaces:**
- Produces: `dbRequestWithToken(path: string, idToken: string, options?: {method?: string, body?: any}): Promise<any>`
- Consumes: `firebaseConfig.databaseURL`, `timedFetch()`

- [ ] **Step 1: Add failing tests**

```python
def test_registration_has_token_scoped_db_writer():
    js = AUTH.read_text(encoding="utf-8")
    assert "dbRequestWithToken" in js
    assert "auth=${encodeURIComponent(idToken)}" in js


def test_registration_does_not_call_keep_session():
    js = AUTH.read_text(encoding="utf-8")
    start = js.index("async function submitRegistrationV35")
    end = js.index("async function signInUserV35")
    block = js[start:end]
    assert "keepSession(" not in block
```

- [ ] **Step 2: Run tests and verify RED**

Run: `pytest -q tests/v35_account_isolation.py -k 'token_scoped or keep_session'`
Expected: FAIL because token-scoped registration is not implemented.

- [ ] **Step 3: Implement `dbRequestWithToken()` and token-only registration flow**

Add:

```javascript
async function dbRequestWithToken(path,idToken,{method='GET',body}={}){
  const url=`${firebaseConfig.databaseURL}/${path}.json?auth=${encodeURIComponent(idToken)}`;
  const opts={method,headers:{'Content-Type':'application/json'}};
  if(body!==undefined) opts.body=JSON.stringify(body);
  const res=await timedFetch(url,opts);
  const data=await res.json().catch(()=>null);
  if(!res.ok){const e=new Error(data?.error||`Erro ${res.status}`);e.status=res.status;throw e;}
  return data;
}
```

Implement `submitRegistrationV35(e)` so it:
1. calls `assertNewUsername()`;
2. computes `technicalEmailV35(username)`;
3. calls `authRequest('signUp', ...)`;
4. writes `users/${created.localId}/profile` with `created.idToken` and `{identityVersion:35, usernameKey:canonicalUsernameKey(username)}`;
5. on profile-write failure, calls `authRequest('delete',{idToken:created.idToken})` and rethrows;
6. never calls `keepSession()` and never mutates current `authSession`, `user`, `profile`, `progress`, `progressOwnerUid`.

- [ ] **Step 4: Verify GREEN**

Run: `pytest -q tests/v35_account_isolation.py -k 'registration'`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/v35-auth.js tests/v35_account_isolation.py
git commit -m "fix(v35): isolate registration from active session"
```

---

### Task 3: Validated v35 login with safe legacy fallback

**Files:**
- Modify: `data/v35-auth.js`
- Test: `tests/v35_account_isolation.py`

**Interfaces:**
- Produces: `signInUserV35(username,password)`, `validateAuthenticatedProfile(d,typedUsername)`
- Consumes: `authRequest()`, `dbRequestWithToken()`, `technicalPassword()`, `legacyTechnicalPassword()`

- [ ] **Step 1: Add failing tests**

```python
def test_login_attempts_v35_before_legacy():
    js = AUTH.read_text(encoding="utf-8")
    block = js[js.index("async function signInUserV35"):js.index("async function completeLoginV35")]
    assert block.index("technicalEmailV35") < block.index("legacyTechnicalEmail")


def test_profile_username_must_match_typed_username():
    js = AUTH.read_text(encoding="utf-8")
    assert "validateAuthenticatedProfile" in js
    assert "canonicalUsernameKey(profileData.username)" in js
    assert "canonicalUsernameKey(typedUsername)" in js
    assert "USERNAME_PROFILE_MISMATCH" in js
```

- [ ] **Step 2: Run RED**

Run: `pytest -q tests/v35_account_isolation.py -k 'login or profile_username'`
Expected: FAIL.

- [ ] **Step 3: Implement login and validation**

`signInUserV35()` must:
1. build `[v35Email + technicalPassword, legacyEmail + technicalPassword, legacyEmail + legacyTechnicalPassword]` attempts;
2. dedupe identical `(email,password)` pairs;
3. authenticate each attempt until success;
4. fetch `users/${localId}/profile` using returned `idToken` before calling `keepSession()`;
5. compare canonical profile username and typed username;
6. if mismatch, reject with code `USERNAME_PROFILE_MISMATCH` and do not load progress;
7. if a legacy profile matches, persist `usernameKey` and `identityVersion:35` only after successful validation.

- [ ] **Step 4: Verify GREEN**

Run: `pytest -q tests/v35_account_isolation.py -k 'login or profile_username'`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/v35-auth.js tests/v35_account_isolation.py
git commit -m "fix(v35): validate account identity before loading progress"
```

---

### Task 4: Central runtime reset and progress ownership guard

**Files:**
- Modify: `data/v35-auth.js`
- Test: `tests/v35_account_isolation.py`

**Interfaces:**
- Produces: `resetAccountRuntimeState({preserveTheme?: boolean, clearIdentity?: boolean})`, global `progressOwnerUid`
- Consumes: current globals `studyTicker`, `saveTicker`, `qTimerStarted`, `currentStudy`, `currentQuestionId`, `qQueue`, `qIndex`, `selectedAnswer`, `routePayload`, `mobileSideOpen`, `readerScrollHandler`, leaderboard stream functions.

- [ ] **Step 1: Add failing tests**

```python
def test_runtime_reset_clears_account_scoped_state():
    js = AUTH.read_text(encoding="utf-8")
    for token in ["currentStudy=null", "currentQuestionId=null", "qQueue=[]", "qIndex=0", "selectedAnswer=null", "routePayload=null", "readerScrollHandler=null"]:
        assert token in js.replace(" ", "")


def test_progress_save_requires_owner_uid():
    js = AUTH.read_text(encoding="utf-8")
    assert "progressOwnerUid" in js
    assert "user.uid!==progressOwnerUid" in js.replace(" ", "")
    assert "PROGRESS_OWNER_MISMATCH" in js
```

- [ ] **Step 2: Run RED**

Run: `pytest -q tests/v35_account_isolation.py -k 'runtime_reset or owner_uid'`
Expected: FAIL.

- [ ] **Step 3: Implement reset and guarded save**

Add `let progressOwnerUid=null;` to the main runtime state in `index.html` and implement reset in `v35-auth.js`:

```javascript
function resetAccountRuntimeState({preserveTheme=true,clearIdentity=true}={}){
  try{stopStudySession?.();}catch{}
  try{stopQuestionTimer?.();}catch{}
  clearInterval(studyTicker); studyTicker=null;
  clearInterval(saveTicker); saveTicker=null;
  if(readerScrollHandler){window.removeEventListener('scroll',readerScrollHandler);readerScrollHandler=null;}
  try{stopV11LeaderboardStream?.();}catch{}
  currentStudy=null;currentQuestionId=null;qQueue=[];qIndex=0;selectedAnswer=null;routePayload=null;mobileSideOpen=false;dirty=false;
  if(clearIdentity){user=null;profile=null;progress=null;progressOwnerUid=null;}
}
```

Override `saveProgress()` so it aborts before any remote PUT when `!progressOwnerUid || !user || user.uid!==progressOwnerUid`, logs `PROGRESS_OWNER_MISMATCH`, and preserves `dirty=true` rather than writing under the wrong UID.

- [ ] **Step 4: Verify GREEN**

Run: `pytest -q tests/v35_account_isolation.py -k 'runtime_reset or owner_uid'`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add data/v35-auth.js index.html tests/v35_account_isolation.py
git commit -m "fix(v35): guard runtime and progress by account uid"
```

---

### Task 5: Wire complete login, restore session and logout through isolation layer

**Files:**
- Modify: `data/v35-auth.js`
- Test: `tests/v35_account_isolation.py`

**Interfaces:**
- Produces: overrides for `completeLogin`, `signInUser`, `restoreSession`, `logout`, `saveProgress`
- Consumes: `showLogin()`, `showApp()`, `mergeProgress()`, `startSaveLoop()`, `startV11LeaderboardStream()`

- [ ] **Step 1: Add failing tests**

```python
def test_account_transitions_use_runtime_reset():
    js = AUTH.read_text(encoding="utf-8")
    for fn in ["completeLoginV35", "restoreSessionV35", "logoutV35"]:
        block = js[js.index(f"async function {fn}"):] if fn != "logoutV35" else js[js.index("function logoutV35"):]
        assert "resetAccountRuntimeState" in block[:2500]


def test_progress_owner_is_set_only_after_progress_load():
    js = AUTH.read_text(encoding="utf-8")
    assert "progressOwnerUid=user.uid" in js.replace(" ", "")
```

- [ ] **Step 2: Run RED**

Run: `pytest -q tests/v35_account_isolation.py -k 'account_transitions or progress_owner'`
Expected: FAIL.

- [ ] **Step 3: Implement transition overrides**

Rules:
- `completeLoginV35()` resets prior runtime before assigning a different UID; validates profile first; then calls `keepSession`, loads progress, assigns `progressOwnerUid=user.uid`, then starts save/ranking loops.
- `restoreSessionV35()` validates stored session UID/profile pair before loading progress; invalid/expired/mismatched restore removes `SESSION_KEY`, resets runtime, and shows login.
- `logoutV35()` stops runtime, removes session storage, resets identity, then shows login.
- Export diagnostics through `window.OAB_V35_AUTH.runtimeSnapshot()` returning only non-sensitive flags/UID ownership values for tests.

- [ ] **Step 4: Run account suite**

Run: `pytest -q tests/v35_account_isolation.py`
Expected: all account tests PASS.

- [ ] **Step 5: Commit**

```bash
git add data/v35-auth.js tests/v35_account_isolation.py
git commit -m "fix(v35): make login logout and restore account-safe"
```

---

### Task 6: Browser-level regression scenario for two accounts in one mobile tab

**Files:**
- Create: `tests/v35_account_browser.py`
- Modify: `QA_ENGENHARIA_v35.md`

**Interfaces:**
- Consumes: `window.OAB_V35_AUTH.runtimeSnapshot()`
- Produces: repeatable browser QA for session isolation.

- [ ] **Step 1: Add browser test skeleton that fails until diagnostics exist**

```python
def test_v35_exposes_account_runtime_diagnostics():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    assert "runtimeSnapshot" in (ROOT / "data" / "v35-auth.js").read_text(encoding="utf-8")
```

- [ ] **Step 2: Run RED/GREEN as applicable**

Run: `pytest -q tests/v35_account_browser.py`
Expected after Task 5: PASS.

- [ ] **Step 3: Execute manual/browser-real matrix**

Validate at 390×844 and 430×932:
1. log in as Account A;
2. open a question, select an answer, start reader timer;
3. logout;
4. log in as Account B;
5. confirm no selected answer, queue, reader route, study timer or profile from A remains;
6. create Account C while A is logged in and confirm A remains active until explicit logout;
7. attempt a legacy collision username and confirm mismatched `profile.username` is rejected.

Record evidence in `QA_ENGENHARIA_v35.md` without storing passwords or tokens.

- [ ] **Step 4: Run full suite**

Run: `pytest -q tests/*.py`
Expected: all prior v26–v34 tests and all v35 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/v35_account_browser.py QA_ENGENHARIA_v35.md
git commit -m "test(v35): cover mobile account isolation regression"
```
