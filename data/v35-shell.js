/* OAB Focus v35 — professional top-navigation shell */
(function(){
  'use strict';
  const contextualRoutes=new Set(['admin']);
  const routeLabels={home:'Início',study:'Estudar',prepare:'Prepare-se',questions:'Questões',review:'Revisar',performance:'Desempenho',highyield:'Mais cobrados',ranking:'Ranking',profile:'Perfil',settings:'Configurações',admin:'Administração',reader:'Estudar'};
  function shellHtml(){return `<header class="v35-global-header" aria-label="Cabeçalho principal">
    <div class="v35-header-util"><button class="v35-brand" data-route="home">OAB Focus <small>1ª fase</small></button><button class="v35-search" id="v35SearchBtn">Buscar assunto ou questão</button><div class="v35-header-spacer"></div><div class="v35-study-session" id="v35StudySession">Sessão 00:00</div><button class="v35-profile-trigger" id="v35ProfileBtn">Perfil</button></div>
    <nav class="v35-primary-nav" aria-label="Navegação principal"><button data-route="home">Início</button><button data-route="study">Estudar</button><button data-route="prepare">Prepare-se</button><button data-route="questions">Questões</button><button data-route="review">Revisar</button><button data-route="performance">Desempenho</button><button data-route="highyield">Mais cobrados</button><span class="v35-more-wrap"><button data-v35-more>Mais ▾</button><span class="v35-more-menu" role="menu"><button data-v35-route="ranking">Ranking</button><button data-v35-route="profile">Perfil</button><button data-v35-route="settings">Configurações</button><button data-v35-admin class="hidden" data-v35-route="admin">Administração</button><button class="danger" data-v35-logout>Sair</button></span></span></nav>
    <div class="v35-mobile-topbar"><button class="v35-mobile-brand" data-route="home">OAB Focus</button><div class="v35-mobile-actions"><button id="v35MobileSearch" aria-label="Buscar">⌕</button><button id="v35MobileProfile" aria-label="Perfil">○</button></div></div>
  </header>`;}
  function mountV35Shell(){
    const app=document.getElementById('app');if(!app||app.querySelector('.v35-global-header'))return;
    app.insertAdjacentHTML('afterbegin',shellHtml());
    const main=app.querySelector('.main-area');if(main&&!app.querySelector('.v35-context-rail'))main.insertAdjacentHTML('afterbegin','<aside class="v35-context-rail" aria-label="Navegação contextual"></aside>');
    document.getElementById('v35SearchBtn')?.addEventListener('click',()=>openGlobalSearch());document.getElementById('v35MobileSearch')?.addEventListener('click',()=>openGlobalSearch());
    document.getElementById('v35ProfileBtn')?.addEventListener('click',()=>setRoute('profile'));document.getElementById('v35MobileProfile')?.addEventListener('click',()=>setRoute('profile'));
    app.querySelector('[data-v35-more]')?.addEventListener('click',e=>{e.stopPropagation();e.currentTarget.closest('.v35-more-wrap')?.classList.toggle('open');});
    app.querySelectorAll('[data-v35-route]').forEach(b=>b.addEventListener('click',()=>{setRoute(b.dataset.v35Route);b.closest('.v35-more-wrap')?.classList.remove('open');}));
    app.querySelector('[data-v35-logout]')?.addEventListener('click',()=>window.OAB_V35_AUTH?.logoutV35?.());
    document.addEventListener('click',e=>{if(!e.target.closest('.v35-more-wrap'))app.querySelector('.v35-more-wrap')?.classList.remove('open');});
    syncV35Navigation(typeof route==='string'?route:'home');
  }
  function syncTimer(){const el=document.getElementById('v35StudySession');if(!el)return;let sec=0;try{sec=window.OAB_V34?.activeSessionSeconds?.()||0;}catch{}if(!sec&&currentStudy?.seconds)sec=currentStudy.seconds;el.textContent=`Sessão ${formatTime(sec)}`;}
  function setV35ContextRail(routeName){
    const app=document.getElementById('app'),rail=app?.querySelector('.v35-context-rail');if(!app||!rail)return;
    const allowed=contextualRoutes.has(routeName);app.classList.toggle('v35-has-context',allowed&&innerWidth>1080);if(!allowed){rail.innerHTML='';return;}
    rail.innerHTML='<h3>Administração</h3><button class="active">Controle de usuários</button><button data-v35-route="ranking">Ranking da plataforma</button><button data-v35-route="settings">Configurações</button>';
    rail.querySelectorAll('[data-v35-route]').forEach(b=>b.onclick=()=>setRoute(b.dataset.v35Route));
  }
  function syncV35Navigation(routeName){
    const app=document.getElementById('app');if(!app)return;const r=routeName||'home';app.querySelectorAll('.v35-primary-nav [data-route],.v35-mobile-brand[data-route]').forEach(b=>{const active=b.dataset.route===r||(r==='reader'&&b.dataset.route==='study');b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    app.querySelector('[data-v35-admin]')?.classList.toggle('hidden',profile?.role!=='admin');setV35ContextRail(r);syncTimer();
  }
  function openV35MoreSheet(){
    const admin=profile?.role==='admin'?'<button data-v35-sheet-route="admin">Administração</button>':'';
    openModal(`<div class="modal-head"><div><span class="eyebrow">OAB FOCUS</span><h3>Mais opções</h3></div><button class="icon-btn" data-close>×</button></div><div class="v35-sheet-links"><button data-v35-sheet-route="review">Revisar</button><button data-v35-sheet-route="performance">Desempenho</button><button data-v35-sheet-route="highyield">Mais cobrados</button><button data-v35-sheet-route="ranking">Ranking</button><button data-v35-sheet-route="profile">Perfil</button><button data-v35-sheet-route="settings">Configurações</button>${admin}<button class="danger" data-v35-sheet-logout>Sair</button></div>`);
    document.querySelectorAll('[data-v35-sheet-route]').forEach(b=>b.onclick=()=>{closeModal();setRoute(b.dataset.v35SheetRoute);});document.querySelector('[data-v35-sheet-logout]')?.addEventListener('click',()=>{closeModal();window.OAB_V35_AUTH?.logoutV35?.();});
  }
  function enhanceV35Home(){const hero=document.querySelector('#content .dashboard-hero');if(hero)hero.classList.add('v35-home-hero');}
  function enhanceRoute(){syncV35Navigation(typeof route==='string'?route:'home');if(route==='home')enhanceV35Home();}
  const baseSetRoute=typeof setRoute==='function'?setRoute:null;if(baseSetRoute){window.setRoute=setRoute=function(...args){const out=baseSetRoute(...args);requestAnimationFrame(enhanceRoute);return out;};}
  const baseRenderRoute=typeof renderRoute==='function'?renderRoute:null;if(baseRenderRoute){window.renderRoute=renderRoute=function(...args){const out=baseRenderRoute(...args);requestAnimationFrame(enhanceRoute);return out;};}
  document.addEventListener('click',e=>{const more=e.target.closest?.('[data-v35-mobile-more]');if(more){e.preventDefault();e.stopImmediatePropagation();openV35MoreSheet();}},true);
  window.addEventListener('resize',()=>setV35ContextRail(typeof route==='string'?route:'home'));setInterval(syncTimer,1000);
  mountV35Shell();
  window.OAB_V35_SHELL={mountV35Shell,syncV35Navigation,setV35ContextRail,openV35MoreSheet,enhanceV35Home,contextualRoutes,routeLabels};
})();
