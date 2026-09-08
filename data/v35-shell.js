/* OAB Focus v35 — professional top-navigation shell */
(function(){
  'use strict';
  const contextualRoutes=new Set(['admin']);
  const routeLabels={home:'Início',study:'Estudar',prepare:'Prepare-se',questions:'Questões',review:'Revisar',performance:'Desempenho',highyield:'Mais cobrados',ranking:'Ranking',profile:'Perfil',settings:'Configurações',admin:'Administração',reader:'Estudar'};
  let questionOrigin={route:'home',payload:null};
  function shellHtml(){return `<header class="v35-global-header" aria-label="Cabeçalho principal">
    <div class="v35-header-util"><button class="v35-brand" data-route="home">OAB Focus <small>1ª fase</small></button><button class="v35-search" id="v35SearchBtn">Buscar assunto ou questão</button><div class="v35-header-spacer"></div><div class="v35-study-session" id="v35StudySession">Sessão 00:00</div><button class="v35-profile-trigger" id="v35ProfileBtn">Perfil</button></div>
    <nav class="v35-primary-nav" aria-label="Navegação principal"><button data-route="home">Início</button><button data-route="study">Estudar</button><button data-route="prepare">Prepare-se</button><button data-route="questions">Questões</button><button data-route="review">Revisar</button><button data-route="performance">Desempenho</button><button data-route="highyield">Mais cobrados</button><span class="v35-more-wrap"><button data-v35-more>Mais ▾</button><span class="v35-more-menu" role="menu"><button data-v35-route="ranking">Ranking</button><button data-v35-route="profile">Perfil</button><button data-v35-route="settings">Configurações</button><button data-v35-admin class="hidden" data-v35-route="admin">Administração</button><button class="danger" data-v35-logout>Sair</button></span></span></nav>
    <div class="v35-mobile-topbar"><button class="v35-mobile-brand" data-route="home">OAB Focus</button><div class="v35-mobile-actions"><button id="v35MobileSearch" aria-label="Buscar">⌕</button><button id="v35MobileProfile" aria-label="Perfil">○</button></div></div>
  </header>`;}
  function installV35LoginPolish(){
    if(document.getElementById('v35LoginPolish'))return;
    const style=document.createElement('style');style.id='v35LoginPolish';style.textContent=`
      /* v35.4 — acabamento institucional do login, aplicado depois dos patches v32/v33. */
      #loginView.login-v11{max-width:100vw!important;overflow:hidden!important;min-width:0!important;}
      #loginView .login-showcase{min-width:0!important;}
      #loginView .login-showcase:before,#loginView .login-showcase:after{opacity:.58!important;}
      #loginView .login-form-v11{min-width:0!important;max-width:100%!important;width:100%!important;box-sizing:border-box!important;padding:clamp(18px,2.2vw,30px)!important;overflow:hidden!important;}
      #loginView .login-card-v11{width:min(100%,512px)!important;max-width:512px!important;min-width:0!important;box-sizing:border-box!important;margin:0 auto!important;}
      #loginView .login-card-v11 input,#loginView .login-card-v11 button,#loginView .login-card-v11 .password-row{max-width:100%!important;min-width:0!important;box-sizing:border-box!important;}
      @media (min-width:1101px){
        #loginView .showcase-main{grid-template-columns:minmax(280px,340px) minmax(300px,1fr)!important;gap:clamp(28px,3.4vw,54px)!important;align-items:center!important;}
        #loginView .showcase-photo-wrap{height:clamp(390px,62vh,650px)!important;min-height:390px!important;width:100%!important;align-self:end!important;overflow:visible!important;filter:drop-shadow(0 24px 30px rgba(0,0,0,.26))!important;}
        #loginView .showcase-photo-wrap img{height:100%!important;width:auto!important;max-width:100%!important;object-fit:contain!important;object-position:center bottom!important;transform:none!important;}
        #loginView .showcase-story{max-width:520px!important;}
        #loginView .showcase-story p{max-width:44ch!important;}
      }
      @media (min-width:1101px) and (max-height:720px){
        #loginView .showcase-main{grid-template-columns:minmax(260px,330px) minmax(300px,1fr)!important;gap:clamp(26px,3vw,44px)!important;}
        #loginView .showcase-photo-wrap{height:clamp(330px,60vh,410px)!important;min-height:330px!important;}
        #loginView .showcase-story h1{font-size:clamp(2.45rem,3.8vw,3.2rem)!important;margin:7px 0 13px!important;}
        #loginView .showcase-story p{font-size:clamp(.84rem,1.08vw,.96rem)!important;line-height:1.46!important;}
      }
      @media (min-width:1101px) and (max-height:630px){
        #loginView .showcase-photo-wrap{height:clamp(320px,58vh,360px)!important;min-height:320px!important;}
        #loginView .showcase-main{grid-template-columns:minmax(250px,320px) minmax(300px,1fr)!important;}
        #loginView .showcase-story h1{font-size:clamp(2.35rem,3.6vw,3rem)!important;}
      }
      @media (max-width:1100px){
        #loginView.login-v11{overflow-x:hidden!important;overflow-y:auto!important;}
        #loginView .login-form-v11{padding-inline:max(14px,env(safe-area-inset-left))!important;}
      }
    `;document.head.appendChild(style);
  }
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
    const app=document.getElementById('app');if(!app)return;const r=routeName||'home';app.querySelectorAll('.v35-primary-nav [data-route],.v35-mobile-brand[data-route]').forEach(b=>{b.classList.remove('v34-active-state');const active=b.dataset.route===r||(r==='reader'&&b.dataset.route==='study');b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    app.querySelector('[data-v35-admin]')?.classList.toggle('hidden',profile?.role!=='admin');setV35ContextRail(r);syncTimer();
  }
  function cleanupV35ReaderRedundancy(){
    const root=document.querySelector('.v26-reading-stage #readerArticle,#readerArticle');
    if(!root)return;
    root.querySelectorAll('#zoneQuestions,.v20-practice-shell,.v16-reader-end,.v18-reader-footer').forEach(node=>node.remove());
    document.querySelectorAll('[data-reader-jump="questions"]').forEach(node=>node.remove());
  }
  function enhanceV35Reader(){
    if(typeof route==='string'&&route!=='reader')return;
    cleanupV35ReaderRedundancy();
    const article=document.querySelector('.v26-reading-stage #readerArticle,#readerArticle');
    const header=article?.querySelector('.v18-doc-header');
    const timer=document.getElementById('v34StudyTimer');
    const meta=header ? header.querySelector('.v18-doc-meta') : null;
    if(article)article.classList.add('v35-reader-article');
    if(timer&&header&&meta&&(timer.parentNode!==header||timer.nextElementSibling!==meta))header.insertBefore(timer,meta);
  }
  function scheduleV35Reader(){
    enhanceV35Reader();
    setTimeout(enhanceV35Reader,90);
    setTimeout(enhanceV35Reader,280);
  }
  function openV35MoreSheet(){
    const admin=profile?.role==='admin'?'<button data-v35-sheet-route="admin">Administração</button>':'';
    openModal(`<div class="modal-head"><div><span class="eyebrow">OAB FOCUS</span><h3>Mais opções</h3></div><button class="icon-btn" data-close>×</button></div><div class="v35-sheet-links"><button data-v35-sheet-route="review">Revisar</button><button data-v35-sheet-route="performance">Desempenho</button><button data-v35-sheet-route="highyield">Mais cobrados</button><button data-v35-sheet-route="ranking">Ranking</button><button data-v35-sheet-route="profile">Perfil</button><button data-v35-sheet-route="settings">Configurações</button>${admin}<button class="danger" data-v35-sheet-logout>Sair</button></div>`);
    document.querySelectorAll('[data-v35-sheet-route]').forEach(b=>b.onclick=()=>{closeModal();setRoute(b.dataset.v35SheetRoute);});document.querySelector('[data-v35-sheet-logout]')?.addEventListener('click',()=>{closeModal();window.OAB_V35_AUTH?.logoutV35?.();});
  }
  function enhanceV35Home(){const hero=document.querySelector('#content .dashboard-hero');if(hero)hero.classList.add('v35-home-hero');}
  function goBackFromQuestions(){
    const origin=questionOrigin&&questionOrigin.route&&questionOrigin.route!=='questions'?questionOrigin:{route:'home',payload:null};
    setRoute(origin.route,origin.payload||null);
  }
  function enhanceV35Questions(){
    if(typeof route==='string'&&route!=='questions')return;
    const host=document.getElementById('content');if(!host||host.querySelector('.v35-question-exit'))return;
    const exit=document.createElement('button');exit.type='button';exit.className='v35-question-exit';exit.innerHTML='<span aria-hidden="true">←</span><span>Voltar</span>';
    exit.setAttribute('aria-label','Voltar para a tela anterior');exit.addEventListener('click',goBackFromQuestions);host.insertBefore(exit,host.firstChild);
  }
  function enhanceRoute(){syncV35Navigation(typeof route==='string'?route:'home');if(route==='home')enhanceV35Home();if(route==='reader')scheduleV35Reader();if(route==='questions')enhanceV35Questions();}
  const baseSetRoute=typeof setRoute==='function'?setRoute:null;if(baseSetRoute){window.setRoute=setRoute=function(...args){const target=args[0],current=typeof route==='string'?route:'home';if(target==='questions'&&current!=='questions')questionOrigin={route:current||'home',payload:typeof routePayload!=='undefined'?routePayload:null};const out=baseSetRoute(...args);requestAnimationFrame(enhanceRoute);return out;};}
  const baseRenderRoute=typeof renderRoute==='function'?renderRoute:null;if(baseRenderRoute){window.renderRoute=renderRoute=function(...args){const out=baseRenderRoute(...args);requestAnimationFrame(enhanceRoute);return out;};}
  const baseRenderQuestions=typeof renderQuestions==='function'?renderQuestions:null;if(baseRenderQuestions){window.renderQuestions=renderQuestions=function(...args){const out=baseRenderQuestions(...args);requestAnimationFrame(enhanceV35Questions);return out;};}
  document.addEventListener('click',e=>{const more=e.target.closest?.('[data-v35-mobile-more]');if(more){e.preventDefault();e.stopImmediatePropagation();openV35MoreSheet();}},true);
  window.addEventListener('resize',()=>setV35ContextRail(typeof route==='string'?route:'home'));setInterval(syncTimer,1000);
  installV35LoginPolish();mountV35Shell();
  window.OAB_V35_SHELL={mountV35Shell,syncV35Navigation,setV35ContextRail,openV35MoreSheet,enhanceV35Home,enhanceV35Reader,cleanupV35ReaderRedundancy,enhanceV35Questions,goBackFromQuestions,installV35LoginPolish,contextualRoutes,routeLabels};
})();
