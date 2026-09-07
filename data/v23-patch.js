/* OAB Focus SUPER v23
   Correção: ferramentas de grifo nunca podem aparecer fora do leitor.
*/
(() => {
  'use strict';

  function installStyles(){
    if(document.getElementById('v23Styles')) return;
    const s=document.createElement('style');
    s.id='v23Styles';
    s.textContent=`
      body:not(.v18-reader-active) .v18-highlight-dock,
      body:not(.v18-reader-active) .v18-highlight-palette,
      body:not(.v18-reader-active) .v17-highlight-dock,
      body:not(.v18-reader-active) .v17-selection-palette,
      body:not(.v18-reader-active) #v16SelectionTools,
      body:not(.v18-reader-active) .v15-floating-highlighter{
        display:none!important;
        visibility:hidden!important;
        pointer-events:none!important;
      }
      #loginView:not(.hidden) ~ #app .v18-highlight-dock,
      #loginView:not(.hidden) ~ #app .v18-highlight-palette{
        display:none!important;
      }
      body.v18-reader-active .v18-highlight-dock{
        visibility:visible!important;
        pointer-events:auto!important;
      }
      body.v18-reader-active .v18-highlight-palette.visible{
        visibility:visible!important;
        pointer-events:auto!important;
      }
    `;
    document.head.appendChild(s);
  }

  function purgeReaderTools(){
    document.body.classList.remove('v18-reader-active','v17-reader-active','v16-reader-dark','v17-focus','v16-focus','focus-mode');
    document.querySelectorAll(
      '.v18-highlight-dock,.v18-highlight-palette,.v17-highlight-dock,.v17-selection-palette,#v16SelectionTools,.v15-floating-highlighter,.v18-progressline,.v17-progressline'
    ).forEach(el=>el.remove());
    try{ window.getSelection()?.removeAllRanges(); }catch{}
  }

  const originalShowLogin=showLogin;
  showLogin=function(){
    purgeReaderTools();
    return originalShowLogin();
  };

  const originalShowApp=showApp;
  showApp=function(){
    const out=originalShowApp();
    if(typeof route==='undefined' || route!=='reader') purgeReaderTools();
    return out;
  };

  const originalRenderRoute=renderRoute;
  renderRoute=function(){
    if(typeof route!=='undefined' && route!=='reader'){
      document.querySelectorAll('.v18-highlight-dock,.v18-highlight-palette').forEach(el=>{
        el.style.display='none';
        el.classList.remove('visible');
      });
    }
    return originalRenderRoute();
  };

  // Guarda adicional para mudanças de autenticação/DOM que não passem pelo roteador.
  const observer=new MutationObserver(()=>{
    const loginVisible=loginView && !loginView.classList.contains('hidden');
    if(loginVisible) purgeReaderTools();
  });
  if(loginView) observer.observe(loginView,{attributes:true,attributeFilter:['class']});

  installStyles();
  if(loginView && !loginView.classList.contains('hidden')) purgeReaderTools();
  window.OAB_V23_ACTIVE=true;
})();
