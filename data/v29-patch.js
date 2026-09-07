/* OAB Focus SUPER v29
   Auditoria responsiva global: corrige offsets residuais, grids comprimidos,
   overflow interno e conteúdo longo sem alterar a arquitetura pedagógica.
*/
(() => {
  'use strict';

  const VERSION = 29;

  function installStyles(){
    if(document.getElementById('v29Styles')) return;
    const s=document.createElement('style');
    s.id='v29Styles';
    s.textContent=`
      /* ---------- base defensiva contra overflow ---------- */
      .main-area,.content,.page-head,.section,.section-title,.card,.settings-card,.question-layout,.question-panel,.question-side,.filter-panel,
      .discipline-hero,.study-hero,.highyield-hero,.hy-card,.hy-title,.hy-actions,.plan-options,.plan-option,.plan-config,.plan-config-grid,
      .plan-dashboard,.today-plan,.plan-side,.plan-stat,.plan-task,.week-preview,.week-day,.platform-rank,.platform-rank-row,.platform-rank-user,
      .admin-user-table,.admin-user-row,.admin-user-name,.v27-trail-shell,.v27-trail-chapter,.v27-trail-unit,.v27-unit-copy,.v26-internal-view,
      .v26-study-card,.v26-note-editor,.v26-note-list,.v26-highlight-item{min-width:0!important}

      .card h1,.card h2,.card h3,.card h4,.card p,
      .settings-card h1,.settings-card h2,.settings-card h3,.settings-card p,
      .section-title h1,.section-title h2,.section-title h3,.section-title h4,
      .hy-title b,.hy-title small,.plan-task b,.plan-task small,.week-day small,
      .platform-rank-user b,.platform-rank-user small,.admin-user-name b,.admin-user-name small,
      .v27-unit-copy b,.v27-unit-copy small,.v26-note-item p,.search-result b,.search-result small{
        min-width:0;max-width:100%;overflow-wrap:anywhere;word-break:normal
      }
      .section-title{flex-wrap:wrap}
      .metric-chip,.tag,.status-pill{max-width:100%;overflow-wrap:anywhere}
      input,select,textarea{max-width:100%}
      .plan-config label,.plan-config-grid>*{min-width:0!important}
      .plan-config select,.plan-config input{width:100%!important;min-width:0!important;max-width:100%!important}
      .settings-card input,.register-form input,.form-card input,.form-card select{min-width:0!important;max-width:100%!important}
      .admin-actions,.discipline-actions,.hy-actions,.question-actions{min-width:0}
      .admin-actions .btn,.discipline-actions .btn,.hy-actions .btn,.question-actions .btn{max-width:100%;white-space:normal;text-align:center}
      img,video,canvas{max-width:100%;height:auto}

      /* conteúdo jurídico largo permanece integral, mas não estoura a página */
      #readerArticle{min-width:0;max-width:100%}
      #readerArticle table{display:block;max-width:100%;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;border-collapse:collapse}
      #readerArticle pre{max-width:100%;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere}
      #readerArticle code{overflow-wrap:anywhere;word-break:normal}
      #readerArticle blockquote{max-width:100%;overflow-wrap:anywhere}

      /* ---------- modo foco: centralização no viewport real ---------- */
      body.v26-focus .main-area{
        margin-left:0!important;width:100%!important;max-width:none!important;min-width:0!important;padding:0!important
      }
      body.v26-focus .content{
        width:100%!important;max-width:none!important;margin:0 auto!important;
        padding:12px clamp(16px,3vw,34px) 118px!important;box-sizing:border-box!important
      }
      body.v26-focus .v26-reader-shell{
        width:100%!important;max-width:1120px!important;margin:0 auto!important;padding-bottom:120px!important
      }
      body.v26-focus .v26-reading-stage{width:100%!important;max-width:none!important;justify-content:center!important;margin:0 auto!important}
      body.v26-focus .v26-reading-stage #readerArticle{
        width:min(100%,1000px)!important;max-width:1000px!important;margin:0 auto!important;
        padding:54px clamp(28px,4.6vw,68px) 154px!important;box-sizing:border-box!important
      }
      body.v26-focus .v26-focus-exit{
        top:max(12px,env(safe-area-inset-top))!important;right:max(14px,env(safe-area-inset-right))!important
      }
      body.v26-focus .v18-highlight-dock,body.v26-focus .v17-highlight-dock,body.v26-focus .v15-floating-highlighter{
        right:clamp(12px,2vw,26px)!important;max-width:min(340px,calc(100vw - 24px))!important;box-sizing:border-box!important
      }

      /* ---------- breakpoint intermediário: sidebar ainda existe ---------- */
      @media(max-width:1180px){
        .question-layout{grid-template-columns:minmax(0,1fr)!important}
        .question-side{grid-template-columns:repeat(2,minmax(0,1fr))!important}

        .plan-options{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        .plan-config-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        .plan-dashboard{grid-template-columns:minmax(0,1fr)!important}

        .highyield-hero{grid-template-columns:minmax(0,1fr)!important}
        .hy-card{grid-template-columns:auto minmax(0,1fr)!important}
        .hy-actions{grid-column:2!important;justify-content:flex-start!important}

        .platform-rank-head{display:none!important}
        .platform-rank-row{
          grid-template-columns:42px minmax(0,1fr) auto!important;
          grid-template-areas:'pos user level' 'pos time q'!important;
          gap:4px 8px!important
        }
        .platform-rank-pos{grid-area:pos!important}
        .platform-rank-user{grid-area:user!important}
        .platform-rank-row>div:nth-child(3){grid-area:level!important}
        .platform-rank-row>div:nth-child(4){grid-area:time!important;color:var(--muted);font-size:var(--t-caption)}
        .platform-rank-row>div:nth-child(5){grid-area:q!important;color:var(--muted);font-size:var(--t-caption);text-align:right}

        .admin-user-head{display:none!important}
        .admin-user-row{grid-template-columns:minmax(0,1fr)!important;gap:8px!important;padding:16px!important}
        .admin-actions{justify-content:flex-start!important}
      }

      /* corrige o buraco de 901–980px do login antigo */
      @media(min-width:901px) and (max-width:980px){
        .login-v11{display:block!important;min-width:0!important}
        .login-showcase{min-height:auto!important;padding:24px 20px 32px!important;grid-template-rows:auto auto!important}
        .showcase-quote{display:none!important}
        .showcase-main{grid-template-columns:140px minmax(0,1fr)!important;gap:16px!important;align-items:end!important}
        .showcase-photo-wrap{height:235px!important}
        .showcase-story{padding:0!important;min-width:0!important}
        .showcase-story h1{font-size:var(--t-h3)!important;margin-bottom:10px!important;overflow-wrap:anywhere}
        .showcase-story p{display:none!important}
        .login-form-v11{padding:20px 16px!important}
        .login-card-v11{max-width:520px!important;margin:0 auto!important}
      }

      @media(max-width:860px){
        body.v26-focus .content{padding-left:0!important;padding-right:0!important}
        body.v26-focus .v26-reader-shell{max-width:none!important;padding-bottom:100px!important}
        body.v26-focus .v26-reading-stage #readerArticle{
          max-width:100%!important;border-radius:0!important;border-left:0!important;border-right:0!important;
          box-shadow:none!important;padding:34px 18px 142px!important
        }
        body.v26-focus .v26-focus-exit{min-width:44px;min-height:44px;padding:0 12px!important}
      }

      @media(max-width:700px){
        .plan-config-grid{grid-template-columns:minmax(0,1fr)!important}
      }

      @media(max-width:620px){
        .plan-options{grid-template-columns:minmax(0,1fr)!important}
        .hy-actions{grid-column:1/-1!important}
        .platform-rank-user b,.platform-rank-user small,.admin-user-name b,.admin-user-name small{overflow-wrap:anywhere!important}
        .toast-root{right:12px!important;left:auto!important;max-width:calc(100vw - 24px)!important}
        .toast{max-width:100%!important;overflow-wrap:anywhere!important}
        .modal-head{flex-wrap:wrap!important;min-width:0!important}
        .modal-head h3{min-width:0;max-width:100%;overflow-wrap:anywhere}
      }

      @media(max-width:560px){
        .question-side{grid-template-columns:minmax(0,1fr)!important}
      }

      @media(max-width:390px){
        body.v26-focus .v26-reading-stage #readerArticle{padding-left:15px!important;padding-right:15px!important}
        .platform-rank-row{grid-template-columns:34px minmax(0,1fr) auto!important;padding-left:10px!important;padding-right:10px!important}
      }
    `;
    document.head.appendChild(s);
  }

  installStyles();
  document.documentElement.dataset.oabVersion=String(VERSION);
  window.OAB_V29={version:VERSION,installStyles};
  console.info('OAB Focus SUPER v29 ativo');
})();
