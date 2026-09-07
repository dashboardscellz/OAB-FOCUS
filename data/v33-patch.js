/* OAB Focus SUPER v33
   Login responsivo por largura + altura: desktops baixos ganham composição compacta sem esmagar colunas.
*/
(() => {
  'use strict';

  function installStyles(){
    if(document.getElementById('v33Styles')) return;
    const s=document.createElement('style');
    s.id='v33Styles';
    s.textContent=`
      /* Desktop largo, porém com pouca altura: compacta verticalmente sem alterar a hierarquia horizontal. */
      @media (min-width:1101px) and (max-height:720px){
        #loginView.login-v11{
          height:100vh!important;
          min-height:0!important;
          overflow:hidden!important;
          grid-template-columns:minmax(0,1fr) clamp(470px,36vw,560px)!important;
        }
        #loginView .login-showcase{
          height:100vh!important;
          min-height:0!important;
          overflow:hidden!important;
          padding:20px clamp(34px,4.6vw,64px) 16px!important;
          grid-template-rows:auto minmax(0,1fr) auto!important;
        }
        #loginView .login-showcase-top{
          min-height:0!important;
          align-items:flex-start!important;
        }
        #loginView .showcase-logo{font-size:clamp(2rem,2.8vw,2.6rem)!important}
        #loginView .showcase-quote{font-size:clamp(.95rem,1.5vw,1.15rem)!important;line-height:1.35!important}
        #loginView .showcase-main{
          min-height:0!important;
          grid-template-columns:minmax(180px,230px) minmax(340px,1fr)!important;
          gap:clamp(26px,3vw,42px)!important;
          padding-top:8px!important;
          align-items:center!important;
        }
        #loginView .showcase-photo-wrap{
          width:100%!important;
          height:min(40vh,250px)!important;
          min-height:190px!important;
          align-self:end!important;
        }
        #loginView .showcase-story{
          min-width:0!important;
          max-width:560px!important;
          padding:0!important;
          align-self:center!important;
        }
        #loginView .showcase-kicker{font-size:.72rem!important;letter-spacing:.22em!important}
        #loginView .showcase-story h1{
          font-size:clamp(2.55rem,4vw,3.35rem)!important;
          line-height:.95!important;
          margin:8px 0 14px!important;
          max-width:none!important;
        }
        #loginView .showcase-story p{
          font-size:clamp(.86rem,1.15vw,.98rem)!important;
          line-height:1.48!important;
          margin:0 0 9px!important;
          max-width:40ch!important;
        }
        #loginView .showcase-story p:nth-of-type(3),
        #loginView .showcase-signature{display:none!important}
        #loginView .showcase-benefits{
          margin-top:0!important;
          padding-top:10px!important;
          min-height:0!important;
        }
        #loginView .showcase-benefits div{min-height:0!important}

        #loginView .login-form-v11{
          height:100vh!important;
          min-height:0!important;
          overflow:hidden!important;
          padding:14px 24px!important;
        }
        #loginView .login-card-v11{
          width:100%!important;
          max-width:512px!important;
          max-height:calc(100vh - 28px)!important;
          overflow:hidden!important;
          padding:20px 28px!important;
          border-radius:24px!important;
        }
        #loginView .login-card-v11 .mobile-brand{display:none!important}
        #loginView .login-card-v11 .eyebrow{font-size:.72rem!important;line-height:1.2!important}
        #loginView .login-card-v11 h2{
          font-size:clamp(2.05rem,3.1vw,2.65rem)!important;
          line-height:.96!important;
          margin-top:6px!important;
        }
        #loginView .login-card-v11 .muted{
          font-size:.92rem!important;
          line-height:1.45!important;
          margin:9px 0 7px!important;
        }
        #loginView .login-card-v11 label{
          margin-top:10px!important;
          font-size:.84rem!important;
          line-height:1.35!important;
        }
        #loginView .login-card-v11 input{
          height:44px!important;
          min-height:44px!important;
          margin-top:5px!important;
          padding:9px 12px!important;
        }
        #loginView .login-card-v11 .password-row{gap:8px!important}
        #loginView .login-card-v11 .password-row .icon-btn{
          width:46px!important;
          height:44px!important;
          min-height:44px!important;
          margin-top:5px!important;
        }
        #loginView .login-card-v11 .btn.wide{
          min-height:44px!important;
          height:44px!important;
          margin-top:12px!important;
          padding:9px 14px!important;
          font-size:.94rem!important;
        }
        #loginView .login-card-v11 .register-btn{margin-top:8px!important}
        #loginView .approval-note{
          margin:6px 3px 0!important;
          font-size:.72rem!important;
          line-height:1.35!important;
        }
        #loginView .secure-note{
          margin-top:10px!important;
          padding-top:10px!important;
          gap:9px!important;
          font-size:.85rem!important;
          line-height:1.35!important;
        }
        #loginView .secure-note>span{
          width:34px!important;
          height:34px!important;
          flex:0 0 34px!important;
        }
        #loginView .secure-note small{font-size:.72rem!important;line-height:1.3!important}
      }

      /* Muito baixo: retira apenas elementos editoriais secundários para manter o acesso inteiro no primeiro viewport. */
      @media (min-width:1101px) and (max-height:630px){
        #loginView .showcase-benefits{display:none!important}
        #loginView .showcase-photo-wrap{height:min(36vh,220px)!important;min-height:170px!important}
        #loginView .showcase-story p:nth-of-type(2){display:none!important}
        #loginView .login-card-v11{padding:16px 26px!important}
        #loginView .login-card-v11 h2{font-size:2rem!important}
        #loginView .secure-note{margin-top:8px!important;padding-top:8px!important}
      }
    `;
    document.head.appendChild(s);
  }

  installStyles();
  window.OAB_V33={active:true};
})();
