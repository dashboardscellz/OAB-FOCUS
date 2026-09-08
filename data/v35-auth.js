/* OAB Focus v35 — account isolation and collision-resistant identity */
(function(){
  'use strict';
  // significant punctuation preserved: [._-]
  function canonicalUsernameKey(username=''){
    return String(username).trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
  }
  function assertNewUsername(username=''){
    const raw=String(username).trim();
    if(!raw) throw new Error('Informe um nome de usuário.');
    if(raw.length<3) throw new Error('Use um nome de usuário com pelo menos 3 caracteres.');
    if(/\s/.test(raw)) throw new Error('O nome de usuário não pode conter espaços.');
    if(!/^[\p{L}\p{N}._-]+$/u.test(raw)) throw new Error('Use apenas letras, números, ponto, hífen ou sublinhado.');
    return raw;
  }
  function legacyTechnicalEmail(username=''){return `${slug(username)||'aluno'}@oabfocus.app`;}
  function sha256Fallback(ascii=''){
    function rightRotate(value,amount){return (value>>>amount)|(value<<(32-amount));}
    const maxWord=Math.pow(2,32),words=[],asciiBitLength=ascii.length*8;let hash=sha256Fallback.h=sha256Fallback.h||[],k=sha256Fallback.k=sha256Fallback.k||[],primeCounter=k.length,isComposite={};
    for(let candidate=2;primeCounter<64;candidate++){if(!isComposite[candidate]){for(let i=0;i<313;i+=candidate)isComposite[i]=candidate;hash[primeCounter]=(Math.pow(candidate,.5)*maxWord)|0;k[primeCounter++]=(Math.pow(candidate,1/3)*maxWord)|0;}}
    ascii+='\x80';while(ascii.length%64-56)ascii+='\x00';for(let i=0;i<ascii.length;i++){const j=ascii.charCodeAt(i);if(j>>8)return sha256Fallback(unescape(encodeURIComponent(ascii)));words[i>>2]|=j<<((3-i)%4)*8;}
    words[words.length]=(asciiBitLength/maxWord)|0;words[words.length]=asciiBitLength;for(let j=0;j<words.length;){const w=words.slice(j,j+=16),oldHash=hash.slice(0);hash=hash.slice(0,8);for(let i=0;i<64;i++){const w15=w[i-15],w2=w[i-2],a=hash[0],e=hash[4],temp1=hash[7]+(rightRotate(e,6)^rightRotate(e,11)^rightRotate(e,25))+((e&hash[5])^((~e)&hash[6]))+k[i]+(w[i]=(i<16)?w[i]:(w[i-16]+(rightRotate(w15,7)^rightRotate(w15,18)^(w15>>>3))+w[i-7]+(rightRotate(w2,17)^rightRotate(w2,19)^(w2>>>10)))|0),temp2=(rightRotate(a,2)^rightRotate(a,13)^rightRotate(a,22))+((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));hash=[(temp1+temp2)|0].concat(hash);hash[4]=(hash[4]+temp1)|0;}for(let i=0;i<8;i++)hash[i]=(hash[i]+oldHash[i])|0;}
    let result='';for(let i=0;i<8;i++)for(let j=3;j+1;j--){const b=(hash[i]>>(j*8))&255;result+=(b<16?'0':'')+b.toString(16);}return result;
  }
  async function sha256Hex(value){
    if(globalThis.crypto?.subtle?.digest){const bytes=new TextEncoder().encode(value);const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');}
    return sha256Fallback(String(value));
  }
  async function technicalEmailV35(username=''){
    const key=canonicalUsernameKey(username);if(!key)throw new Error('Nome de usuário inválido.');
    return `${await sha256Hex(`oabfocus:v35:${key}`)}@oabfocus.app`;
  }
  async function dbRequestWithToken(path,idToken,{method='GET',body}={}){
    const url=`${firebaseConfig.databaseURL}/${path}.json?auth=${encodeURIComponent(idToken)}`;
    const opts={method,headers:{'Content-Type':'application/json'}};if(body!==undefined)opts.body=JSON.stringify(body);
    const res=await timedFetch(url,opts);const data=await res.json().catch(()=>null);
    if(!res.ok){const e=new Error(data?.error||`Erro ${res.status}`);e.status=res.status;throw e;}return data;
  }
  function makeCodeError(code,message){const e=new Error(message||code);e.code=code;return e;}
  function validateAuthenticatedProfile(profileData,typedUsername){
    if(!profileData)throw makeCodeError('PROFILE_NOT_FOUND','Cadastro não encontrado.');
    if(canonicalUsernameKey(profileData.username)!==canonicalUsernameKey(typedUsername)){
      throw makeCodeError('USERNAME_PROFILE_MISMATCH','Este usuário não corresponde à conta autenticada.');
    }
    return profileData;
  }
  async function submitRegistrationV35(e){
    e?.preventDefault?.();const name=$('#regName')?.value.trim()||'',rawUser=$('#regUser')?.value.trim()||'',pass=$('#regPass')?.value||'',pass2=$('#regPass2')?.value||'';const err=$('#registerError'),btn=$('#registerSubmit');
    err?.classList.add('hidden');let username;
    try{username=assertNewUsername(rawUser);}catch(ex){if(err){err.textContent=ex.message;err.classList.remove('hidden');}return;}
    if(name.length<2){if(err){err.textContent='Informe seu nome completo.';err.classList.remove('hidden');}return;}
    if(pass.length<5){if(err){err.textContent='Use uma senha com pelo menos 5 caracteres.';err.classList.remove('hidden');}return;}
    if(pass!==pass2){if(err){err.textContent='As senhas não coincidem.';err.classList.remove('hidden');}return;}
    if(btn){btn.disabled=true;btn.textContent='Criando cadastro…';}let created=null;
    try{
      const email=await technicalEmailV35(username);
      created=await authRequest('signUp',{email,password:technicalPassword(pass),returnSecureToken:true});
      const prof={name,username,usernameKey:canonicalUsernameKey(username),identityVersion:35,role:'student',active:false,approvalStatus:'pending',createdAt:Date.now(),lastActiveAt:null};
      try{await dbRequestWithToken(`users/${created.localId}/profile`,created.idToken,{method:'PUT',body:prof});}
      catch(writeErr){try{await authRequest('delete',{idToken:created.idToken});}catch{}created=null;throw writeErr;}
      const modal=document.querySelector('.modal');if(modal)modal.innerHTML='<div class="register-success"><div class="success-mark">✓</div><h2>Cadastro enviado</h2><p class="muted">Seu cadastro foi criado e está aguardando aprovação. Depois da autorização, use o mesmo usuário e senha para entrar.</p><button class="btn wine" id="finishRegistration">Entendi</button></div>';
      $('#finishRegistration')?.addEventListener('click',closeModal);
    }catch(ex){
      if(created?.idToken){try{await authRequest('delete',{idToken:created.idToken});}catch{}}
      if(err){err.textContent=ex.code==='EMAIL_EXISTS'?'Esse usuário já está cadastrado. Escolha outro nome de usuário.':'Não foi possível criar o cadastro agora. Tente novamente.';err.classList.remove('hidden');}
    }finally{if(btn){btn.disabled=false;btn.textContent='Enviar cadastro';}}
  }
  async function signInUserV35(username,password){
    const typed=String(username||'').trim();if(!typed)throw makeCodeError('INVALID_USERNAME','Informe o usuário.');
    const v35Email=await technicalEmailV35(typed),legacyEmail=legacyTechnicalEmail(typed),currentPw=technicalPassword(password),legacyPw=legacyTechnicalPassword(password);
    const attempts=[[v35Email,currentPw,'v35'],[legacyEmail,currentPw,'legacy-current'],[legacyEmail,legacyPw,'legacy-old']];const seen=new Set();let firstErr=null;
    for(const [email,pw,kind] of attempts){
      const k=`${email}\u0000${pw}`;if(seen.has(k))continue;seen.add(k);
      try{
        const d=await authRequest('signInWithPassword',{email,password:pw,returnSecureToken:true});
        let prof=await dbRequestWithToken(`users/${d.localId}/profile`,d.idToken).catch(()=>null);
        if(!prof&&d.email==='manasses@oabfocus.app'&&canonicalUsernameKey(typed)==='manasses')return {...d,__profile:null,__bootstrapAdmin:true,__identityKind:kind};
        prof=validateAuthenticatedProfile(prof,typed);
        if(kind!=='v35'&&(prof.identityVersion!==35||prof.usernameKey!==canonicalUsernameKey(typed))){
          try{await dbRequestWithToken(`users/${d.localId}/profile`,d.idToken,{method:'PATCH',body:{identityVersion:35,usernameKey:canonicalUsernameKey(typed)}});prof={...prof,identityVersion:35,usernameKey:canonicalUsernameKey(typed)};}catch{}
        }
        if(kind==='legacy-old'){
          try{const migrated=await authRequest('update',{idToken:d.idToken,password:currentPw,returnSecureToken:true});Object.assign(d,migrated,{localId:migrated.localId||d.localId,email:migrated.email||d.email,refreshToken:migrated.refreshToken||d.refreshToken});}catch{}
        }
        return {...d,__profile:prof,__identityKind:kind};
      }catch(ex){
        if(ex?.code==='USERNAME_PROFILE_MISMATCH')throw ex;if(!firstErr)firstErr=ex;
      }
    }
    throw firstErr||makeCodeError('INVALID_LOGIN_CREDENTIALS','Usuário ou senha inválidos.');
  }
  async function tokenForOwner(ownerUid){
    const snap=authSession?{...authSession}:null;if(!snap||snap.uid!==ownerUid)throw makeCodeError('PROGRESS_OWNER_MISMATCH','Sessão não pertence ao progresso atual.');
    if(snap.idToken&&snap.expiresAt&&Date.now()<=snap.expiresAt)return snap.idToken;
    if(!snap.refreshToken)throw new Error('Sessão expirada');
    const body=new URLSearchParams({grant_type:'refresh_token',refresh_token:snap.refreshToken});
    const res=await timedFetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(firebaseConfig.apiKey)}`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});const d=await res.json();if(!res.ok)throw new Error('Sessão expirada');
    const next={...snap,idToken:d.id_token,refreshToken:d.refresh_token||snap.refreshToken,uid:d.user_id||ownerUid,expiresAt:Date.now()+(Number(d.expires_in||3600)-60)*1000};
    if(authSession?.uid===ownerUid){authSession=next;storageSet(SESSION_KEY,JSON.stringify(authSession));}
    return next.idToken;
  }
  function resetAccountRuntimeState({preserveTheme=true,clearIdentity=true}={}){
    try{if(studyTicker)clearInterval(studyTicker);}catch{}studyTicker=null;
    try{if(saveTicker)clearInterval(saveTicker);}catch{}saveTicker=null;
    try{if(qTimerStarted)qTimerStarted=null;}catch{}currentQuestionId=null;
    try{if(readerScrollHandler)window.removeEventListener('scroll',readerScrollHandler);}catch{}readerScrollHandler=null;
    try{stopV11LeaderboardStream?.();}catch{}try{stopAccountGuard?.();}catch{}
    try{if(typeof v11AdminTimer!=='undefined'&&v11AdminTimer)clearInterval(v11AdminTimer);}catch{}
    currentStudy=null;currentQuestionId=null;qQueue=[];qIndex=0;selectedAnswer=null;routePayload=null;mobileSideOpen=false;dirty=false;progressOwnerUid=null;
    document.body.classList.remove('focus-mode');document.querySelector('.focus-exit')?.remove();
    if(clearIdentity){authSession=null;user=null;profile=null;progress=null;}
  }
  async function saveProgressV35(force=false){
    if(!user||!progress||(!dirty&&!force))return false;
    if(!progressOwnerUid||user.uid!==progressOwnerUid||authSession?.uid!==progressOwnerUid){dirty=true;console.warn('PROGRESS_OWNER_MISMATCH');return false;}
    const owner=progressOwnerUid,payload=JSON.parse(JSON.stringify(progress)),wasDirty=dirty;dirty=false;
    try{
      const id=await tokenForOwner(owner);
      if(!user||user.uid!==owner||progressOwnerUid!==owner||authSession?.uid!==owner)throw makeCodeError('PROGRESS_OWNER_MISMATCH');
      await dbRequestWithToken(`users/${owner}/progress`,id,{method:'PUT',body:payload});
      try{await publishV11Leaderboard?.();}catch{}try{await updateV11Presence?.();}catch{}return true;
    }catch(ex){dirty=wasDirty||true;if(ex?.code==='PROGRESS_OWNER_MISMATCH')console.warn('PROGRESS_OWNER_MISMATCH');else console.warn('Falha ao salvar progresso',ex);return false;}
  }
  async function completeLoginV35(d,username,password){
    const typed=String(username||'').trim();let prof=d.__profile||null;
    if(d.__bootstrapAdmin&&!prof){prof={name:'Manassés Oliveira',username:'Manassés',usernameKey:'manasses',identityVersion:35,role:'admin',active:true,approvalStatus:'approved',createdAt:Date.now(),approvedAt:Date.now(),lastActiveAt:Date.now()};await dbRequestWithToken(`users/${d.localId}/profile`,d.idToken,{method:'PUT',body:prof});}
    prof=validateAuthenticatedProfile(prof,typed);
    if(prof.approvalStatus==='pending')throw new Error('Seu cadastro está aguardando autorização do administrador.');
    if(prof.approvalStatus==='rejected')throw new Error('Seu cadastro ainda não foi liberado. Entre em contato com o administrador.');
    if(prof.active===false)throw new Error('Seu acesso está desativado. Entre em contato com o administrador.');
    const now=Date.now();try{await dbRequestWithToken(`users/${d.localId}/profile`,d.idToken,{method:'PATCH',body:{lastActiveAt:now}});prof.lastActiveAt=now;}catch{}
    const ps=await dbRequestWithToken(`users/${d.localId}/progress`,d.idToken).catch(()=>null);
    resetAccountRuntimeState({clearIdentity:true});keepSession(d,typed);user={uid:d.localId,email:d.email};profile=prof;progress=mergeProgress(ps);progressOwnerUid=user.uid;
    showApp();bindRoleUI();updateLevelUI();setRoute('home');startSaveLoop();setTimeout(prepareSearchCache,500);try{publishV11Leaderboard?.();startV11LeaderboardStream?.();startAccountGuard?.();}catch{}
  }
  async function restoreSessionV35(){
    try{
      const raw=storageGet(SESSION_KEY);if(!raw){resetAccountRuntimeState({clearIdentity:true});showLogin();return;}
      authSession=JSON.parse(raw);const typed=String(authSession.username||'').trim();if(!typed)throw new Error('Sessão antiga sem identidade verificável.');
      const owner=authSession.uid,id=await tokenForOwner(owner);let prof=await dbRequestWithToken(`users/${owner}/profile`,id);prof=validateAuthenticatedProfile(prof,typed);
      if(prof.active===false||prof.approvalStatus==='pending'||prof.approvalStatus==='rejected')throw new Error('Acesso indisponível');
      const now=Date.now();try{await dbRequestWithToken(`users/${owner}/profile`,id,{method:'PATCH',body:{lastActiveAt:now}});prof.lastActiveAt=now;}catch{}
      const ps=await dbRequestWithToken(`users/${owner}/progress`,id).catch(()=>null);
      resetAccountRuntimeState({clearIdentity:false});user={uid:owner,email:authSession.email};profile=prof;progress=mergeProgress(ps);progressOwnerUid=user.uid;
      showApp();bindRoleUI();updateLevelUI();setRoute('home');startSaveLoop();setTimeout(prepareSearchCache,500);try{publishV11Leaderboard?.();startV11LeaderboardStream?.();startAccountGuard?.();}catch{}
    }catch(ex){storageRemove(SESSION_KEY);resetAccountRuntimeState({clearIdentity:true});showLogin();}
  }
  async function logoutV35(){
    try{await Promise.race([saveProgressV35(true),new Promise(r=>setTimeout(r,1200))]);}catch{}
    storageRemove(SESSION_KEY);resetAccountRuntimeState({clearIdentity:true});showLogin();
  }
  async function createStudentV35(){
    const name=$('#newName')?.value.trim()||'',rawUser=$('#newUser')?.value.trim()||'',pass=$('#newUserPass')?.value||'';let username;
    try{username=assertNewUsername(rawUser);}catch(ex){toast(ex.message,'bad');return;}
    if(!name||pass.length<3){toast('Preencha nome, usuário e uma senha com 3+ caracteres.','bad');return;}
    const btn=$('#createUserBtn');if(btn){btn.disabled=true;btn.textContent='Criando…';}let created=null;
    try{
      const adminUid=user?.uid;if(!adminUid||profile?.role!=='admin')throw new Error('Acesso administrativo necessário.');const adminToken=await tokenForOwner(adminUid);
      created=await authRequest('signUp',{email:await technicalEmailV35(username),password:technicalPassword(pass),returnSecureToken:true});
      const prof={name,username,usernameKey:canonicalUsernameKey(username),identityVersion:35,role:'student',active:true,approvalStatus:'approved',createdAt:Date.now(),approvedAt:Date.now(),createdBy:adminUid};
      await dbRequestWithToken(`users/${created.localId}/profile`,adminToken,{method:'PUT',body:prof});
      toast('Usuário criado.','good');if($('#newName'))$('#newName').value='';if($('#newUser'))$('#newUser').value='';if($('#newUserPass'))$('#newUserPass').value='';loadUsers();
    }catch(ex){if(created?.idToken){try{await authRequest('delete',{idToken:created.idToken});}catch{}}toast(ex.code==='EMAIL_EXISTS'?'Esse usuário já existe.':'Não foi possível criar o acesso.','bad');}
    finally{if(btn){btn.disabled=false;btn.textContent='Criar acesso';}}
  }
  function installRegistrationV35(){
    try{submitRegistration=submitRegistrationV35;}catch{}try{createStudent=createStudentV35;}catch{}
  }
  function runtimeSnapshot(){return {authenticated:!!user,uid:user?.uid||null,sessionUid:authSession?.uid||null,progressOwnerUid:progressOwnerUid||null,hasProgress:!!progress,currentStudy:currentStudy?{discipline:currentStudy.discipline||null,topicId:currentStudy.topic?.id||null}:null,currentQuestionId:currentQuestionId||null,queueLength:Array.isArray(qQueue)?qQueue.length:0,selectedAnswer:selectedAnswer??null};}

  try{signInUser=signInUserV35;completeLogin=completeLoginV35;restoreSession=restoreSessionV35;logout=logoutV35;saveProgress=saveProgressV35;installRegistrationV35();}catch(ex){console.error('Falha ao instalar isolamento de conta v35',ex);}
  const logoutBtn=document.getElementById('logoutBtn');logoutBtn?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();logoutV35();},true);
  window.OAB_V35_AUTH={canonicalUsernameKey,assertNewUsername,legacyTechnicalEmail,technicalEmailV35,dbRequestWithToken,validateAuthenticatedProfile,submitRegistrationV35,signInUserV35,completeLoginV35,restoreSessionV35,logoutV35,resetAccountRuntimeState,saveProgressV35,createStudentV35,installRegistrationV35,runtimeSnapshot};
  restoreSessionV35();
})();
