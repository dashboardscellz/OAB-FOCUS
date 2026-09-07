/* OAB Focus SUPER v32
   Login equilibrado: preserva a composição institucional da v30 e amplia apenas o acesso.
*/
(() => {
  'use strict';

  function installStyles(){
    if(document.getElementById('v32Styles')) return;
    const s=document.createElement('style');
    s.id='v32Styles';
    s.textContent=`
      /* Desktop: preserva o showcase da v30; só redistribui a largura externa. */
      #loginView.login-v11{
        grid-template-columns:minmax(0,1fr) clamp(470px,36vw,560px)!important;
        min-width:0!important;
      }
      #loginView .login-form-v11{
        min-width:0!important;
        padding:24px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
      }
      #loginView .login-card-v11{
        width:100%!important;
        max-width:512px!important;
        min-width:0!important;
        margin:0 auto!important;
        padding:36px 30px!important;
      }
      #loginView .login-card-v11 input,
      #loginView .login-card-v11 button,
      #loginView .login-card-v11 .password-row{min-width:0!important;max-width:100%!important}
      #loginView .login-card-v11 .password-row{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) auto!important;
        gap:8px!important;
      }
      #loginView .login-card-v11 .password-row .icon-btn{width:48px!important;flex:0 0 48px!important}

      /* Antes que a área institucional fique espremida, muda deliberadamente para pilha. */
      @media (max-width:1100px){
        #loginView.login-v11{display:block!important}
        #loginView .login-showcase{
          min-height:auto!important;
          padding:24px 22px 28px!important;
          grid-template-rows:auto auto!important;
        }
        #loginView .login-showcase-top{margin-bottom:16px!important}
        #loginView .showcase-quote{display:none!important}
        #loginView .showcase-main{
          grid-template-columns:160px minmax(0,1fr)!important;
          gap:20px!important;
          align-items:end!important;
          padding-top:10px!important;
        }
        #loginView .showcase-photo-wrap{height:245px!important}
        #loginView .showcase-story{padding:0!important;max-width:620px!important;min-width:0!important}
        #loginView .showcase-story h1{font-size:var(--t-h3)!important;margin-bottom:10px!important}
        #loginView .showcase-story p{display:none!important}
        #loginView .showcase-signature{font-size:var(--t-h4)!important;margin-top:8px!important}
        #loginView .showcase-benefits{margin-top:18px!important}
        #loginView .login-form-v11{padding:22px 18px 30px!important}
        #loginView .login-card-v11{max-width:560px!important;padding:34px 30px!important}
      }

      @media (max-width:620px){
        #loginView .login-showcase{padding:20px 16px 20px!important}
        #loginView .showcase-main{grid-template-columns:110px minmax(0,1fr)!important;gap:12px!important}
        #loginView .showcase-photo-wrap{height:185px!important}
        #loginView .login-form-v11{padding:12px!important}
        #loginView .login-card-v11{max-width:none!important;width:100%!important;padding:24px 20px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function resetLoginViewport(){
    const root=document.documentElement;
    const body=document.body;
    const rootScroll=root?.style.scrollBehavior || '';
    const bodyScroll=body?.style.scrollBehavior || '';
    const forceTop=()=>{
      try{
        if(root) root.scrollTop=0;
        if(body) body.scrollTop=0;
        if(typeof window.scrollTo==='function') window.scrollTo(0,0);
      }catch{}
    };
    if(root) root.style.scrollBehavior='auto';
    if(body) body.style.scrollBehavior='auto';
    forceTop();
    requestAnimationFrame(()=>{
      forceTop();
      requestAnimationFrame(()=>{
        forceTop();
        if(root) root.style.scrollBehavior=rootScroll;
        if(body) body.style.scrollBehavior=bodyScroll;
      });
    });
  }
  installStyles();

  if(typeof window.showLogin==='function'){
    const previousShowLogin=window.showLogin;
    window.showLogin=function(){
      const out=previousShowLogin.apply(this,arguments);
      requestAnimationFrame(resetLoginViewport);
      return out;
    };
  }

  const login=document.getElementById('loginView');
  if(login){
    const observer=new MutationObserver(()=>{
      if(!login.classList.contains('hidden')) requestAnimationFrame(resetLoginViewport);
    });
    observer.observe(login,{attributes:true,attributeFilter:['class']});
    if(!login.classList.contains('hidden')) requestAnimationFrame(resetLoginViewport);
  }

  window.OAB_V32={resetLoginViewport};
})();
