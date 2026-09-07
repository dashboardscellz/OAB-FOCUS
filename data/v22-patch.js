/* OAB Focus SUPER v22
   Refino de largura/respiração do leitor e dos blocos estreitos.
*/
(() => {
  'use strict';
  function install(){
    if(document.getElementById('v22Styles')) return;
    const s=document.createElement('style');
    s.id='v22Styles';
    s.textContent=`
      :root{
        --v22-reader-column:84ch;
        --v22-reader-wide:92ch;
      }
      .content{max-width:1640px!important}
      body.v18-reader-active{--reader-width:var(--v22-reader-column)!important;--reader-text:18px!important}

      /* Leitor desktop mais amplo, com menos sensação de aperto */
      .v18-reader .v16-reader-grid{grid-template-columns:minmax(185px,220px) minmax(0,980px) minmax(175px,210px)!important;gap:34px!important;max-width:1450px!important}
      .v18-reader #readerArticle{max-width:980px!important;padding:44px 60px 62px!important}
      .v18-reader .study-zone,
      .v18-reader .primary-material,
      .v18-reader .v16-reader-end{max-width:var(--v22-reader-wide)!important}
      .v18-reader .study-zone-head{align-items:flex-start!important;gap:18px!important}
      .v18-reader .study-zone-head .btn{flex:0 0 auto;white-space:nowrap}
      .v18-reader .integral-section-head h2{font-size:1.78rem!important;line-height:1.18!important}
      .v18-reader .integral-body{font-size:18px!important;line-height:1.92!important}
      .v18-reader .integral-body p{max-width:74ch!important}
      .v18-doc-header h1{max-width:18ch!important}
      .v18-doc-header>p{max-width:72ch!important}
      .v18-doc-meta{display:flex!important;flex-wrap:wrap!important;gap:8px!important;max-width:78ch!important}

      /* cartão de fim de unidade mais largo e melhor distribuído */
      .v16-reader-end-card{padding:24px 26px!important;border-radius:20px!important}
      .v16-reader-end-card h3{font-size:1.38rem!important;line-height:1.2!important;max-width:22ch!important}
      .v16-reader-end-card p{max-width:60ch!important;line-height:1.65!important}
      .v16-end-actions{display:grid!important;grid-template-columns:minmax(220px,280px) minmax(220px,280px)!important;justify-content:flex-start!important;gap:12px!important;align-items:start!important}
      .v16-end-actions .btn{min-height:48px!important;padding-inline:16px!important;width:auto!important}
      .v16-prevnext{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:14px!important}
      .v16-prevnext .btn{min-height:72px!important;padding:12px 14px!important}
      .v16-prevnext .btn small{display:block;line-height:1.35!important;white-space:normal!important}

      /* Bloco de prática pós-leitura também mais confortável */
      .v20-practice-shell{max-width:var(--v22-reader-wide)!important}
      .v20-practice-head{padding:20px 20px 12px!important}
      .v20-practice-head p{max-width:70ch!important;font-size:.84rem!important}
      .v20-practice-list{grid-template-columns:1fr 1fr!important;gap:12px!important}
      .v20-practice-card b{font-size:.95rem!important;line-height:1.55!important}
      .v20-practice-actions{gap:12px!important}
      .v20-practice-actions .btn{min-height:46px!important}

      /* Sessão contextual de questões: cabeçalho menos apertado */
      .v21-context-shell{max-width:1180px!important;margin:0 auto 18px!important}
      .v21-context-head{padding:22px 24px!important}
      .v21-context-head p{max-width:76ch!important}
      .v21-context-actions{align-items:center!important}

      @media (max-width:1280px){
        .v18-reader .v16-reader-grid{grid-template-columns:minmax(175px,210px) minmax(0,920px) minmax(170px,195px)!important;max-width:1360px!important;gap:28px!important}
        .v18-reader #readerArticle{max-width:920px!important;padding:40px 46px 56px!important}
        .v20-practice-list{grid-template-columns:1fr!important}
      }
      @media (max-width:980px){
        body.v18-reader-active{--reader-width:100%!important}
        .v18-reader #readerArticle{max-width:100%!important;padding:28px 24px 40px!important}
        .v18-reader .study-zone,
        .v18-reader .primary-material,
        .v18-reader .v16-reader-end,
        .v20-practice-shell{max-width:100%!important}
        .v16-end-actions{grid-template-columns:1fr!important}
      }
      @media (max-width:720px){
        .v18-reader #readerArticle{padding:24px 18px 34px!important}
        .v18-doc-header h1{max-width:100%!important;font-size:clamp(2.05rem,9vw,2.7rem)!important}
        .v18-doc-meta{max-width:100%!important}
        .v16-reader-end-card{padding:18px 16px!important}
        .v16-reader-end-card h3{max-width:100%!important;font-size:1.2rem!important}
        .v16-reader-end-card p{max-width:100%!important}
        .v16-prevnext{grid-template-columns:1fr!important}
        .v20-practice-head,.v20-practice-list,.v20-practice-actions,.v20-practice-note{padding-left:14px!important;padding-right:14px!important}
        .v21-context-head{padding:16px 16px!important}
      }
    `;
    document.head.appendChild(s);
  }
  const baseRenderRoute=renderRoute;
  renderRoute=function(){ install(); return baseRenderRoute(); };
  install();
  window.OAB_V22_ACTIVE=true;
})();
