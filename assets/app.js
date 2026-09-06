import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, updatePassword
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  getDatabase, ref, get, set, update, onValue
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDAsp2f1WAF2dSEDLe2lFxXoJBZvJVeho8',
  authDomain: 'oab-focus.firebaseapp.com',
  databaseURL: 'https://oab-focus-default-rtdb.firebaseio.com',
  projectId: 'oab-focus',
  storageBucket: 'oab-focus.firebasestorage.app',
  messagingSenderId: '437044006634',
  appId: '1:437044006634:web:fd8e567d5df92d94bc5193',
  measurementId: 'G-HTN2Y43LCJ'
};

const MATERIAL = window.OAB_MATERIAL;
const QUESTIONS = window.OAB_QUESTIONS || [];
const AUDIT = window.OAB_AUDIT || {};

if (!MATERIAL || !Array.isArray(QUESTIONS)) {
  fatal('Os arquivos de conteúdo não foram carregados. Confirme as pastas data/ no GitHub.');
  throw new Error('Conteúdo ausente');
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const content = $('#content');
const boot = $('#boot');
const loginView = $('#loginView');
const appView = $('#app');
const loginError = $('#loginError');
const routeTitle = $('#routeTitle');
const routeKicker = $('#routeKicker');

let user = null;
let profile = null;
let progress = null;
let route = 'home';
let routePayload = null;
let currentStudy = null;
let studyTicker = null;
let saveTicker = null;
let dirty = false;
let lastInteraction = Date.now();
let qTimerStarted = null;
let currentQuestionId = null;
let qFilters = {discipline:'', topic:'', exam:'', status:'all', source:'', search:''};
let qQueue = [];
let qIndex = 0;
let selectedAnswer = null;
let mobileSideOpen = false;
let usersUnsub = null;


const LEVEL_NAMES = ['Calouro','Aspirante','Focado','Estrategista','Tribuno','Jurista','Guardião da OAB','Mestre de Prova','Elite OAB','Lenda da Revisão'];

function badgesForDisciplines(){
  const commonIcons=['⚖','📘','📚','🧠','🛡','🏛','📜','✍','🎓','🔎','📖','⚙','🧩','🧾','🗂','🧭','🧮','🧱','🔬','🌐'];
  const rareIcons=['👑','🏆','💠','💎','🌟','🥇','🪙','🛡️','🏛️','⚔️','📜','🎖️'];
  return MATERIAL.disciplines.flatMap((d,idx)=>[
    {
      id:`disc-${slug(d.name)}-common`, rarity:'common', icon:commonIcons[idx%commonIcons.length],
      name:`Base sólida em ${d.name}`,
      desc:`Alcance 70% em ${d.name} com pelo menos 15 questões.`,
      test:()=>subjectScore(d.name).n>=15 && subjectScore(d.name).raw>=70
    },
    {
      id:`disc-${slug(d.name)}-rare`, rarity:'rare', icon:rareIcons[idx%rareIcons.length],
      name:`Excelência em ${d.name}`,
      desc:`Alcance 85% em ${d.name} com pelo menos 35 questões.`,
      test:()=>subjectScore(d.name).n>=35 && subjectScore(d.name).raw>=85
    }
  ]);
}

const GENERAL_BADGES = [
  {id:'start',rarity:'common',icon:'🚀',name:'Primeiro passo',desc:'Inicie sua jornada no OAB Focus.',test:s=>s.studySec+s.questionSec>=60},
  {id:'reading10',rarity:'common',icon:'📖',name:'Leitura ativa',desc:'Estude 10 minutos ativos.',test:s=>s.studySec>=600},
  {id:'reading30',rarity:'common',icon:'🕒',name:'Trinta minutos',desc:'Estude 30 minutos ativos.',test:s=>s.studySec>=1800},
  {id:'study1h',rarity:'common',icon:'⏱',name:'Primeira hora',desc:'Estude 1 hora ativa.',test:s=>s.studySec>=3600},
  {id:'study5h',rarity:'common',icon:'📚',name:'Mão na massa',desc:'Estude 5 horas ativas.',test:s=>s.studySec>=18000},
  {id:'study10h',rarity:'common',icon:'🗂',name:'Maratonista',desc:'Estude 10 horas ativas.',test:s=>s.studySec>=36000},
  {id:'study20h',rarity:'common',icon:'🏕',name:'Constância em construção',desc:'Estude 20 horas ativas.',test:s=>s.studySec>=72000},
  {id:'q1',rarity:'common',icon:'✏',name:'Primeira questão',desc:'Responda sua primeira questão.',test:s=>s.answered>=1},
  {id:'q10',rarity:'common',icon:'🎯',name:'Primeiras 10',desc:'Responda 10 questões.',test:s=>s.answered>=10},
  {id:'q25',rarity:'common',icon:'📌',name:'Ritmo de treino',desc:'Responda 25 questões.',test:s=>s.answered>=25},
  {id:'q50',rarity:'common',icon:'🧩',name:'Meio século',desc:'Responda 50 questões.',test:s=>s.answered>=50},
  {id:'q100',rarity:'common',icon:'🏹',name:'Centurião',desc:'Responda 100 questões.',test:s=>s.answered>=100},
  {id:'q250',rarity:'common',icon:'📦',name:'Volume de treino',desc:'Responda 250 questões.',test:s=>s.answered>=250},
  {id:'q500',rarity:'common',icon:'🔥',name:'Máquina de questões',desc:'Responda 500 questões.',test:s=>s.answered>=500},
  {id:'accuracy70',rarity:'common',icon:'✅',name:'Bom aproveitamento',desc:'Acerte 70% com pelo menos 20 questões.',test:s=>s.answered>=20 && s.accuracy>=70},
  {id:'accuracy80',rarity:'common',icon:'🎯',name:'Mira 80%',desc:'Acerte 80% com pelo menos 30 questões.',test:s=>s.answered>=30 && s.accuracy>=80},
  {id:'accuracy85',rarity:'common',icon:'📈',name:'Ajuste fino',desc:'Acerte 85% com pelo menos 50 questões.',test:s=>s.answered>=50 && s.accuracy>=85},
  {id:'fav1',rarity:'common',icon:'⭐',name:'Questão guardada',desc:'Favorite a primeira questão.',test:()=>Object.keys(progress.favorites||{}).length>=1},
  {id:'fav10',rarity:'common',icon:'🌟',name:'Coleção de revisão',desc:'Favorite 10 questões.',test:()=>Object.keys(progress.favorites||{}).length>=10},
  {id:'note1',rarity:'common',icon:'📝',name:'Primeira anotação',desc:'Salve uma anotação.',test:()=>Object.keys(progress.notes||{}).length>=1},
  {id:'note10',rarity:'common',icon:'🗒',name:'Caderno pessoal',desc:'Salve 10 anotações.',test:()=>Object.keys(progress.notes||{}).length>=10},
  {id:'recovery1',rarity:'common',icon:'↻',name:'Virada de jogo',desc:'Recupere um erro anterior.',test:s=>s.recovered>=1},
  {id:'recovery10',rarity:'common',icon:'🔁',name:'Recuperação em série',desc:'Recupere 10 erros.',test:s=>s.recovered>=10},
  {id:'streak3',rarity:'common',icon:'🔥',name:'Constância',desc:'Estude 3 dias seguidos.',test:s=>s.streak>=3},
  {id:'streak7',rarity:'common',icon:'💎',name:'Semana perfeita',desc:'Estude 7 dias seguidos.',test:s=>s.streak>=7},
  {id:'threeDisc',rarity:'common',icon:'🧭',name:'Visão ampla',desc:'Alcance amostra mínima em 3 disciplinas.',test:()=>MATERIAL.disciplines.filter(d=>subjectScore(d.name).n>=10).length>=3},
  {id:'fiveDisc',rarity:'common',icon:'🗺',name:'Mapa em construção',desc:'Alcance amostra mínima em 5 disciplinas.',test:()=>MATERIAL.disciplines.filter(d=>subjectScore(d.name).n>=10).length>=5},

  {id:'q1000',rarity:'rare',icon:'👑',name:'Mil questões',desc:'Responda 1.000 questões.',test:s=>s.answered>=1000},
  {id:'q2000',rarity:'rare',icon:'⚡',name:'Duas mil questões',desc:'Responda 2.000 questões.',test:s=>s.answered>=2000},
  {id:'q3000',rarity:'rare',icon:'🌠',name:'Três mil questões',desc:'Responda 3.000 questões.',test:s=>s.answered>=3000},
  {id:'study40h',rarity:'rare',icon:'🏛',name:'Rotina de elite',desc:'Estude 40 horas ativas.',test:s=>s.studySec>=144000},
  {id:'study80h',rarity:'rare',icon:'🕰',name:'Carga pesada',desc:'Estude 80 horas ativas.',test:s=>s.studySec>=288000},
  {id:'streak14',rarity:'rare',icon:'🥇',name:'Duas semanas firmes',desc:'Estude 14 dias seguidos.',test:s=>s.streak>=14},
  {id:'streak30',rarity:'rare',icon:'🏆',name:'Mês de aço',desc:'Estude 30 dias seguidos.',test:s=>s.streak>=30},
  {id:'accuracy90',rarity:'rare',icon:'💠',name:'Precisão de prova',desc:'Acerte 90% com pelo menos 80 questões.',test:s=>s.answered>=80 && s.accuracy>=90},
  {id:'note25',rarity:'rare',icon:'📓',name:'Doutrina pessoal',desc:'Salve 25 anotações.',test:()=>Object.keys(progress.notes||{}).length>=25},
  {id:'fav25',rarity:'rare',icon:'💫',name:'Banco pessoal',desc:'Favorite 25 questões.',test:()=>Object.keys(progress.favorites||{}).length>=25},
  {id:'recovery25',rarity:'rare',icon:'🛠',name:'Engenheiro da revisão',desc:'Recupere 25 erros.',test:s=>s.recovered>=25},
  {id:'recovery50',rarity:'rare',icon:'🧿',name:'Imune à recaída',desc:'Recupere 50 erros.',test:s=>s.recovered>=50},
  {id:'allRounder',rarity:'rare',icon:'🧠',name:'Desempenho equilibrado',desc:'Tenha 70% em 5 disciplinas com amostra mínima.',test:()=>MATERIAL.disciplines.filter(d=>subjectScore(d.name).n>=10 && subjectScore(d.name).raw>=70).length>=5},
  {id:'lawMaster',rarity:'rare',icon:'📜',name:'Mestre da revisão',desc:'Estude 15 temas diferentes.',test:()=>Object.values(progress.topics||{}).filter(v=>(v?.studySec||0)>=300).length>=15},
  {id:'speed',rarity:'rare',icon:'🚄',name:'Ritmo eficiente',desc:'Média de até 90s por questão em 50 respostas.',test:s=>s.answered>=50 && s.questionSec && (s.questionSec/s.answered)<=90},
  {id:'depth',rarity:'rare',icon:'🪙',name:'Leitura profunda',desc:'Passe 30 minutos em um único assunto.',test:()=>Object.values(progress.topics||{}).some(v=>(v?.studySec||0)>=1800)},
  {id:'simReadiness',rarity:'rare',icon:'🎓',name:'Pronto para simulado',desc:'Responda 300 questões e estude 10 horas.',test:s=>s.answered>=300 && s.studySec>=36000},
  {id:'auditAware',rarity:'rare',icon:'🛡️',name:'Banco limpo',desc:'Responda 50 questões do banco auditado.',test:s=>s.answered>=50}
];

const BADGES = [...GENERAL_BADGES, ...badgesForDisciplines()];

function defaultProgress(){
  return {
    answers:{}, favorites:{}, notes:{}, topics:{},
    studySec:0, questionSec:0, byDiscipline:{}, byTopic:{}, days:{},
    xp:0, studyXpRemainder:0, recovered:0, currentStudy:null,
    createdAt:Date.now(), updatedAt:Date.now()
  };
}

function mergeProgress(raw){
  const base=defaultProgress();
  const p={...base,...(raw||{})};
  for(const k of ['answers','favorites','notes','topics','byDiscipline','byTopic','days']) p[k]=p[k]||{};
  return p;
}

function slug(v=''){
  return v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
function technicalEmail(username){return `${slug(username)||'aluno'}@oabfocus.app`;}
function technicalPassword(password){return `OF@${password}!26`;}
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function formatTime(sec=0){
  sec=Math.max(0,Math.floor(sec)); const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
  if(h) return `${h}h ${String(m).padStart(2,'0')}min`;
  if(m) return `${m}min ${String(s).padStart(2,'0')}s`;
  return `${s}s`;
}
function todayKey(offset=0){const d=new Date();d.setDate(d.getDate()+offset);return d.toISOString().slice(0,10);}
function pct(a,b){return b?Math.round(a/b*100):0;}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function sample(arr,n){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,n);}
function debounce(fn,wait=180){let t;return(...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),wait);};}
function escapeRegExp(str=''){return str.replace(/[.*+?^${}()|[\]\]/g,'\\$&');}
function findDiscipline(name){return MATERIAL.disciplines.find(d=>d.name===name||d.id===name);}
function allTopics(){return MATERIAL.disciplines.flatMap(d=>d.topics.map(t=>({...t,discipline:d.name,disciplineId:d.id})));}
function findTopic(disc,titleOrId){const d=findDiscipline(disc);return d?.topics.find(t=>t.id===titleOrId||t.title===titleOrId);}
function questionById(id){return QUESTIONS.find(q=>q.id===id);}
function touch(){lastInteraction=Date.now();}
['pointerdown','keydown','touchstart','scroll'].forEach(evt=>document.addEventListener(evt,touch,{passive:true}));

function fatal(msg){
  if(boot) boot.classList.add('hidden');
  $('#fatal')?.classList.remove('hidden');
  if($('#fatalMessage')) $('#fatalMessage').textContent=msg;
}
function toast(msg,type=''){const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=msg;$('#toastRoot').append(el);setTimeout(()=>el.remove(),3200);}
function showLogin(){boot.classList.add('hidden');appView.classList.add('hidden');loginView.classList.remove('hidden');}
function showApp(){boot.classList.add('hidden');loginView.classList.add('hidden');appView.classList.remove('hidden');}

async function bootstrapAdmin(username,password){
  if(slug(username)!=='manasses'||password!=='12345') throw new Error('Usuário ou senha inválidos.');
  const cred=await createUserWithEmailAndPassword(auth,technicalEmail(username),technicalPassword(password));
  await set(ref(db,`users/${cred.user.uid}/profile`),{
    name:'Manassés',username:'Manassés',role:'admin',active:true,createdAt:Date.now()
  });
  return cred.user;
}

$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault(); loginError.classList.add('hidden');
  const username=$('#loginUsername').value.trim(), password=$('#loginPassword').value;
  const btn=$('#loginBtn'); btn.disabled=true; btn.textContent='Entrando…';
  try{
    try{await signInWithEmailAndPassword(auth,technicalEmail(username),technicalPassword(password));}
    catch(err){
      if(slug(username)==='manasses' && password==='12345' && ['auth/invalid-credential','auth/user-not-found'].includes(err.code)) await bootstrapAdmin(username,password);
      else throw err;
    }
  }catch(err){
    loginError.textContent=err.code==='auth/too-many-requests'?'Muitas tentativas. Aguarde e tente novamente.':'Usuário ou senha inválidos.';
    loginError.classList.remove('hidden');
  }finally{btn.disabled=false;btn.textContent='Entrar';}
});
$('#togglePassword').addEventListener('click',()=>{const i=$('#loginPassword');i.type=i.type==='password'?'text':'password';});
$('#logoutBtn').addEventListener('click',()=>signOut(auth));
$('#avatarBtn').addEventListener('click',()=>setRoute('profile'));
$('#globalSearchBtn').addEventListener('click',openGlobalSearch);
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();openGlobalSearch();}});

onAuthStateChanged(auth,async u=>{
  stopStudySession(); stopQuestionTimer();
  if(!u){user=null;profile=null;progress=null;showLogin();return;}
  try{
    const snap=await get(ref(db,`users/${u.uid}/profile`));
    let prof=snap.val();
    if(!prof && u.email==='manasses@oabfocus.app'){
      prof={name:'Manassés',username:'Manassés',role:'admin',active:true,createdAt:Date.now()};
      await set(ref(db,`users/${u.uid}/profile`),prof);
    }
    if(!prof){await signOut(auth); throw new Error('Cadastro não encontrado. Peça ao administrador para criar seu acesso.');}
    if(prof.active===false){await signOut(auth); throw new Error('Seu acesso está desativado.');}
    const ps=await get(ref(db,`users/${u.uid}/progress`));
    user=u; profile=prof; progress=mergeProgress(ps.val());
    showApp(); bindRoleUI(); updateLevelUI(); setRoute('home'); startSaveLoop();
  }catch(err){showLogin();loginError.textContent=err.message;loginError.classList.remove('hidden');}
});

function bindRoleUI(){
  $('#adminNav').classList.toggle('hidden',profile?.role!=='admin');
  const initial=(profile?.name||profile?.username||'A').trim()[0]?.toUpperCase()||'A';
  $('#avatarBtn').textContent=initial;
}

function markDirty(){dirty=true;progress.updatedAt=Date.now();}
async function saveProgress(force=false){
  if(!user||!progress||(!dirty&&!force))return;
  dirty=false;
  try{await set(ref(db,`users/${user.uid}/progress`),progress);}catch(e){dirty=true;console.warn('Falha ao salvar progresso',e);}
}
function startSaveLoop(){clearInterval(saveTicker);saveTicker=setInterval(()=>saveProgress(),12000);}
window.addEventListener('pagehide',()=>{if(user&&progress)saveProgress(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveProgress();});

function levelInfo(){
  const xp=progress?.xp||0; const level=Math.max(1,Math.floor(Math.sqrt(xp/160))+1);
  const prev=Math.pow(level-1,2)*160, next=Math.pow(level,2)*160;
  return {level,name:LEVEL_NAMES[Math.min(level-1,LEVEL_NAMES.length-1)]||`Nível ${level}`,xp,prev,next,pct:clamp(Math.round((xp-prev)/(next-prev)*100),0,100)};
}
function addXp(n){if(!progress)return;progress.xp=(progress.xp||0)+n;markDirty();updateLevelUI();}
function updateLevelUI(){if(!progress)return;const L=levelInfo();
  $('#sideLevelLabel').textContent=`LV ${L.level}`;$('#sideLevelName').textContent=L.name;$('#sideXpBar').style.width=`${L.pct}%`;$('#sideXpText').textContent=`${L.xp-L.prev} / ${L.next-L.prev} XP`;
  $('#headerLevel').textContent=`LV ${L.level}`;$('#headerXpBar').style.width=`${L.pct}%`;
}
function stats(){
  const a=Object.values(progress?.answers||{});const answered=a.length, correct=a.filter(x=>x.correct).length;
  return {answered,correct,wrong:answered-correct,accuracy:pct(correct,answered),studySec:progress?.studySec||0,questionSec:progress?.questionSec||0,streak:calcStreak(),recovered:progress?.recovered||0};
}
function calcStreak(){let n=0;for(let i=0;i<365;i++){const k=todayKey(-i);if((progress?.days?.[k]?.studySec||0)+(progress?.days?.[k]?.questionSec||0)>0)n++;else if(i===0)continue;else break;}return n;}
function subjectScore(discipline){
  const relevant=QUESTIONS.filter(q=>q.discipline===discipline && progress?.answers?.[q.id]);
  const c=relevant.filter(q=>progress.answers[q.id].correct).length,n=relevant.length,raw=pct(c,n);
  const adjusted=Math.round(((c+6*.65)/(n+6))*100);
  return {n,c,raw,adjusted,confidence:n>=10};
}
function topicScore(discipline,topic){
  const relevant=QUESTIONS.filter(q=>q.discipline===discipline&&q.topic===topic&&progress?.answers?.[q.id]);
  const c=relevant.filter(q=>progress.answers[q.id].correct).length,n=relevant.length;
  return {n,c,raw:pct(c,n),adjusted:Math.round(((c+4*.65)/(n+4))*100)};
}
function badges(){const s=stats();return BADGES.map(b=>({...b,unlocked:!!b.test(s)}));}

function setRoute(r,payload=null){
  if(route==='reader'&&r!=='reader')stopStudySession();
  if(route==='questions'&&r!=='questions')stopQuestionTimer();
  route=r;routePayload=payload;
  const titles={home:['OAB FOCUS','Início'],study:['SUPER MATERIAL','Estudar'],reader:['MODO ESTUDO','Estudar'],questions:['BANCO AUDITADO','Questões'],review:['REVISÃO INTELIGENTE','Revisar'],performance:['SEU MAPA','Desempenho'],profile:['SUA EVOLUÇÃO','Perfil'],admin:['GESTÃO','Administração']};
  const [k,t]=titles[r]||['OAB FOCUS',''];routeKicker.textContent=k;routeTitle.textContent=t;
  $$('.nav-item[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===r));
  $$('.bottom-nav [data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===r));
  renderRoute(); window.scrollTo({top:0,behavior:'instant'});
}
$$('[data-route]').forEach(btn=>btn.addEventListener('click',()=>setRoute(btn.dataset.route)));

function renderRoute(){
  if(!progress)return;
  if(route==='home')renderHome();
  else if(route==='study')renderStudy(routePayload);
  else if(route==='reader')renderReader(routePayload);
  else if(route==='questions')renderQuestions(routePayload);
  else if(route==='review')renderReview();
  else if(route==='performance')renderPerformance();
  else if(route==='profile')renderProfile();
  else if(route==='admin')renderAdmin();
}

function recommendedTopic(){
  const topics=allTopics();let best=null;
  for(const t of topics){
    const s=topicScore(t.discipline,t.title);const frequency=t.frequency||5;
    const weakness=s.n?100-s.adjusted:30;const importance=Math.min(100,frequency*2);
    const last=progress.topics?.[t.id]?.lastAt||0;const days=last?Math.min(30,(Date.now()-last)/86400000):30;
    const score=importance*.48+weakness*.42+days*.33;
    if(!best||score>best.score)best={...t,score,perf:s};
  }
  return best;
}
function currentOrRecommended(){
  const c=progress.currentStudy;
  if(c){const d=findDiscipline(c.discipline);const t=findTopic(c.discipline,c.topicId);if(d&&t)return {discipline:d.name,...t};}
  return recommendedTopic();
}

function renderHome(){
  const s=stats(),L=levelInfo(),next=currentOrRecommended(),today=progress.days?.[todayKey()]||{};
  const qDone=today.questions||0, studyM=Math.floor((today.studySec||0)/60), errorsRecovered=today.recovered||0;
  const missionPct=Math.round((Math.min(studyM/30,1)+Math.min(qDone/20,1)+Math.min(errorsRecovered/3,1))/3*100);
  const weak=recommendedTopic();
  content.innerHTML=`
    <section class="hero-grid">
      <article class="hero-card">
        <span class="eyebrow">OLÁ, ${esc((profile.name||profile.username).split(' ')[0].toUpperCase())}</span>
        <h2>${next?`Continue de onde importa.`:'Comece sua preparação hoje.'}</h2>
        <p>${next?`${esc(next.discipline)} · ${esc(next.title)}. O OAB Focus reuniu o essencial, a lei relacionada e as questões do tema em uma única sequência.`:'Escolha uma disciplina e transforme conteúdo em revisão ativa.'}</p>
        <div class="hero-actions">
          ${next?`<button class="btn secondary" data-open-topic="${esc(next.discipline)}|${esc(next.id)}">Continuar estudando</button>`:''}
          <button class="btn ghost" style="color:#fff;border-color:#405164" data-home-action="questions">Resolver questões</button>
        </div>
      </article>
      <aside class="level-card">
        <div>
          <div class="level-ring" style="--pct:${L.pct}%"><strong>LV ${L.level}</strong></div>
          <h3>${esc(L.name)}</h3><p>${L.xp-L.prev} de ${L.next-L.prev} XP para o próximo nível.</p>
        </div>
        <div class="streak-row"><div><b>${s.streak}</b><span> dias de sequência</span></div><span>${formatTime(s.studySec)} estudados</span></div>
      </aside>
    </section>
    <section class="section cards-2">
      <article class="card">
        <div class="section-title"><h3>Missão de hoje</h3><b>${missionPct}%</b></div>
        ${missionLine('30 min de estudo',studyM,30)}
        ${missionLine('20 questões',qDone,20)}
        ${missionLine('Recuperar 3 erros',errorsRecovered,3)}
      </article>
      <article class="card focus-card">
        <span class="eyebrow">SEU FOCO AGORA</span>
        <h4>${esc(weak?.discipline||'Comece a responder')}</h4>
        <p>${weak?.perf?.n?`${esc(weak.title)} · ${weak.perf.raw}% de acerto em ${weak.perf.n} questões.`:`${esc(weak?.title||'Ainda sem dados suficientes')}. Vamos construir seu diagnóstico com estudo + questões.`}</p>
        ${weak?`<div class="metric-row"><span class="metric-chip">Prioridade ${esc(weak.priority||'média')}</span><span class="metric-chip">Incidência ${weak.frequency||'—'}</span></div>`:''}
        <button class="btn ghost small" style="margin-top:14px" data-open-topic="${esc(weak?.discipline||'')}|${esc(weak?.id||'')}">Estudar este ponto</button>
      </article>
    </section>
    <section class="section">
      <div class="section-title"><h3>Visão rápida</h3><a data-home-action="performance">Ver desempenho completo</a></div>
      <div class="cards-3">
        ${quickMetric('Questões respondidas',s.answered,`${s.accuracy}% de acerto`)}
        ${quickMetric('Tempo ativo',formatTime(s.studySec+s.questionSec),`${formatTime(s.questionSec)} em questões`)}
        ${quickMetric('Caderno de erros',s.wrong,`${s.recovered} recuperados`)}
      </div>
    </section>`;
  bindHomeActions();
}
function missionLine(label,val,target){const p=clamp(Math.round(val/target*100),0,100);return `<div class="mission" style="margin:12px 0"><div class="mission-check">${val>=target?'✓':'·'}</div><div class="mission-copy"><b>${label}</b><small>${Math.min(val,target)} / ${target}</small><div class="progress-line"><i style="width:${p}%"></i></div></div></div>`;}
function quickMetric(label,value,sub){return `<article class="card"><span class="tag">${esc(label)}</span><h4 style="font-size:1.5rem;margin-top:14px">${esc(value)}</h4><p>${esc(sub)}</p></article>`;}
function bindHomeActions(){
  $$('[data-home-action]').forEach(b=>b.onclick=()=>setRoute(b.dataset.homeAction));
  $$('[data-open-topic]').forEach(b=>b.onclick=()=>{const [d,t]=b.dataset.openTopic.split('|');if(d&&t)setRoute('reader',{discipline:d,topicId:t});});
}


function renderStudy(payload){
  if(payload?.discipline){renderDiscipline(payload.discipline);return;}
  const current=progress.currentStudy && findTopic(progress.currentStudy.discipline,progress.currentStudy.topicId)
    ? {discipline:progress.currentStudy.discipline, topic:findTopic(progress.currentStudy.discipline,progress.currentStudy.topicId)}
    : null;
  const priority=priorityTopics(4);
  content.innerHTML=`<div class="page-head"><div><span class="eyebrow">SUPER MATERIAL</span><h2>Estudar com organização.</h2><p>Um só material, organizado por disciplina e assunto. Sem PDFs soltos, sem bagunça visual e com continuidade real do seu estudo.</p></div></div>
  ${current?`<section class="section"><article class="hero-card study-hero"><div class="hero-copy"><span class="eyebrow">CONTINUAR</span><h2>${esc(current.discipline)}</h2><p>${esc(current.topic.title)}</p><div class="metric-row"><span class="metric-chip">${formatTime((progress.topics?.[current.topic.id]?.studySec)||0)} estudados</span><span class="metric-chip">${QUESTIONS.filter(q=>q.discipline===current.discipline&&q.topic===current.topic.title).length} questões ligadas</span></div></div><button class="btn primary" id="continueTopic">Retomar assunto</button></article></section>`:''}
  <section class="section"><div class="study-toolbar"><div class="search-box"><input id="studySearch" autocomplete="off" placeholder="Buscar disciplina ou assunto…"></div><div class="segmented"><button class="seg active" data-study-filter="all">Todas</button><button class="seg" data-study-filter="priority">Mais cobradas</button><button class="seg" data-study-filter="started">Já iniciadas</button></div></div></section>
  ${priority.length?`<section class="section"><div class="section-title"><h3>Prioridade para você</h3><span class="muted" style="font-size:.78rem">baseado no seu desempenho e incidência</span></div><div class="cards-2">${priority.slice(0,2).map(t=>`<article class="card topic-spotlight" data-open-topic="${esc(t.discipline)}|${esc(t.id)}"><span class="tag">${esc(t.discipline)}</span><h4>${esc(t.title)}</h4><p>${t.perf.n?`${t.perf.raw}% de acerto em ${t.perf.n} questões.`:'Ainda sem amostra suficiente.'} Incidência ${t.frequency||'—'}.</p></article>`).join('')}</div></section>`:''}
  <section class="section"><div class="section-title"><h3>Disciplinas</h3><span id="studyCount" class="muted" style="font-size:.78rem"></span></div><div id="disciplineGrid" class="discipline-grid"></div></section>`;

  if(current) $('#continueTopic').onclick=()=>setRoute('reader',{discipline:current.discipline,topicId:current.topic.id});
  let mode='all';
  const input=$('#studySearch');
  const render=()=>{
    const q=slug(input.value||'');
    let ds=MATERIAL.disciplines.filter(d=>slug(d.name+' '+d.topics.map(t=>t.title+' '+(t.essential||'')).join(' ')).includes(q));
    if(mode==='priority') ds=ds.filter(d=>d.topics.some(t=>(t.frequency||0)>=8));
    if(mode==='started') ds=ds.filter(d=>d.topics.some(t=>(progress.topics?.[t.id]?.studySec||0)>0));
    $('#disciplineGrid').innerHTML=disciplineCards(ds);
    $('#studyCount').textContent=`${ds.length} disciplina${ds.length===1?'':'s'}`;
    bindDisciplineCards();
  };
  input.addEventListener('input',debounce(render,120));
  $$('[data-study-filter]').forEach(btn=>btn.onclick=()=>{$$('[data-study-filter]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');mode=btn.dataset.studyFilter;render();});
  bindHomeActions();
  render();
}
function disciplineCards(ds){return ds.map(d=>{const sc=subjectScore(d.name);const studied=d.topics.filter(t=>(progress.topics?.[t.id]?.studySec||0)>0).length;const best=[...d.topics].sort((a,b)=>(b.frequency||0)-(a.frequency||0)).slice(0,3).map(t=>t.title).join(' · ');return `<article class="discipline-card improved" data-discipline="${esc(d.name)}"><div class="disc-top"><span class="disc-initial">${esc(d.name.slice(0,2).toUpperCase())}</span><span class="disc-score">${sc.confidence?sc.raw+'%':'—'}</span></div><h3>${esc(d.name)}</h3><p>${esc(d.overview)}</p><div class="disc-hints"><span>${studied}/${d.topics.length} assuntos iniciados</span><span>${sc.n?sc.n+' questões respondidas':'sem diagnóstico ainda'}</span></div><div class="mini-progress"><i style="width:${pct(studied,d.topics.length)}%"></i></div><small class="disc-best">Mais cobrados: ${esc(best||'em organização')}</small></article>`;}).join('')||`<div class="empty"><h3>Nada encontrado.</h3><p>Tente buscar por outra disciplina ou assunto.</p></div>`;}
function bindDisciplineCards(){$$('.discipline-card').forEach(c=>c.onclick=()=>setRoute('study',{discipline:c.dataset.discipline}));}
function renderDiscipline(name){
  const d=findDiscipline(name);if(!d){setRoute('study');return;}const sc=subjectScore(d.name);const secs=progress.byDiscipline?.[d.id]||0;
  const ordered=[...d.topics].sort((a,b)=>(b.frequency||0)-(a.frequency||0));
  content.innerHTML=`<div class="breadcrumbs"><button id="backStudy">Estudar</button><span>›</span><span>${esc(d.name)}</span></div>
    <article class="discipline-hero refined"><div><span class="eyebrow">DISCIPLINA</span><h2>${esc(d.name)}</h2><p>${esc(d.overview)}</p><div class="reader-meta"><span>${d.topics.length} assuntos</span><span>${sc.n?sc.raw+'% de acerto':'diagnóstico em construção'}</span><span>${formatTime(secs)} estudados</span></div></div><div class="discipline-actions"><button class="btn primary" id="practiceDisc">Praticar questões</button><button class="btn ghost" id="focusWeak">Ver prioridade</button></div></article>
    <section class="section"><div class="study-toolbar"><div class="search-box"><input id="topicSearch" autocomplete="off" placeholder="Buscar assunto nesta disciplina…"></div><div class="metric-row"><span class="metric-chip">Do mais cobrado ao complementar</span></div></div></section>
    <section class="section"><div id="topicList" class="topic-list card-list"></div></section>`;
  $('#backStudy').onclick=()=>setRoute('study');
  $('#practiceDisc').onclick=()=>{qFilters={...qFilters,discipline:d.name,topic:'',status:'all'};setRoute('questions');};
  $('#focusWeak').onclick=()=>{const first=ordered[0];if(first)setRoute('reader',{discipline:d.name,topicId:first.id});};
  const renderTopics=()=>{
    const term=slug($('#topicSearch').value||'');
    const list=ordered.filter(t=>slug(t.title+' '+(t.essential||'')+' '+(t.fgv||'')).includes(term));
    $('#topicList').innerHTML=list.map((t,i)=>{const ts=topicScore(d.name,t.title),tp=progress.topics?.[t.id];return `<article class="topic-card" data-topic="${esc(t.id)}"><div class="topic-card-head"><span class="topic-num">${i+1}</span><div><b>${esc(t.title)}</b><small><span class="priority-dot ${esc(t.priority)}"></span>${esc(t.priority)} prioridade · ${(t.frequency||0)?t.frequency+' incidências':'tema complementar'}</small></div></div><p>${esc((t.essential||'').slice(0,180))}${(t.essential||'').length>180?'…':''}</p><div class="topic-card-foot"><span>${ts.n?ts.raw+'% em '+ts.n+' questões':tp?.studySec?formatTime(tp.studySec)+' estudados':'não iniciado'}</span><span>${QUESTIONS.filter(x=>x.discipline===d.name&&x.topic===t.title).length} questões</span></div></article>`;}).join('')||`<div class="empty"><h3>Nenhum assunto encontrado.</h3><p>Tente outra palavra-chave.</p></div>`;
    $$('.topic-card').forEach(r=>r.onclick=()=>setRoute('reader',{discipline:d.name,topicId:r.dataset.topic}));
  };
  $('#topicSearch').addEventListener('input',debounce(renderTopics,100));
  renderTopics();
}

function startStudySession(discipline,topic){

  stopStudySession();currentStudy={discipline,topic,startedAt:Date.now(),seconds:0};
  progress.currentStudy={discipline,topicId:topic.id,lastAt:Date.now()};markDirty();
  studyTicker=setInterval(()=>{
    if(!currentStudy||document.hidden||Date.now()-lastInteraction>90000)return;
    currentStudy.seconds++;progress.studySec++;progress.studyXpRemainder=(progress.studyXpRemainder||0)+1;
    const dslug=slug(discipline);progress.byDiscipline[dslug]=(progress.byDiscipline[dslug]||0)+1;progress.byTopic[topic.id]=(progress.byTopic[topic.id]||0)+1;
    progress.topics[topic.id]=progress.topics[topic.id]||{};progress.topics[topic.id].studySec=(progress.topics[topic.id].studySec||0)+1;progress.topics[topic.id].lastAt=Date.now();
    const day=progress.days[todayKey()]=progress.days[todayKey()]||{};day.studySec=(day.studySec||0)+1;
    if(progress.studyXpRemainder>=60){progress.studyXpRemainder-=60;addXp(2);}else markDirty();
    const timer=$('#studyTimer');if(timer)timer.textContent=formatTime(currentStudy.seconds);
  },1000);
}
function stopStudySession(){if(studyTicker){clearInterval(studyTicker);studyTicker=null;}currentStudy=null;if(progress)saveProgress();document.body.classList.remove('focus-mode');$('.focus-exit')?.remove();}

function renderReader(payload){
  const d=findDiscipline(payload?.discipline),t=d?.topics.find(x=>x.id===payload?.topicId);if(!d||!t){setRoute('study');return;}
  startStudySession(d.name,t);const related=QUESTIONS.filter(q=>q.discipline===d.name&&q.topic===t.title).length;const tp=progress.topics?.[t.id]||{};
  content.innerHTML=`<div class="reader-shell refined-reader">
    <div class="reader-top"><div class="reader-top-inner"><button class="btn ghost small" id="readerBack">← ${esc(d.name)}</button><div style="display:flex;gap:8px;align-items:center"><span class="reader-timer">◷ <b id="studyTimer">0s</b></span><button class="btn ghost small" id="focusBtn">Modo foco</button></div></div><div class="reader-progress"><i id="readerScroll"></i></div></div>
    <header class="reader-header pro"><span class="eyebrow">${esc(d.name.toUpperCase())}</span><h1>${esc(t.title)}</h1><p>${esc(d.overview)}</p><div class="reader-meta"><span>Prioridade ${esc(t.priority)}</span><span>${t.frequency?`${t.frequency} incidências na referência estatística`:'tema complementar'}</span><span>${related} questões relacionadas</span><span>${formatTime(tp.studySec||0)} acumulados</span></div></header>
    <section class="reader-tools"><div class="search-box"><input id="readerSearch" autocomplete="off" placeholder="Buscar dentro deste assunto…"></div><div class="material-jumps"> <button class="pill-btn" data-jump="essencial">Essencial</button><button class="pill-btn" data-jump="pontos">Pontos-chave</button><button class="pill-btn" data-jump="lei">Lei seca</button><button class="pill-btn" data-jump="fgv">Atenção FGV</button><button class="pill-btn" data-jump="rev">Revisão</button></div><div id="readerSearchCount" class="reader-search-count">Digite para localizar pontos do assunto.</div></section>
    <article id="readerArticle" class="reader-article">
      <section class="study-block searchable" data-anchor="essencial"><h2>O essencial</h2><p class="lead">${esc(t.essential)}</p></section>
      <section class="study-block searchable" data-anchor="pontos"><h2>Pontos-chave</h2><ul>${(t.keyPoints||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>
      ${(t.examples?.length?`<section class="study-block searchable"><h2>Exemplo prático</h2><div class="study-stack">${t.examples.map(x=>`<div class="note-box">${esc(x)}</div>`).join('')}</div></section>`:'')}
      ${(d.updates?.length?`<section class="study-block searchable"><h2>Atualizações que você não pode ignorar</h2>${d.updates.map(u=>`<div class="update-box"><b>${esc(u.title)}</b><span>${esc(u.text)}</span></div>`).join('')}</section>`:'')}
      <section class="study-block searchable" data-anchor="lei"><h2>Lei seca essencial</h2><div class="law-pills">${(t.lawRefs||d.lawRefs||[]).map(x=>`<span class="law-pill">${esc(x)}</span>`).join('')}</div></section>
      <section class="study-block searchable" data-anchor="fgv"><h2>Atenção FGV</h2><div class="fgv-box">${esc(t.fgv)}</div></section>
      <section class="study-block searchable" data-anchor="rev"><h2>Revisão rápida</h2><ul>${(t.review||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>
      <section class="study-block callout searchable"><h2>Transforme leitura em acerto</h2><p class="muted">Resolva agora apenas questões ligadas a este assunto. O cronômetro de questões e seu desempenho serão registrados separadamente.</p><button class="btn primary" id="topicQuestions">Resolver ${related||''} questões</button></section>
    </article>
  </div>`;
  $('#readerBack').onclick=()=>setRoute('study',{discipline:d.name});
  $('#topicQuestions').onclick=()=>{qFilters={discipline:d.name,topic:t.title,exam:'',status:'all',source:'',search:''};setRoute('questions');};
  $('#focusBtn').onclick=toggleFocus;
  const onScroll=()=>{const max=document.documentElement.scrollHeight-innerHeight;const p=max?scrollY/max*100:0;const bar=$('#readerScroll');if(bar)bar.style.width=`${p}%`;};window.addEventListener('scroll',onScroll,{passive:true,once:false});
  $$('[data-jump]').forEach(btn=>btn.onclick=()=>{document.querySelector(`[data-anchor="${btn.dataset.jump}"]`)?.scrollIntoView({behavior:'smooth',block:'start'});});
  const searchInput=$('#readerSearch');
  const blocks=$$('.searchable', $('#readerArticle'));
  const updateSearch=()=>{
    const term=slug(searchInput.value||'');
    let matches=0;
    blocks.forEach(block=>{
      const hit=!term || slug(block.textContent).includes(term);
      block.classList.toggle('hidden-by-search',!!term && !hit);
      block.classList.toggle('matched-block',!!term && hit);
      if(hit&&term) matches++;
    });
    $('#readerSearchCount').textContent=!term?'Digite para localizar pontos do assunto.':`${matches} bloco${matches===1?'':'s'} encontrado${matches===1?'':'s'} neste assunto.`;
  };
  searchInput.addEventListener('input',updateSearch);
}
function toggleFocus(){document.body.classList.toggle('focus-mode');if(document.body.classList.contains('focus-mode')){const b=document.createElement('button');b.className='btn ghost small focus-exit';b.textContent='Sair do foco';b.onclick=toggleFocus;document.body.appendChild(b);}else $('.focus-exit')?.remove();}

function buildQueue(){

  const f=qFilters;const term=slug(f.search||'');
  qQueue=QUESTIONS.filter(q=>{
    if(f.discipline&&q.discipline!==f.discipline)return false;if(f.topic&&q.topic!==f.topic)return false;if(f.exam&&q.exam!==f.exam)return false;if(f.source&&q.source!==f.source)return false;
    const a=progress.answers[q.id];if(f.status==='unanswered'&&a)return false;if(f.status==='correct'&&(!a||!a.correct))return false;if(f.status==='wrong'&&(!a||a.correct))return false;if(f.status==='favorite'&&!progress.favorites[q.id])return false;
    if(term&&!slug(q.statement+' '+q.options.join(' ')+' '+q.topic).includes(term))return false;return true;
  });qIndex=clamp(qIndex,0,Math.max(0,qQueue.length-1));
}
function stopQuestionTimer(){if(qTimerStarted&&currentQuestionId&&progress){const sec=Math.max(0,Math.round((Date.now()-qTimerStarted)/1000));progress.questionSec+=sec;const day=progress.days[todayKey()]=progress.days[todayKey()]||{};day.questionSec=(day.questionSec||0)+sec;markDirty();}qTimerStarted=null;currentQuestionId=null;}
function startQuestionTimer(id){stopQuestionTimer();currentQuestionId=id;qTimerStarted=Date.now();}
function renderQuestions(){
  buildQueue();
  const disciplines=[...new Set(QUESTIONS.map(q=>q.discipline))].sort();const exams=[...new Set(QUESTIONS.map(q=>q.exam).filter(Boolean))].sort((a,b)=>(parseInt(a)||999)-(parseInt(b)||999));
  content.innerHTML=`<div class="page-head"><div><span class="eyebrow">QUESTÕES REAIS</span><h2>Prática limpa e objetiva.</h2><p>${AUDIT.keptQuestions||QUESTIONS.length} questões ativas após deduplicação e auditoria jurídica. O foco aqui é resolver, revisar e evoluir — sem poluição visual e sem exibir fontes editoriais na interface.</p></div><button class="btn primary" id="simuladoBtn">Simulado 80</button></div>
  <div class="filter-panel"><div class="filter-grid">
    <select id="fDisc"><option value="">Todas as disciplinas</option>${disciplines.map(x=>`<option ${qFilters.discipline===x?'selected':''}>${esc(x)}</option>`).join('')}</select>
    <select id="fTopic"><option value="">Todos os assuntos</option>${topicOptions(qFilters.discipline)}</select>
    <select id="fExam"><option value="">Todas as provas</option>${exams.map(x=>`<option ${qFilters.exam===x?'selected':''}>${esc(x)}</option>`).join('')}</select>
    <select id="fStatus"><option value="all">Todas</option><option value="unanswered" ${qFilters.status==='unanswered'?'selected':''}>Não respondidas</option><option value="correct" ${qFilters.status==='correct'?'selected':''}>Acertei</option><option value="wrong" ${qFilters.status==='wrong'?'selected':''}>Errei</option><option value="favorite" ${qFilters.status==='favorite'?'selected':''}>Favoritas</option></select>
  </div><div class="toolbar" style="margin:9px 0 0"><div class="search-box"><input id="fSearch" value="${esc(qFilters.search||'')}" placeholder="Buscar no enunciado…"></div><button class="btn ghost small" id="shuffleBtn">Embaralhar</button></div><div class="filter-summary"><b id="filterCount">${qQueue.length}</b> questões encontradas</div></div>
  <div id="questionHost"></div>`;
  const syncFilters=()=>{qFilters.discipline=$('#fDisc').value;qFilters.topic=$('#fTopic').value;qFilters.exam=$('#fExam').value;qFilters.status=$('#fStatus').value;qFilters.search=$('#fSearch').value;qIndex=0;renderQuestions();};
  $('#fDisc').onchange=syncFilters;$('#fTopic').onchange=syncFilters;$('#fExam').onchange=syncFilters;$('#fStatus').onchange=syncFilters;$('#fSearch').addEventListener('input',debounce(syncFilters,160));
  $('#shuffleBtn').onclick=()=>{qQueue=sample(qQueue,qQueue.length);qIndex=0;renderQuestionHost(true);};
  $('#simuladoBtn').onclick=startSimulation;
  renderQuestionHost();
}
function topicOptions(disc){const ts=[...new Set(QUESTIONS.filter(q=>!disc||q.discipline===disc).map(q=>q.topic).filter(Boolean))].sort();return ts.map(x=>`<option ${qFilters.topic===x?'selected':''}>${esc(x)}</option>`).join('');}
function renderQuestionHost(preserveQueue=false){
  if(!preserveQueue)buildQueue();const host=$('#questionHost');if(!host)return;
  if(!qQueue.length){stopQuestionTimer();host.innerHTML=`<div class="empty"><h3>Nenhuma questão aqui.</h3><p>Altere os filtros ou abra uma disciplina para montar outro caderno.</p><button class="btn secondary" id="clearFilters">Limpar filtros</button></div>`;$('#clearFilters').onclick=()=>{qFilters={discipline:'',topic:'',exam:'',status:'all',source:'',search:''};renderQuestions();};return;}
  const q=qQueue[qIndex], ans=progress.answers[q.id], fav=!!progress.favorites[q.id];selectedAnswer=ans?.selected??null;startQuestionTimer(q.id);
  const letters=['A','B','C','D','E'];
  host.innerHTML=`<div class="question-layout"><article class="question-panel">
    <div class="question-meta"><span>${esc(q.exam||'Banco OAB')}</span><span>${esc(q.discipline)}</span><span>${esc(q.topic||'Assunto geral')}</span></div>
    <div class="question-number">QUESTÃO ${q.displayNumber||q.number||qIndex+1} · ${qIndex+1}/${qQueue.length}</div>
    <div class="question-text">${esc(q.statement)}</div>
    <div class="answers">${q.options.map((o,i)=>`<button class="answer ${selectedAnswer===i?'selected':''} ${ans?(i===q.answer?'correct':selectedAnswer===i&&!ans.correct?'wrong':''):''}" data-answer="${i}" ${ans?'disabled':''}><span class="letter">${letters[i]}</span><span>${esc(o)}</span></button>`).join('')}</div>
    <div class="question-actions"><div style="display:flex;gap:8px"><button class="btn ghost small" id="favBtn">${fav?'★ Favorita':'☆ Favoritar'}</button><button class="btn ghost small" id="noteBtn">Anotar</button></div><div style="display:flex;gap:8px"><button class="btn ghost small" id="prevQ" ${qIndex===0?'disabled':''}>←</button>${!ans?'<button class="btn primary" id="answerBtn" disabled>Responder</button>':`<button class="btn primary" id="nextQ">Próxima →</button>`}</div></div>
    ${ans?feedbackHtml(q,ans):''}
  </article><aside class="question-side">
    <div class="side-card"><h4>Sessão</h4>${sideStat('Respondidas',`${qIndex+1}/${qQueue.length}`)}${sideStat('Seu acerto geral',`${stats().accuracy}%`)}${sideStat('Tempo em questões',formatTime(progress.questionSec))}</div>
    <div class="side-card"><h4>Neste tema</h4>${sideStat('Desempenho',topicScore(q.discipline,q.topic).n?`${topicScore(q.discipline,q.topic).raw}%`:'sem dados')}${sideStat('Questões',QUESTIONS.filter(x=>x.discipline===q.discipline&&x.topic===q.topic).length)}<button class="btn ghost small" id="studyFromQ" style="margin-top:8px;width:100%">Revisar assunto</button></div>
  </aside></div>`;
  $$('.answer').forEach(b=>b.onclick=()=>{selectedAnswer=+b.dataset.answer;$$('.answer').forEach(x=>x.classList.toggle('selected',x===b));$('#answerBtn').disabled=false;});
  $('#answerBtn')?.addEventListener('click',()=>submitAnswer(q));$('#nextQ')?.addEventListener('click',()=>{qIndex=Math.min(qIndex+1,qQueue.length-1);renderQuestionHost(true);});$('#prevQ').onclick=()=>{qIndex=Math.max(0,qIndex-1);renderQuestionHost(true);};
  $('#favBtn').onclick=()=>{if(fav)delete progress.favorites[q.id];else progress.favorites[q.id]=true;markDirty();renderQuestionHost(true);};
  $('#noteBtn').onclick=()=>openNote(q);$('#studyFromQ').onclick=()=>{const d=findDiscipline(q.discipline),t=d?.topics.find(x=>x.title===q.topic);if(t)setRoute('reader',{discipline:d.name,topicId:t.id});else setRoute('study',{discipline:q.discipline});};
}
function sideStat(a,b){return `<div class="side-stat"><span>${esc(a)}</span><b>${esc(b)}</b></div>`;}
function feedbackHtml(q,a){
  return `<div class="feedback"><div class="feedback-head"><span class="feedback-status ${a.correct?'good':'bad'}">${a.correct?'✓ CORRETA':'✕ INCORRETA'}</span><b>Gabarito: ${'ABCDE'[q.answer]}</b></div>
  <div class="comment-box"><h4>Comentário OAB Focus</h4><p>${esc(q.comment||`A alternativa correta é ${'ABCDE'[q.answer]}. Revise o tema ${q.topic||q.discipline}.`)}</p></div>
  <div class="comment-box secondary"><h4>Como revisar melhor</h4><p>${a.correct?'Excelente. Avance para a próxima e, se quiser, favorite esta questão para revisão futura.':'Revise o assunto correspondente e tente refazer esta questão depois. O sistema já registrou este ponto para sua revisão inteligente.'}</p></div></div>`;
}
function submitAnswer(q){
  if(selectedAnswer===null)return;stopQuestionTimer();const old=progress.answers[q.id],correct=selectedAnswer===q.answer;const recovered=old&&!old.correct&&correct;
  progress.answers[q.id]={selected:selectedAnswer,correct,attempts:(old?.attempts||0)+1,lastAt:Date.now()};
  const day=progress.days[todayKey()]=progress.days[todayKey()]||{};if(!old)day.questions=(day.questions||0)+1;if(recovered){progress.recovered=(progress.recovered||0)+1;day.recovered=(day.recovered||0)+1;}
  if(!old)addXp(5);if(correct&&!old)addXp(5);if(recovered)addXp(12);markDirty();renderQuestionHost(true);toast(correct?'Boa. Regra consolidada.':'Erro registrado no caderno de revisão.',correct?'good':'bad');
}
function startSimulation(){qFilters={discipline:'',topic:'',exam:'',status:'unanswered',source:'',search:''};buildQueue();qQueue=sample(qQueue.length>=80?qQueue:QUESTIONS,80);qIndex=0;toast('Simulado de 80 questões iniciado.');renderQuestionHost(true);}
function openNote(q){const old=progress.notes[q.id]||'';openModal(`<div class="modal-head"><h3>Anotação · ${esc(q.discipline)}</h3><button class="icon-btn" data-close>×</button></div><textarea id="noteText" style="width:100%;min-height:180px;border:1px solid var(--line);border-radius:12px;padding:12px" placeholder="O que você não pode esquecer?">${esc(old)}</textarea><div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn primary" id="saveNote">Salvar</button></div>`);$('#saveNote').onclick=()=>{progress.notes[q.id]=$('#noteText').value;markDirty();closeModal();toast('Anotação salva.','good');};}

function renderReview(){
  const wrong=QUESTIONS.filter(q=>progress.answers[q.id]&&!progress.answers[q.id].correct),favorites=QUESTIONS.filter(q=>progress.favorites[q.id]);
  const weak=recommendedTopic();
  content.innerHTML=`<div class="page-head"><div><span class="eyebrow">REVISÃO INTELIGENTE</span><h2>Volte no que ainda custa pontos.</h2><p>Seu caderno de revisão combina erros, favoritas e assuntos de alta incidência com desempenho abaixo do ideal.</p></div></div>
  <div class="cards-3">
    <article class="card clickable" id="reviewErrors"><span class="tag">ERREI RECENTEMENTE</span><h4>${wrong.length} questões</h4><p>Refaça sem olhar o gabarito. Acertar depois de errar gera recuperação e XP.</p></article>
    <article class="card clickable" id="reviewFav"><span class="tag">FAVORITAS</span><h4>${favorites.length} questões</h4><p>Sua coleção manual para revisão rápida.</p></article>
    <article class="card clickable" id="reviewWeak"><span class="tag">PRIORIDADE</span><h4>${esc(weak?.discipline||'Sem dados')}</h4><p>${esc(weak?.title||'Responda mais questões para receber recomendação.')}</p></article>
  </div>
  <section class="section"><div class="section-title"><h3>Próximas revisões sugeridas</h3></div><div class="topic-list">${priorityTopics(8).map((x,i)=>`<article class="topic-row" data-rdisc="${esc(x.discipline)}" data-rtopic="${esc(x.id)}"><div class="topic-main"><span class="topic-num">${i+1}</span><div><b>${esc(x.discipline)} · ${esc(x.title)}</b><small>${x.perf.n?`${x.perf.raw}% de acerto em ${x.perf.n} questões`:'ainda sem amostra suficiente'} · prioridade ${esc(x.priority)}</small></div></div><span>›</span></article>`).join('')}</div></section>`;
  $('#reviewErrors').onclick=()=>{qFilters={discipline:'',topic:'',exam:'',status:'wrong',source:'',search:''};setRoute('questions');};$('#reviewFav').onclick=()=>{qFilters={discipline:'',topic:'',exam:'',status:'favorite',source:'',search:''};setRoute('questions');};if(weak)$('#reviewWeak').onclick=()=>setRoute('reader',{discipline:weak.discipline,topicId:weak.id});
  $$('[data-rdisc]').forEach(x=>x.onclick=()=>setRoute('reader',{discipline:x.dataset.rdisc,topicId:x.dataset.rtopic}));
}
function priorityTopics(n=10){return allTopics().map(t=>{const perf=topicScore(t.discipline,t.title);const weakness=perf.n?100-perf.adjusted:28;const importance=Math.min(100,(t.frequency||5)*2);const last=progress.topics?.[t.id]?.lastAt||0;const days=last?Math.min(30,(Date.now()-last)/86400000):30;return {...t,perf,score:importance*.5+weakness*.42+days*.3};}).sort((a,b)=>b.score-a.score).slice(0,n);}

function renderPerformance(){
  const s=stats();const ranks=MATERIAL.disciplines.map(d=>({name:d.name,...subjectScore(d.name)})).sort((a,b)=>b.adjusted-a.adjusted);const top=ranks.filter(x=>x.n>=10).slice(0,3),weak=[...ranks].filter(x=>x.n>=10).sort((a,b)=>a.adjusted-b.adjusted).slice(0,3);
  content.innerHTML=`<div class="page-head"><div><span class="eyebrow">SEU MAPA</span><h2>Você sabe onde ganha — e onde perde — pontos.</h2><p>O ranking exige uma amostra mínima antes de chamar uma disciplina de forte ou fraca.</p></div></div>
  <div class="stats-grid">${statCard('Questões',s.answered,`${s.correct} acertos`)}${statCard('Aproveitamento',`${s.accuracy}%`,`${s.wrong} erros`)}${statCard('Tempo de estudo',formatTime(s.studySec),`${formatTime(s.questionSec)} em questões`)}${statCard('Sequência',`${s.streak} dias`,`${s.recovered} erros recuperados`)}</div>
  <section class="section cards-2"><article class="card"><div class="section-title"><h3>Últimos 7 dias</h3></div>${weekChart()}</article><article class="card"><div class="section-title"><h3>Leitura do seu desempenho</h3></div>${performanceInsights(top,weak)}</article></section>
  <section class="section"><div class="section-title"><h3>Ranking por disciplina</h3><span class="muted" style="font-size:.75rem">ajuste por tamanho da amostra</span></div><div class="ranking">${ranks.map((x,i)=>rankRow(x,i)).join('')}</div></section>`;
}
function statCard(label,value,sub){return `<article class="stat-card"><small>${esc(label)}</small><strong>${esc(value)}</strong><em>${esc(sub)}</em></article>`;}
function weekChart(){const days=[];for(let i=6;i>=0;i--){const k=todayKey(-i),v=progress.days[k]||{},min=Math.round(((v.studySec||0)+(v.questionSec||0))/60);days.push({k,min});}const max=Math.max(1,...days.map(d=>d.min));return `<div class="chart-7">${days.map(d=>`<div class="day-bar"><small>${d.min}m</small><i style="height:${Math.max(3,d.min/max*100)}%"></i><b>${new Date(d.k+'T12:00').toLocaleDateString('pt-BR',{weekday:'short'}).slice(0,3)}</b></div>`).join('')}</div>`;}
function performanceInsights(top,weak){
  if(!top.length&&!weak.length)return `<div class="insight"><div class="insight-icon">i</div><div><h4>Ainda construindo seu diagnóstico</h4><p>Responda pelo menos 10 questões em uma disciplina para ela entrar no ranking confiável.</p></div></div>`;
  return `${top[0]?`<div class="insight"><div class="insight-icon">↑</div><div><h4>Seu ponto forte: ${esc(top[0].name)}</h4><p>${top[0].raw}% em ${top[0].n} questões. Continue revisando para não perder consistência.</p></div></div>`:''}${weak[0]?`<div class="insight" style="margin-top:10px"><div class="insight-icon">!</div><div><h4>Maior oportunidade: ${esc(weak[0].name)}</h4><p>${weak[0].raw}% em ${weak[0].n} questões. O sistema vai priorizar assuntos desta matéria.</p></div></div>`:''}`;
}
function rankRow(x,i){return `<div class="rank-row"><span class="rank-pos">${i+1}</span><div class="rank-subject"><b>${esc(x.name)}</b><small>${x.n<10?'dados insuficientes':`${x.c}/${x.n} acertos`}</small></div><div class="rank-bar"><i style="width:${x.n<10?0:x.raw}%"></i></div><span class="rank-score">${x.n<10?'—':x.raw+'%'}</span></div>`;}


function renderProfile(){
  const L=levelInfo(),s=stats(),bs=badges();
  const groups={common:bs.filter(b=>b.rarity==='common'),rare:bs.filter(b=>b.rarity==='rare')};
  const renderBadge=(b)=>`<article class="badge-card ${b.unlocked?'unlocked':'locked'} ${b.rarity}"><div class="badge-head"><div class="badge-icon">${b.unlocked?b.icon:(b.rarity==='rare'?'◈':'◇')}</div><span class="rarity-pill ${b.rarity}">${b.rarity==='rare'?'Rara':'Comum'}</span></div><h4>${esc(b.name)}</h4><p>${esc(b.desc)}</p></article>`;
  content.innerHTML=`<div class="page-head"><div><span class="eyebrow">SUA EVOLUÇÃO</span><h2>Perfil</h2></div></div>
  <article class="card profile-card"><div class="profile-avatar">${esc((profile.name||'A')[0].toUpperCase())}</div><div><h2>${esc(profile.name||profile.username)}</h2><p>@${esc(profile.username)} · ${profile.role==='admin'?'Administrador':'Aluno'} · LV ${L.level} ${esc(L.name)}</p><div class="xp-track" style="width:min(360px,65vw)"><i style="width:${L.pct}%"></i></div><small class="muted">${L.xp} XP acumulados</small></div></article>
  <section class="section cards-2"><article class="card"><div class="section-title"><h3>Insígnias comuns</h3><span class="muted" style="font-size:.75rem">${groups.common.filter(x=>x.unlocked).length}/${groups.common.length}</span></div><div class="badge-grid">${groups.common.map(renderBadge).join('')}</div></article><article class="card"><div class="section-title"><h3>Insígnias raras</h3><span class="muted" style="font-size:.75rem">${groups.rare.filter(x=>x.unlocked).length}/${groups.rare.length}</span></div><div class="badge-grid">${groups.rare.map(renderBadge).join('')}</div></article></section>
  <section class="section"><div class="audit-banner"><div class="audit-mark">✓</div><div><b>Banco jurídico auditado em 05/09/2026</b><p>Deduplicação + remoção conservadora de questões atingidas por reformas legislativas e viradas jurisprudenciais.</p></div><div class="audit-numbers"><strong>${AUDIT.keptQuestions||QUESTIONS.length} ativas</strong><small>${AUDIT.removedTotal||0} removidas</small></div></div></section>
  <section class="section cards-2"><article class="card"><h4>Alterar minha senha</h4><p>O usuário permanece o mesmo. A alteração vale para seu próximo login.</p><button class="btn ghost small" id="changePass">Alterar senha</button></article><article class="card"><h4>Auditoria jurídica</h4><p>Veja o relatório técnico da limpeza do banco de questões.</p><a class="btn ghost small" href="AUDITORIA_JURIDICA_2026.md" target="_blank" rel="noopener">Abrir relatório</a></article></section>`;
  $('#changePass').onclick=openPasswordChange;
}

function openPasswordChange(){openModal(`<div class="modal-head"><h3>Alterar senha</h3><button class="icon-btn" data-close>×</button></div><label style="display:block;font-weight:700;font-size:.82rem">Nova senha<input id="newPass" type="password" style="width:100%;height:42px;border:1px solid var(--line);border-radius:10px;padding:0 10px;margin-top:6px"></label><button class="btn primary" id="doPass" style="margin-top:14px">Salvar</button>`);$('#doPass').onclick=async()=>{const p=$('#newPass').value;if(p.length<3){toast('Use pelo menos 3 caracteres.','bad');return;}try{await updatePassword(auth.currentUser,technicalPassword(p));closeModal();toast('Senha alterada.','good');}catch(e){toast('Faça login novamente antes de alterar a senha.','bad');}};}

async function renderAdmin(){
  if(profile.role!=='admin'){setRoute('home');return;}
  content.innerHTML=`<div class="page-head"><div><span class="eyebrow">GESTÃO</span><h2>Cadastros</h2><p>O conteúdo é igual para todos. Aqui você controla apenas quem entra na plataforma.</p></div></div>
  <div class="admin-grid"><article class="card form-card"><h3 style="margin-top:0">Novo usuário</h3><label>Nome<input id="newName" placeholder="Nome do aluno"></label><label>Usuário<input id="newUser" placeholder="ex.: kelly"></label><label>Senha inicial<input id="newUserPass" type="password" placeholder="Senha"></label><button class="btn primary wide" id="createUserBtn">Criar acesso</button><small class="muted">O aluno poderá alterar a própria senha no perfil.</small></article><div><div class="section-title"><h3>Usuários cadastrados</h3><span id="userCount" class="muted"></span></div><div id="userList" class="user-list"><div class="empty">Carregando cadastros…</div></div></div></div>`;
  $('#createUserBtn').onclick=createStudent;loadUsers();
}
async function createStudent(){
  const name=$('#newName').value.trim(),username=$('#newUser').value.trim(),pass=$('#newUserPass').value;if(!name||!username||pass.length<3){toast('Preencha nome, usuário e uma senha com 3+ caracteres.','bad');return;}
  const btn=$('#createUserBtn');btn.disabled=true;btn.textContent='Criando…';
  try{
    const second=initializeApp(firebaseConfig,`creator-${Date.now()}`);const secondAuth=getAuth(second);const cred=await createUserWithEmailAndPassword(secondAuth,technicalEmail(username),technicalPassword(pass));await signOut(secondAuth);
    await set(ref(db,`users/${cred.user.uid}/profile`),{name,username,role:'student',active:true,createdAt:Date.now(),createdBy:user.uid});
    toast('Usuário criado.','good');$('#newName').value=$('#newUser').value=$('#newUserPass').value='';loadUsers();
  }catch(e){toast(e.code==='auth/email-already-in-use'?'Esse usuário já existe.':`Não foi possível criar: ${e.code||e.message}`,'bad');}finally{btn.disabled=false;btn.textContent='Criar acesso';}
}
async function loadUsers(){
  const snap=await get(ref(db,'users'));const data=snap.val()||{};const rows=Object.entries(data).map(([uid,v])=>({uid,...(v.profile||{}) })).sort((a,b)=>(a.role==='admin'?-1:1)-(b.role==='admin'?-1:1));
  $('#userCount').textContent=`${rows.length} cadastro${rows.length===1?'':'s'}`;$('#userList').innerHTML=rows.map(u=>`<div class="user-row"><div><b>${esc(u.name||u.username||'Sem nome')}</b><small>@${esc(u.username||'—')} · ${u.role==='admin'?'ADM':'Aluno'}</small></div><span class="status-pill ${u.active===false?'off':'on'}">${u.active===false?'Desativado':'Ativo'}</span><button class="btn ${u.active===false?'good':'danger'} small" data-toggle-user="${u.uid}" data-active="${u.active===false?'0':'1'}" ${u.uid===user.uid?'disabled':''}>${u.active===false?'Ativar':'Desativar'}</button></div>`).join('');
  $$('[data-toggle-user]').forEach(b=>b.onclick=async()=>{const uid=b.dataset.toggleUser,newActive=b.dataset.active!=='1';await update(ref(db,`users/${uid}/profile`),{active:newActive});toast(newActive?'Acesso ativado.':'Acesso desativado.','good');loadUsers();});
}

function openGlobalSearch(){
  openModal(`<div class="modal-head"><div><span class="eyebrow">BUSCA GLOBAL</span><h3>Encontre o ponto exato</h3></div><button class="icon-btn" data-close>×</button></div><div class="search-box"><input id="globalSearchInput" autofocus placeholder="Ex.: prisão preventiva, usucapião, honorários…"></div><div id="globalSearchResults" class="search-results" style="margin-top:12px"></div>`);
  const input=$('#globalSearchInput');setTimeout(()=>input.focus(),20);input.oninput=()=>renderGlobalResults(input.value);renderGlobalResults('');
}
function renderGlobalResults(term){const host=$('#globalSearchResults'),q=slug(term);if(q.length<2){host.innerHTML='<div class="empty"><p>Digite pelo menos 2 caracteres.</p></div>';return;}const ts=allTopics().filter(t=>slug(t.discipline+' '+t.title+' '+t.essential).includes(q)).slice(0,8);const qq=QUESTIONS.filter(x=>slug(x.statement+' '+x.topic+' '+x.discipline).includes(q)).slice(0,6);host.innerHTML=`${ts.map(t=>`<div class="search-result" data-search-topic="${esc(t.discipline)}|${esc(t.id)}"><small>MATERIAL · ${esc(t.discipline)}</small><b>${esc(t.title)}</b><span>${esc(t.essential.slice(0,120))}…</span></div>`).join('')}${qq.map(x=>`<div class="search-result" data-search-q="${esc(x.id)}"><small>QUESTÃO · ${esc(x.discipline)}</small><b>${esc(x.topic||x.exam)}</b><span>${esc(x.statement.slice(0,120))}…</span></div>`).join('')||(!ts.length?'<div class="empty"><p>Nenhum resultado.</p></div>':'')}`;$$('[data-search-topic]').forEach(x=>x.onclick=()=>{const[d,t]=x.dataset.searchTopic.split('|');closeModal();setRoute('reader',{discipline:d,topicId:t});});$$('[data-search-q]').forEach(x=>x.onclick=()=>{closeModal();const q=questionById(x.dataset.searchQ);qFilters={discipline:q.discipline,topic:q.topic,exam:'',status:'all',source:'',search:q.statement.slice(0,55)};setRoute('questions');});}
function openModal(html){$('#modalRoot').innerHTML=`<div class="modal-backdrop"><div class="modal">${html}</div></div>`;$$('[data-close]').forEach(b=>b.onclick=closeModal);$('.modal-backdrop').onclick=e=>{if(e.target.classList.contains('modal-backdrop'))closeModal();};}
function closeModal(){$('#modalRoot').innerHTML='';}

// Atualiza o diagnóstico se o perfil for desativado enquanto a sessão está aberta.
onValue(ref(db,'users'),snap=>{
  if(!user||profile?.role!=='admin')return;
  if(route==='admin'&&$('#userList')) loadUsers();
},()=>{});

window.addEventListener('error',e=>console.error(e.error||e.message));
window.addEventListener('unhandledrejection',e=>console.error(e.reason));

// Segurança visual básica contra acidentes de cópia não é usada aqui: o conteúdo foi deliberadamente tornado comum a todos os usuários cadastrados.
