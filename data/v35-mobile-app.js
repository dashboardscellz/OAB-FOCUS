/* OAB Focus v35.13 — mobile app architecture adapter */
(function(){
  'use strict';
  const VERSION='35.13';
  const api=window.OAB_MOBILE_APP=window.OAB_MOBILE_APP||{};
  const ROUTE_LABELS={home:'Início',study:'Estudar',reader:'Estudar',prepare:'Prepare-se',questions:'Questões',review:'Revisar',performance:'Desempenho',highyield:'Mais cobrados',ranking:'Ranking',profile:'Perfil',settings:'Configurações',admin:'Admin'};
  let homeNext=null;
  let resizeTimer=0;

  const mobileQuery=()=>typeof matchMedia==='function'?matchMedia('(max-width: 768px)').matches:innerWidth<=768;
  const getRoute=()=>{try{return typeof route==='string'?route:'home';}catch{return 'home'}};
  const getContent=()=>document.getElementById('content');
  const clone=v=>{try{return JSON.parse(JSON.stringify(v));}catch{return v}};
  function call(name,...args){try{const fn=window[name]||eval(`typeof ${name}==='function'?${name}:null`);return typeof fn==='function'?fn(...args):undefined;}catch{return undefined}}
  function go(r,payload=null){
    if(r==='questions')try{window.OAB_QUESTION_NAV?.enterBank?.();}catch{}
    try{if(typeof safeRoute==='function')return safeRoute(r,payload);}catch{}
    try{if(typeof setRoute==='function')return setRoute(r,payload);}catch{}
  }
  function escHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function safeStats(){try{return typeof stats==='function'?stats():{}}catch{return {}}}
  function safeLevel(){try{return typeof levelInfo==='function'?levelInfo():{level:1,name:'Calouro',pct:0,xp:0,prev:0,next:200}}catch{return {level:1,name:'Calouro',pct:0,xp:0,prev:0,next:200}}}
  function safeProfile(){try{return profile||{}}catch{return {}}}
  function safeProgress(){try{return progress||{}}catch{return {}}}
  function safeNext(){try{return typeof currentOrRecommended==='function'?currentOrRecommended():null}catch{return null}}
  function todayData(){
    const p=safeProgress();let key='';try{key=typeof todayKey==='function'?todayKey():''}catch{}
    const day=p.days?.[key]||{};return {questions:Number(day.questions||0),studyMin:Math.floor(Number(day.studySec||0)/60),recovered:Number(day.recovered||0)};
  }
  function routeTitle(r=getRoute()){
    return ROUTE_LABELS[r]||'OAB Focus';
  }
  function syncShell(){
    const app=document.getElementById('app');if(!app)return;const r=getRoute();
    app.dataset.v3513Route=r;document.body.dataset.v3513Route=r;
    const brand=app.querySelector('.v35-mobile-brand');
    if(brand&&mobileQuery())brand.innerHTML=`<span>OAB Focus</span><small class="v3513-mobile-route-label">${escHtml(routeTitle(r))}</small>`;
    app.querySelectorAll('.bottom-nav [data-route]').forEach(b=>{
      const active=b.dataset.route===r||(r==='reader'&&b.dataset.route==='study');b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
    });
    const more=app.querySelector('.bottom-nav [data-v35-mobile-more]');
    if(more){const moreActive=['review','performance','highyield','ranking','profile','settings','admin'].includes(r);more.classList.toggle('active',moreActive);if(moreActive)more.setAttribute('aria-current','page');else more.removeAttribute('aria-current');}
  }

  function renderMobileHome(){
    if(!mobileQuery()||getRoute()!=='home')return false;
    const host=getContent();if(!host)return false;
    const s=safeStats(),L=safeLevel(),p=safeProgress(),prof=safeProfile(),day=todayData();
    const first=String(prof.name||prof.username||'Você').trim().split(/\s+/)[0];
    const next=safeNext();homeNext=next?clone(next):null;
    const plan=p.preparePlan;
    const nextLabel=next?String(next.title||next.target?.title||next.topic||next.id||'Retomar conteúdo'):'Escolher conteúdo';
    const nextDisc=next?String(next.discipline||'Seu estudo'):'Estudar';
    host.innerHTML=`<section class="v3513-mobile-home" aria-label="Início mobile">
      <header class="v3513-home-head"><div><small>OAB Focus</small><h1>${escHtml(first)}, vamos avançar?</h1></div><span class="v3513-level-pill"><b>LV ${Number(L.level||1)}</b>${escHtml(L.name||'Calouro')}</span></header>
      <button type="button" class="v3513-continue" data-mobile-continue><span><span class="kicker">${next?'Continuar de onde parou':'Começar agora'}</span><strong>${escHtml(nextLabel)}</strong><small>${escHtml(nextDisc)}${s.streak?` · ${Number(s.streak)} dias de sequência`:''}</small></span><span class="arrow" aria-hidden="true">→</span></button>
      <div class="v3513-quick-grid" aria-label="Ações principais">
        <button class="v3513-quick-action" data-mobile-go="study"><span class="icon">▤</span><b>Estudar</b><small>Disciplinas e capítulos</small></button>
        <button class="v3513-quick-action" data-mobile-go="questions"><span class="icon">?</span><b>Questões</b><small>Banco livre e filtros</small></button>
        <button class="v3513-quick-action" data-mobile-go="prepare"><span class="icon">◎</span><b>Prepare-se</b><small>Seu plano personalizado</small></button>
        <button class="v3513-quick-action" data-mobile-go="review"><span class="icon">↻</span><b>Revisar</b><small>Erros, grifos e reforço</small></button>
      </div>
      <div class="v3513-section-title"><h2>Hoje</h2><span class="muted">${Number(s.accuracy||0)}% de acerto geral</span></div>
      <section class="v3513-today" aria-label="Resumo de hoje"><article><strong>${day.studyMin} min</strong><small>estudo ativo</small></article><article><strong>${day.questions}</strong><small>questões hoje</small></article><article><strong>${day.recovered}</strong><small>erros recuperados</small></article></section>
      <article class="v3513-plan-card"><span class="plan-mark">${plan?.active?'✓':'+'}</span><div><b>${plan?.active?'Prepare-se ativo':'Monte seu Prepare-se'}</b><small>${plan?.active?escHtml(`${plan.targetExam||'Prova-alvo'} · plano personalizado`):'Receba metas diárias de teoria, prática e revisão'}</small></div><button type="button" data-mobile-go="prepare">Abrir</button></article>
      <button class="v3513-quick-action" style="min-height:72px" data-mobile-go="performance"><span class="icon">↗</span><b>Meu desempenho</b><small>${Number(s.answered||0)} questões respondidas · ${Number(s.wrong||0)} erros no histórico</small></button>
    </section>`;
    host.querySelector('[data-mobile-continue]')?.addEventListener('click',()=>{
      if(homeNext?.discipline&&homeNext?.id)go('reader',{discipline:homeNext.discipline,topicId:homeNext.id});else go('study');
    });
    host.querySelectorAll('[data-mobile-go]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.mobileGo)));
    return true;
  }

  function enhanceStudy(){
    if(!mobileQuery()||getRoute()!=='study')return;
    const host=getContent();if(!host)return;host.classList.add('v3513-study-screen');
    host.querySelectorAll('.discipline-card').forEach(card=>card.setAttribute('role','button'));
  }
  function enhancePrepare(){
    if(!mobileQuery()||getRoute()!=='prepare')return;
    getContent()?.classList.add('v3513-prepare-screen');
  }
  function questionMode(){try{return window.OAB_QUESTION_NAV?.snapshot?.().mode||'bank'}catch{return 'bank'}}
  function filterCount(panel){
    if(!panel)return 0;let n=0;
    ['#fDisc','#fTopic','#fExam'].forEach(sel=>{const e=panel.querySelector(sel);if(e?.value)n++;});
    const st=panel.querySelector('#fStatus');if(st?.value&&st.value!=='all')n++;
    return n;
  }
  function closeQuestionFilters(){
    document.querySelector('.v3513-filter-sheet')?.setAttribute('data-open','false');document.querySelector('.v3513-filter-sheet')?.setAttribute('aria-hidden','true');
    document.querySelector('.v3513-filter-backdrop')?.setAttribute('data-open','false');document.body.classList.remove('v3513-filter-open');
  }
  function openQuestionFilters(){
    const sheet=document.querySelector('.v3513-filter-sheet');if(!sheet)return;sheet.setAttribute('data-open','true');sheet.setAttribute('aria-hidden','false');document.querySelector('.v3513-filter-backdrop')?.setAttribute('data-open','true');document.body.classList.add('v3513-filter-open');
  }
  function enhanceQuestions(){
    if(!mobileQuery()||getRoute()!=='questions')return;
    const host=getContent();if(!host)return;host.classList.add('v3513-questions-screen');
    if(questionMode()==='context'){host.classList.add('v3513-context-questions');return;}
    const panel=host.querySelector('.filter-panel');if(!panel)return;
    host.querySelectorAll('.v3513-question-tools,.v3513-filter-sheet,.v3513-filter-backdrop').forEach(n=>n.remove());
    const search=panel.querySelector('#fSearch');
    const tools=document.createElement('div');tools.className='v3513-question-tools';tools.innerHTML=`<label class="v3513-question-search-wrap"><span class="sr-only">Buscar questões</span><input id="v3513QuestionSearch" type="search" autocomplete="off" placeholder="Buscar assunto, palavra ou questão…" value="${escHtml(search?.value||'')}"></label><button type="button" id="v3513FilterToggle">Filtros${filterCount(panel)?` · ${filterCount(panel)}`:''}</button>`;
    const sheet=document.createElement('section');sheet.className='v3513-filter-sheet';sheet.dataset.open='false';sheet.setAttribute('aria-hidden','true');sheet.setAttribute('aria-label','Filtros do banco de questões');sheet.innerHTML='<header class="v3513-filter-head"><h3>Filtrar questões</h3><button type="button" class="v3513-filter-close" aria-label="Fechar filtros">×</button></header><div class="v3513-filter-body"></div><footer class="v3513-filter-footer"><button type="button" class="v3513-filter-apply">Ver questões</button></footer>';
    const backdrop=document.createElement('div');backdrop.className='v3513-filter-backdrop';backdrop.dataset.open='false';
    const layout=host.querySelector('.question-layout');host.insertBefore(tools,layout||host.firstChild);host.appendChild(backdrop);host.appendChild(sheet);sheet.querySelector('.v3513-filter-body').appendChild(panel);
    const proxy=tools.querySelector('#v3513QuestionSearch');
    proxy?.addEventListener('input',()=>{if(!search)return;search.value=proxy.value;search.dispatchEvent(new Event('input',{bubbles:true}));});
    tools.querySelector('#v3513FilterToggle')?.addEventListener('click',openQuestionFilters);sheet.querySelector('.v3513-filter-close')?.addEventListener('click',closeQuestionFilters);sheet.querySelector('.v3513-filter-apply')?.addEventListener('click',closeQuestionFilters);backdrop.addEventListener('click',closeQuestionFilters);
    panel.addEventListener('change',()=>setTimeout(()=>{const b=document.getElementById('v3513FilterToggle');if(b)b.textContent=`Filtros${filterCount(panel)?` · ${filterCount(panel)}`:''}`;},0));
  }
  function enhanceReader(){if(!mobileQuery()||getRoute()!=='reader')return;getContent()?.classList.add('v3513-reader-screen');}
  function enhanceCurrentRoute(){
    syncShell();if(!mobileQuery())return;
    const r=getRoute();
    if(r==='home')renderMobileHome();
    else if(r==='study')enhanceStudy();
    else if(r==='prepare')enhancePrepare();
    else if(r==='questions')enhanceQuestions();
    else if(r==='reader')enhanceReader();
  }
  function schedule(){requestAnimationFrame(()=>{enhanceCurrentRoute();setTimeout(enhanceCurrentRoute,70);});}
  function wrap(name){
    let base=null;try{base=window[name]||eval(`typeof ${name}==='function'?${name}:null`);}catch{}
    if(typeof base!=='function'||base.__v3513Wrapped)return;
    const wrapped=function(...args){const out=base.apply(this,args);schedule();return out;};wrapped.__v3513Wrapped=true;wrapped.__v3513Base=base;
    try{window[name]=wrapped;eval(`${name}=window[name]`);}catch{window[name]=wrapped;}
  }
  function bindBottomTabs(){
    window.addEventListener('click',e=>{
      const btn=e.target?.closest?.('.bottom-nav [data-route]');if(!btn||!mobileQuery())return;
      /* v35.12 owns the free-bank reset for Questões; this capture is only an explicit safety net. */
      if(btn.dataset.route==='questions')try{window.OAB_QUESTION_NAV?.enterBank?.();}catch{}
    },true);
  }
  function install(){
    ['renderHome','renderStudy','renderPrepare','renderQuestions','renderReader','renderRoute','setRoute'].forEach(wrap);
    bindBottomTabs();syncShell();schedule();
    window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{closeQuestionFilters();syncShell();if(mobileQuery())schedule();},120);});
    document.documentElement.dataset.oabMobileVersion=VERSION;
  }
  Object.assign(api,{VERSION,isMobile:mobileQuery,routeTitle,syncShell,renderMobileHome,enhanceStudy,enhancePrepare,enhanceQuestions,enhanceReader,enhanceCurrentRoute,openQuestionFilters,closeQuestionFilters,install});
  install();
})();
