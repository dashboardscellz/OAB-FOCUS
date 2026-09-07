/* OAB Focus SUPER v31
   Refino do login: menos estreito, mais equilibrado e mais legível.
*/
(() => {
  'use strict';
  function install(){
    if(document.getElementById('v31Styles')) return;
    const s=document.createElement('style');
    s.id='v31Styles';
    s.textContent=`
      /* LOGIN */
      #loginView.login-v11{
        min-height:100vh!important;
        grid-template-columns:minmax(0,1.4fr) minmax(500px,620px)!important;
        background:var(--surface-2)!important;
      }
      #loginView .login-showcase{
        padding:40px clamp(36px,5vw,86px) 34px!important;
      }
      #loginView .login-showcase-top{gap:28px!important;align-items:flex-start!important}
      #loginView .showcase-brand{max-width:430px}
      #loginView .showcase-main{
        display:grid!important;
        grid-template-columns:minmax(220px,320px) minmax(0,1fr)!important;
        gap:36px!important;
        align-items:end!important;
      }
      #loginView .showcase-photo-wrap{
        align-self:end!important;
        width:100%!important;
        max-width:320px!important;
        height:min(62vh,540px)!important;
      }
      #loginView .showcase-story{
        max-width:42rem!important;
        padding-right:10px!important;
      }
      #loginView .showcase-story h1{font-size:clamp(3rem,4.5vw,4.4rem)!important;line-height:.96!important;max-width:12ch!important}
      #loginView .showcase-story p{max-width:34ch!important;font-size:1rem!important;line-height:1.65!important}
      #loginView .showcase-benefits{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        gap:12px!important;
        margin-top:22px!important;
      }
      #loginView .showcase-benefits div{
        min-height:76px!important;
        border:1px solid rgba(255,255,255,.12)!important;
        background:rgba(255,255,255,.04)!important;
        border-radius:16px!important;
        padding:14px 16px!important;
      }

      #loginView .login-form-v11{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        padding:36px!important;
      }
      #loginView .login-card-v11{
        width:min(100%,560px)!important;
        max-width:560px!important;
        padding:42px 36px!important;
        border-radius:28px!important;
      }
      #loginView .login-card-v11 h2{font-size:clamp(2.8rem,3.8vw,4rem)!important;line-height:.96!important;max-width:10ch!important}
      #loginView .login-card-v11 .muted{font-size:1.02rem!important;line-height:1.6!important;max-width:28ch!important}
      #loginView .login-card-v11 label{display:block;font-weight:700!important;color:var(--ink)!important;margin-top:18px!important}
      #loginView .login-card-v11 input{
        min-height:52px!important;
        font-size:1rem!important;
        margin-top:8px!important;
        padding-inline:16px!important;
      }
      #loginView .login-card-v11 .password-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:10px!important;align-items:end!important}
      #loginView .login-card-v11 .password-row .icon-btn{height:52px!important;width:56px!important;align-self:end!important}
      #loginView .login-card-v11 .btn.wide{min-height:54px!important;font-size:1rem!important;margin-top:18px!important}
      #loginView .login-card-v11 .register-btn{margin-top:12px!important}
      #loginView .approval-note{font-size:.85rem!important;line-height:1.55!important;max-width:36ch!important;margin:12px auto 0!important}
      #loginView .secure-note{margin-top:22px!important;padding-top:18px!important}
      #loginView .secure-note>span{flex:0 0 42px!important;width:42px!important;height:42px!important}

      @media (max-width:1380px){
        #loginView.login-v11{grid-template-columns:minmax(0,1.2fr) minmax(460px,540px)!important}
        #loginView .showcase-main{grid-template-columns:minmax(190px,260px) minmax(0,1fr)!important;gap:28px!important}
        #loginView .showcase-story h1{font-size:clamp(2.6rem,4vw,3.6rem)!important}
      }
      @media (max-width:1180px){
        #loginView.login-v11{grid-template-columns:minmax(0,1fr) minmax(430px,500px)!important}
        #loginView .login-showcase{padding:32px clamp(24px,3vw,44px) 28px!important}
        #loginView .showcase-main{grid-template-columns:210px minmax(0,1fr)!important;gap:22px!important}
        #loginView .showcase-photo-wrap{height:min(52vh,420px)!important}
        #loginView .login-form-v11{padding:24px!important}
        #loginView .login-card-v11{max-width:500px!important;padding:34px 28px!important}
      }
      @media (max-width:980px){
        #loginView.login-v11{display:block!important}
        #loginView .login-showcase{padding:26px 20px 22px!important}
        #loginView .showcase-main{grid-template-columns:150px minmax(0,1fr)!important;gap:16px!important}
        #loginView .showcase-photo-wrap{height:230px!important;max-width:170px!important}
        #loginView .showcase-story h1{font-size:clamp(2.3rem,8vw,3.1rem)!important;max-width:none!important}
        #loginView .showcase-story p{max-width:42ch!important}
        #loginView .showcase-benefits{grid-template-columns:repeat(3,minmax(0,1fr))!important}
        #loginView .login-form-v11{padding:22px 18px 30px!important}
        #loginView .login-card-v11{max-width:620px!important;width:min(100%,620px)!important}
      }
      @media (max-width:720px){
        #loginView .showcase-main{grid-template-columns:1fr!important}
        #loginView .showcase-photo-wrap{order:2!important;height:205px!important;max-width:170px!important;margin-top:8px!important}
        #loginView .showcase-story{order:1!important;padding-right:0!important}
        #loginView .showcase-story h1{font-size:2.3rem!important}
        #loginView .showcase-benefits{grid-template-columns:1fr!important}
        #loginView .showcase-benefits div{min-height:auto!important}
      }
      @media (max-width:560px){
        #loginView .login-form-v11{padding:14px 12px 22px!important}
        #loginView .login-card-v11{padding:24px 18px!important;border-radius:22px!important}
        #loginView .login-card-v11 h2{font-size:2.25rem!important;max-width:none!important}
        #loginView .login-card-v11 .password-row{grid-template-columns:minmax(0,1fr) 48px!important}
      }
    `;
    document.head.appendChild(s);
  }
  const _rr = renderRoute;
  renderRoute = function(){ install(); return _rr(); };
  install();
})();
