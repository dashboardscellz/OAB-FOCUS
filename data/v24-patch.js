/* OAB Focus SUPER v24
   Modo Foco real: leitura centralizada, sem TOC lateral, painel de métricas ou barra de ferramentas completa.
*/
(() => {
  'use strict';

  function installStyles(){
    if(document.getElementById('v24Styles')) return;
    const s=document.createElement('style');
    s.id='v24Styles';
    s.textContent=`
      /* O foco deve remover navegação global + laterais + chrome de leitura. */
      body.v24-focus .sidebar,
      body.v24-focus .topbar,
      body.v24-focus .bottom-nav,
      body.v24-focus .v16-reader-toc,
      body.v24-focus .v16-reader-status,
      body.v24-focus .v17-reader-chrome,
      body.v24-focus .v16-reader-command,
      body.v24-focus .reader-top,
      body.v24-focus .reader-context,
      body.v24-focus .reader-tools,
      body.v24-focus .v18-progressline,
      body.v24-focus .v17-progressline{
        display:none!important;
      }

      body.v24-focus{
        background:var(--v20-bg,var(--bg))!important;
      }
      body.v24-focus .main-area,
      body.v24-focus .main,
      body.v24-focus .app-main{
        margin-left:0!important;
        padding-left:0!important;
      }
      body.v24-focus .content{
        width:100%!important;
        max-width:none!important;
        padding:28px 24px 110px!important;
        background:var(--v20-bg,var(--bg))!important;
      }
      body.v24-focus .v18-reader,
      body.v24-focus .v17-reader,
      body.v24-focus .reader-shell{
        max-width:none!important;
        margin:0!important;
      }
      body.v24-focus .v16-reader-grid{
        display:block!important;
        max-width:960px!important;
        margin:0 auto!important;
      }
      body.v24-focus #readerArticle{
        width:100%!important;
        max-width:960px!important;
        margin:0 auto!important;
        padding:54px 70px 72px!important;
        border-radius:24px!important;
        box-shadow:0 20px 60px rgba(15,23,42,.07)!important;
      }
      body.v24-focus .v18-doc-header{
        max-width:82ch!important;
        margin-left:auto!important;
        margin-right:auto!important;
      }
      body.v24-focus .v18-doc-header h1{
        max-width:22ch!important;
      }
      body.v24-focus .study-zone,
      body.v24-focus .primary-material,
      body.v24-focus .v16-reader-end,
      body.v24-focus .v20-practice-shell{
        max-width:84ch!important;
        margin-left:auto!important;
        margin-right:auto!important;
      }
      body.v24-focus .integral-body{
        font-size:18.5px!important;
        line-height:1.92!important;
      }
      body.v24-focus .integral-body p{
        max-width:76ch!important;
      }

      /* Mantém somente ferramentas essenciais de leitura ativa. */
      body.v24-focus .v18-highlight-dock,
      body.v24-focus .v17-highlight-dock{
        display:flex!important;
        visibility:visible!important;
        pointer-events:auto!important;
      }

      .v24-focus-exit{
        position:fixed;
        top:18px;
        right:18px;
        z-index:180;
        min-height:42px;
        border:1px solid var(--line);
        border-radius:999px;
        padding:0 15px;
        display:none;
        align-items:center;
        gap:8px;
        background:color-mix(in srgb,var(--surface) 94%,transparent);
        backdrop-filter:blur(14px);
        color:var(--ink);
        box-shadow:0 12px 34px rgba(15,23,42,.10);
        font:inherit;
        font-size:.76rem;
        font-weight:800;
        cursor:pointer;
      }
      body.v24-focus .v24-focus-exit{display:inline-flex}
      .v24-focus-exit:hover{background:var(--surface-2)}

      body.v24-focus .v24-focus-progress{
        display:block;
        position:fixed;
        top:0;
        left:0;
        right:0;
        height:3px;
        z-index:181;
        background:transparent;
      }
      .v24-focus-progress{display:none}
      .v24-focus-progress i{
        display:block;
        width:0;
        height:100%;
        background:var(--brand,#2458d3);
        transition:width .12s linear;
      }

      @media(max-width:900px){
        body.v24-focus .content{padding:10px 0 96px!important}
        body.v24-focus #readerArticle{
          max-width:100%!important;
          padding:34px 22px 48px!important;
          border-radius:0!important;
          border-left:0!important;
          border-right:0!important;
          box-shadow:none!important;
        }
        .v24-focus-exit{top:10px;right:10px;min-height:38px;padding:0 12px}
      }
      @media(max-width:560px){
        body.v24-focus #readerArticle{padding:28px 16px 44px!important}
        body.v24-focus .integral-body{font-size:17px!important;line-height:1.84!important}
        .v24-focus-exit{font-size:0;width:40px;padding:0;justify-content:center}
        .v24-focus-exit:before{content:'×';font-size:1.35rem;line-height:1}
      }
    `;
    document.head.appendChild(s);
  }

  function ensureExit(){
    let b=document.querySelector('.v24-focus-exit');
    if(!b){
      b=document.createElement('button');
      b.type='button';
      b.className='v24-focus-exit';
      b.innerHTML='← Sair do foco';
      b.addEventListener('click',()=>setFocus(false));
      document.body.appendChild(b);
    }
    let p=document.querySelector('.v24-focus-progress');
    if(!p){
      p=document.createElement('div');
      p.className='v24-focus-progress';
      p.innerHTML='<i></i>';
      document.body.appendChild(p);
    }
  }

  function updateProgress(){
    if(!document.body.classList.contains('v24-focus')) return;
    const article=document.getElementById('readerArticle');
    const bar=document.querySelector('.v24-focus-progress i');
    if(!article || !bar) return;
    const rect=article.getBoundingClientRect();
    const top=window.scrollY+rect.top;
    const total=Math.max(1,article.scrollHeight-window.innerHeight*.5);
    const read=window.scrollY+window.innerHeight*.25-top;
    const pct=Math.max(0,Math.min(100,Math.round(read/total*100)));
    bar.style.width=pct+'%';
  }

  function setFocus(on){
    const active=!!on && route==='reader';
    document.body.classList.toggle('v24-focus',active);
    document.body.classList.toggle('v17-focus',active);
    document.body.classList.toggle('focus-mode',active);
    document.body.classList.toggle('v16-focus',active);
    ensureExit();
    if(active){
      window.addEventListener('scroll',updateProgress,{passive:true});
      requestAnimationFrame(updateProgress);
    }else{
      window.removeEventListener('scroll',updateProgress);
      document.querySelector('.v24-focus-progress i')?.style.setProperty('width','0');
    }
  }

  function bindFocus(){
    if(route!=='reader') return;
    ensureExit();
    const modern=document.getElementById('v17Focus');
    if(modern && !modern.dataset.v24Focus){
      modern.dataset.v24Focus='1';
      modern.addEventListener('click',(e)=>{
        e.preventDefault();
        e.stopImmediatePropagation();
        setFocus(!document.body.classList.contains('v24-focus'));
      },true);
    }
    const legacy=document.getElementById('focusBtn');
    if(legacy && !legacy.dataset.v24Focus){
      legacy.dataset.v24Focus='1';
      legacy.addEventListener('click',(e)=>{
        e.preventDefault();
        e.stopImmediatePropagation();
        setFocus(!document.body.classList.contains('v24-focus'));
      },true);
    }
  }

  const baseRenderReader=renderReader;
  renderReader=function(payload){
    const out=baseRenderReader(payload);
    requestAnimationFrame(bindFocus);
    setTimeout(bindFocus,80);
    return out;
  };

  const baseRenderRoute=renderRoute;
  renderRoute=function(){
    if(route!=='reader') setFocus(false);
    const out=baseRenderRoute();
    if(route==='reader') requestAnimationFrame(bindFocus);
    return out;
  };

  installStyles();
  ensureExit();
  window.OAB_V24_ACTIVE=true;
})();
