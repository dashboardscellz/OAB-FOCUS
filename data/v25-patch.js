/* OAB Focus SUPER v25
   Reorganiza a tela de insígnias para eliminar cartões estreitos e quebra excessiva de texto.
*/
(() => {
  'use strict';
  function installStyles(){
    if(document.getElementById('v25Styles')) return;
    const s=document.createElement('style');
    s.id='v25Styles';
    s.textContent=`
      body.v25-profile .content{max-width:1480px!important}
      body.v25-profile .section.cards-2{
        grid-template-columns:1fr!important;
        gap:22px!important;
      }
      body.v25-profile .section.cards-2 > .card{
        padding:22px 24px!important;
        overflow:visible!important;
      }
      body.v25-profile .section.cards-2 > .card .section-title{
        margin-bottom:16px!important;
        padding-bottom:12px!important;
        border-bottom:1px solid var(--line)!important;
      }
      body.v25-profile .section.cards-2 > .card .section-title h3{
        font-size:1.05rem!important;
        letter-spacing:-.015em!important;
      }
      body.v25-profile .badge-grid{
        display:grid!important;
        grid-template-columns:repeat(auto-fit,minmax(210px,1fr))!important;
        gap:14px!important;
        align-items:stretch!important;
      }
      body.v25-profile .badge-card{
        min-width:0!important;
        min-height:156px!important;
        padding:16px 16px 17px!important;
        border-radius:16px!important;
        display:flex!important;
        flex-direction:column!important;
        justify-content:flex-start!important;
        overflow:hidden!important;
      }
      body.v25-profile .badge-head{
        min-height:38px!important;
        margin-bottom:10px!important;
      }
      body.v25-profile .badge-icon{
        width:38px!important;
        height:38px!important;
        flex:0 0 38px!important;
        border-radius:11px!important;
        font-size:.95rem!important;
      }
      body.v25-profile .rarity-pill{
        font-size:.65rem!important;
        padding:5px 8px!important;
        white-space:nowrap!important;
      }
      body.v25-profile .badge-card h4{
        margin:2px 0 6px!important;
        font-size:1rem!important;
        line-height:1.28!important;
        letter-spacing:-.01em!important;
        overflow-wrap:normal!important;
        word-break:normal!important;
        hyphens:none!important;
      }
      body.v25-profile .badge-card p{
        margin:0!important;
        font-size:.82rem!important;
        line-height:1.55!important;
        color:var(--muted)!important;
        overflow-wrap:normal!important;
        word-break:normal!important;
      }
      body.v25-profile .badge-card.locked{opacity:.72!important}
      body.v25-profile .badge-card.locked h4{color:var(--ink)!important}
      body.v25-profile .badge-card.locked p{color:var(--muted)!important}

      @media(min-width:1280px){
        body.v25-profile .badge-grid{grid-template-columns:repeat(5,minmax(0,1fr))!important}
      }
      @media(min-width:920px) and (max-width:1279px){
        body.v25-profile .badge-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}
      }
      @media(min-width:680px) and (max-width:919px){
        body.v25-profile .badge-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      }
      @media(max-width:679px){
        body.v25-profile .section.cards-2 > .card{padding:18px 14px!important}
        body.v25-profile .badge-grid{grid-template-columns:1fr!important;gap:10px!important}
        body.v25-profile .badge-card{min-height:auto!important;padding:14px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function syncProfileClass(){
    document.body.classList.toggle('v25-profile', route==='profile');
  }

  const baseRenderRoute=renderRoute;
  renderRoute=function(){
    installStyles();
    syncProfileClass();
    const out=baseRenderRoute();
    requestAnimationFrame(syncProfileClass);
    return out;
  };

  installStyles();
  syncProfileClass();
  window.OAB_V25_ACTIVE=true;
})();
