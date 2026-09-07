/* OAB Focus SUPER v28
   Leitor resiliente: toolbar responsiva, breadcrumb semântico, títulos adaptativos,
   saneamento de headings tabulares de PDF e distinção explícita entre conclusão e domínio.
*/
(() => {
  'use strict';

  const VERSION = 28;
  const state = {observer:null,scheduled:false,patchedExtract:false};
  const esc28 = value => typeof esc==='function' ? esc(String(value??'')) : String(value??'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const clean28 = value => String(value||'').replace(/^\d+(?:\.\d+){0,4}[\.)]?\s+/,'').replace(/\s+/g,' ').trim();
  const slug28 = value => typeof slug==='function' ? slug(String(value||'')) : String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

  function installStyles(){
    if(document.getElementById('v28Styles')) return;
    const s=document.createElement('style');
    s.id='v28Styles';
    s.textContent=`
      :root{--v28-reader-max:1120px;--v28-prose:76ch}
      body.v26-reader-active{overflow-x:hidden!important}
      body.v26-reader-active .content{padding-left:clamp(12px,2vw,30px)!important;padding-right:clamp(12px,2vw,30px)!important}
      .v26-reader-shell{max-width:1380px!important;padding-bottom:128px!important}
      .v26-reader-toolbar{position:sticky!important;top:0!important;z-index:80!important;display:grid!important;grid-template-columns:auto minmax(0,1fr) auto!important;align-items:center!important;gap:10px!important;min-width:0!important;padding:10px 12px!important;overflow:visible!important}
      .v26-toolbar-left{display:flex!important;align-items:center!important;min-width:0!important;flex-wrap:nowrap!important}
      .v26-toolbar-left .v26-toolbar-crumb{display:none!important}
      .v28-toolbar-primary{display:flex;align-items:center;justify-content:flex-end;gap:4px;min-width:0;overflow:hidden}
      .v28-toolbar-primary .v26-toolbar-btn{flex:0 0 auto;white-space:nowrap;padding-inline:9px}
      .v28-reading-toggle{display:inline-flex;align-items:center;gap:6px;min-height:38px;border:1px solid var(--line);border-radius:10px;background:var(--surface,#fff);color:var(--ink);padding:0 11px;font:inherit;font-size:.72rem;font-weight:850;cursor:pointer;white-space:nowrap}
      .v28-reading-toggle:after{content:'⌄';font-size:.72rem;color:var(--muted);transition:transform .18s ease}.v28-reading-toggle[aria-expanded="true"]:after{transform:rotate(180deg)}
      .v28-reading-panel{position:absolute;right:12px;top:calc(100% + 7px);z-index:95;width:min(280px,calc(100vw - 24px));display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px;border:1px solid var(--line);border-radius:14px;background:var(--surface,#fff);box-shadow:0 18px 44px rgba(15,23,42,.16)}
      .v28-reading-panel[hidden]{display:none!important}.v28-reading-panel .v26-toolbar-btn{display:flex;align-items:center;justify-content:center;min-height:42px;border:1px solid var(--line);background:var(--surface-2,#f6f8fb);color:var(--ink)}
      .v26-reading-stage{min-width:0!important}
      .v26-reading-stage #readerArticle{width:min(100%,var(--v28-reader-max))!important;max-width:var(--v28-reader-max)!important;padding:48px clamp(28px,4.2vw,66px) 150px!important;min-width:0!important;box-sizing:border-box!important}
      .v26-reading-stage .v18-doc-header,.v26-reading-stage .study-zone,.v26-reading-stage .v16-reader-end,.v26-reading-stage .v20-practice-shell{max-width:100%!important}
      .v26-reading-stage .integral-body p,.v26-reading-stage .integral-body li,.v26-reading-stage .primary-material p,.v26-reading-stage .primary-material li{max-width:var(--v28-prose)!important;line-height:1.88!important}
      .v28-breadcrumb{display:block;max-width:100%;margin:0 0 26px;color:var(--muted);font-size:.72rem}
      .v28-breadcrumb ol{display:flex;align-items:center;gap:7px;min-width:0;list-style:none;padding:0;margin:0;overflow:hidden}
      .v28-breadcrumb li{display:flex;align-items:center;gap:7px;min-width:0;flex:0 1 auto}.v28-breadcrumb li:after{content:'›';color:var(--line-strong,#aab2bf);flex:none}.v28-breadcrumb li:last-child:after{display:none}
      .v28-breadcrumb button,.v28-breadcrumb [aria-current="page"]{min-width:0;max-width:34ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:0;background:transparent;padding:0;color:inherit;font:inherit;font-weight:760;text-align:left}
      .v28-breadcrumb button{cursor:pointer}.v28-breadcrumb [aria-current="page"]{color:var(--ink);font-weight:850}
      #readerArticle .v18-doc-header h1,#readerArticle h1{max-width:22ch!important;text-wrap:balance;overflow-wrap:anywhere;word-break:normal;hyphens:auto}
      #readerArticle h1.v28-title-long{max-width:27ch!important;font-size:clamp(2.25rem,4.3vw,3.9rem)!important;line-height:.99!important;letter-spacing:-.045em!important;text-wrap:balance}
      #readerArticle h1.v28-title-very-long{max-width:34ch!important;font-size:clamp(1.9rem,3.55vw,3.15rem)!important;line-height:1.03!important;letter-spacing:-.035em!important;text-wrap:pretty}
      #readerArticle .v18-doc-header p{max-width:var(--v28-prose)!important}
      html{scroll-padding-top:96px;scroll-padding-bottom:150px}
      body.v26-reader-active #readerArticle{scroll-margin-bottom:150px}
      body.v26-reader-active .v18-highlight-dock,body.v26-reader-active .v17-highlight-dock,body.v26-reader-active .v15-floating-highlighter{max-width:min(360px,calc(100vw - 24px))!important;box-sizing:border-box!important}
      .v28-learning-bridge{margin:12px 0 0;padding:13px 14px;border:1px solid var(--line);border-radius:13px;background:color-mix(in srgb,var(--surface-2,#f5f7fa) 88%,transparent);color:var(--muted);font-size:.7rem;line-height:1.55}
      .v28-learning-bridge b{display:block;color:var(--ink);font-size:.74rem;margin-bottom:3px}.v28-learning-bridge strong{color:var(--ink)}
      .v26-toolbar-btn:focus-visible,.v28-reading-toggle:focus-visible,.v28-breadcrumb button:focus-visible,.v26-internal-back:focus-visible,[data-v27-unit-open]:focus-visible,[data-v27-unit-questions]:focus-visible{outline:3px solid color-mix(in srgb,var(--brand,#2458d3) 58%,transparent)!important;outline-offset:2px!important}
      @media(max-width:1080px){
        .v28-toolbar-primary{gap:1px}.v28-toolbar-primary .v26-toolbar-btn{padding-inline:7px;font-size:.7rem}.v28-reading-toggle{padding-inline:9px}
        .v26-reading-stage #readerArticle{--v28-reader-max:1060px}
      }
      @media(max-width:760px){
        body.v26-reader-active .content{padding-left:0!important;padding-right:0!important}
        .v26-reader-shell{max-width:none!important}
        .v26-reader-toolbar{grid-template-columns:minmax(0,1fr) auto!important;grid-template-areas:'back settings' 'primary primary';gap:7px 8px!important;padding:8px 10px 9px!important;border-radius:0!important;margin-bottom:0!important}
        .v26-toolbar-left{grid-area:back}.v28-reading-toggle{grid-area:settings;justify-self:end}.v28-toolbar-primary{grid-area:primary;justify-content:flex-start;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;padding-bottom:1px}.v28-toolbar-primary::-webkit-scrollbar{display:none}
        .v28-toolbar-primary .v26-toolbar-btn{min-height:36px;padding:0 10px}
        .v28-reading-panel{right:10px;top:52px}
        .v26-reading-stage #readerArticle{max-width:100%!important;border-radius:0!important;border-left:0!important;border-right:0!important;box-shadow:none!important;padding:30px 18px 138px!important}
        .v28-breadcrumb{margin-bottom:20px;padding:0}.v28-breadcrumb ol{gap:5px}.v28-breadcrumb li{gap:5px}.v28-breadcrumb button,.v28-breadcrumb [aria-current="page"]{max-width:26ch}
        #readerArticle h1.v28-title-long{font-size:clamp(2rem,9vw,2.75rem)!important;max-width:100%!important}
        #readerArticle h1.v28-title-very-long{font-size:clamp(1.75rem,7.7vw,2.35rem)!important;max-width:100%!important;line-height:1.05!important}
        body.v26-reader-active .v18-highlight-dock,body.v26-reader-active .v17-highlight-dock,body.v26-reader-active .v15-floating-highlighter{right:12px!important;left:12px!important;width:auto!important;max-width:none!important;bottom:10px!important}
      }
      @media(max-width:380px){
        .v26-toolbar-btn.back{padding-inline:10px!important}.v28-reading-toggle{font-size:0;padding-inline:10px}.v28-reading-toggle:before{content:'Aa';font-size:.74rem}.v28-toolbar-primary .v26-toolbar-btn{padding-inline:8px;font-size:.68rem}
        .v26-reading-stage #readerArticle{padding-left:15px!important;padding-right:15px!important}.v28-breadcrumb [aria-current="page"]{max-width:19ch}
      }
    `;
    document.head.appendChild(s);
  }

  function isArtifactRawLine(raw=''){
    const line=String(raw||'').replace(/\t/g,'        ').trim();
    if(!line) return false;
    if(/\.{5,}\s*\d+\s*$/.test(line)) return true; // linha de sumário com pontilhado e página
    const gaps=line.match(/\S\s{5,}\S/g)||[];
    if(gaps.length>=1 && line.length>=34) return true; // colunas de tabela extraídas do PDF
    return false;
  }

  function isArtifactHeading(value=''){
    const n=clean28(value).toUpperCase();
    if(!n) return false;
    if(/STATUS DE EMENDA/.test(n) && /STATUS DE NORMA SUPRALEGAL/.test(n)) return true;
    if(/^TEMAS A SEREM (REVISADOS|REVISADOS IMPORTANTES|IMPORTANTES)/.test(n)) return true;
    if(/^ARTIGOS MAIS\s+(IMPORTANTES|COBRADOS)/.test(n)) return true;
    if(/^CHECK$/.test(n)) return true;
    return false;
  }

  function patchExtractSubtopics(){
    if(state.patchedExtract || typeof window.extractSubtopics!=='function') return;
    const base=window.extractSubtopics;
    window.extractSubtopics=function(text=''){
      const blocked=new Set();
      String(text||'').replace(/\r/g,'').split('\n').forEach(raw=>{
        if(isArtifactRawLine(raw)) blocked.add(clean28(raw).toUpperCase());
      });
      return (base(text)||[]).filter(st=>!blocked.has(clean28(st).toUpperCase()) && !isArtifactHeading(st));
    };
    state.patchedExtract=true;
  }

  function sanitizeReaderPayload(payload){
    if(!payload || typeof payload!=='object') return payload;
    const out={...payload};
    if(out.subtopicTitle && isArtifactHeading(out.subtopicTitle)) out.subtopicTitle='';
    return out;
  }

  function closeReadingPanel(toolbar,restoreFocus=false){
    const toggle=toolbar?.querySelector('[data-v28-reading-toggle]');
    const panel=toolbar?.querySelector('[data-v28-reading-panel]');
    if(!toggle||!panel) return;
    toggle.setAttribute('aria-expanded','false'); panel.hidden=true;
    if(restoreFocus) toggle.focus();
  }

  function enhanceToolbar(){
    const toolbar=document.querySelector('.v26-reader-toolbar');
    if(!toolbar || toolbar.dataset.v28Enhanced==='1') return toolbar;
    const left=toolbar.querySelector('.v26-toolbar-left');
    const actions=toolbar.querySelector('.v26-toolbar-actions');
    if(!left||!actions) return toolbar;
    left.querySelector('.v26-toolbar-crumb')?.remove();

    const primary=document.createElement('div'); primary.className='v28-toolbar-primary';
    [...actions.querySelectorAll('[data-v26-view]')].forEach(btn=>primary.appendChild(btn));
    const settings=[...actions.querySelectorAll('[data-v26-action="font-down"],[data-v26-action="font-up"],[data-v26-action="theme"],[data-v26-action="focus"]')];
    const toggle=document.createElement('button'); toggle.type='button'; toggle.className='v28-reading-toggle'; toggle.dataset.v28ReadingToggle='1'; toggle.setAttribute('aria-expanded','false');
    const panelId=`v28-reading-panel-${Math.random().toString(36).slice(2,8)}`; toggle.setAttribute('aria-controls',panelId); toggle.textContent='Leitura';
    const panel=document.createElement('div'); panel.className='v28-reading-panel'; panel.id=panelId; panel.dataset.v28ReadingPanel='1'; panel.hidden=true;
    settings.forEach(btn=>panel.appendChild(btn));
    actions.remove();
    toolbar.append(primary,toggle,panel);
    toggle.addEventListener('click',e=>{e.stopPropagation();const open=toggle.getAttribute('aria-expanded')==='true';closeReadingPanel(toolbar,false);if(!open){toggle.setAttribute('aria-expanded','true');panel.hidden=false;}});
    panel.addEventListener('click',e=>e.stopPropagation());
    document.addEventListener('click',()=>closeReadingPanel(toolbar,false),{passive:true});
    document.addEventListener('keydown',e=>{if(e.key==='Escape' && toggle.getAttribute('aria-expanded')==='true'){e.preventDefault();closeReadingPanel(toolbar,true);}});
    toolbar.dataset.v28Enhanced='1';
    return toolbar;
  }

  function buildBreadcrumb(){
    const article=window.OAB_V26?.readerSession?.article || document.getElementById('readerArticle');
    if(!article) return null;
    article.querySelectorAll('.v28-breadcrumb').forEach((n,i)=>{if(i)n.remove();});
    const existing=article.querySelector('.v28-breadcrumb'); if(existing) return existing;
    const old=article.querySelector('.trail'); old?.remove();
    const s=window.OAB_V26?.readerSession;
    const p=s?.payload || ((typeof routePayload!=='undefined'&&routePayload)||{});
    const ctx=s?.context||{};
    const discipline=ctx.discipline || p.discipline || '';
    const chapterTitle=ctx.chapter?.title || '';
    const sub=clean28(ctx.subtopic || p.subtopicTitle || '');
    const current=sub || clean28(ctx.title || chapterTitle || discipline || 'Leitura');
    const nav=document.createElement('nav'); nav.className='v28-breadcrumb'; nav.setAttribute('aria-label','Caminho do conteúdo');
    const items=[];
    if(discipline) items.push(`<li><button type="button" data-v28-crumb-disc>${esc28(discipline)}</button></li>`);
    if(chapterTitle && clean28(chapterTitle)!==current) items.push(`<li><button type="button" data-v28-crumb-chapter>${esc28(clean28(chapterTitle))}</button></li>`);
    items.push(`<li><span aria-current="page" title="${esc28(current)}">${esc28(current)}</span></li>`);
    nav.innerHTML=`<ol>${items.join('')}</ol>`;
    const header=article.querySelector('.v18-doc-header') || article.firstElementChild;
    if(header) header.insertBefore(nav,header.firstChild); else article.prepend(nav);
    nav.querySelector('[data-v28-crumb-disc]')?.addEventListener('click',()=>{if(typeof safeRoute==='function')safeRoute('study',{discipline});});
    nav.querySelector('[data-v28-crumb-chapter]')?.addEventListener('click',()=>{if(typeof safeRoute==='function')safeRoute('reader',{discipline,topicId:p.topicId,subtopicTitle:''});});
    return nav;
  }

  function decorateTitle(){
    const article=window.OAB_V26?.readerSession?.article || document.getElementById('readerArticle'); if(!article) return null;
    const h1=article.querySelector('.v18-doc-header h1,h1'); if(!h1) return null;
    h1.classList.remove('v28-title-long','v28-title-very-long');
    const text=clean28(h1.textContent||'');
    if(text.length>=88)h1.classList.add('v28-title-very-long');
    else if(text.length>=52)h1.classList.add('v28-title-long');
    return h1;
  }

  function adaptiveForCurrent(){
    try{
      const s=window.OAB_V26?.readerSession; const p=s?.payload||routePayload||{};
      if(!p?.discipline||!p?.topicId) return null;
      const key=`${p.discipline}|${p.topicId}|${p.subtopicTitle?slug28(clean28(p.subtopicTitle)):'__chapter__'}`;
      return progress?.adaptive?.micro?.[key]||null;
    }catch{return null;}
  }

  function addLearningBridge(){
    const gate=document.querySelector('.v27-progress-gate'); if(!gate || gate.querySelector('.v28-learning-bridge')) return;
    const adaptive=adaptiveForCurrent();
    const div=document.createElement('div'); div.className='v28-learning-bridge';
    if(adaptive && Number(adaptive.attempts||0)>=2){
      const nextAt=Number(adaptive.nextAt||0); let review='sem data definida';
      if(nextAt){const h=Math.max(0,Math.round((nextAt-Date.now())/3600000));review=h<24?`em cerca de ${Math.max(1,h)}h`:`em cerca de ${Math.max(1,Math.round(h/24))} dia${Math.round(h/24)===1?'':'s'}`;}
      div.innerHTML=`<b>Conclusão libera a trilha; domínio continua evoluindo.</b><span>Domínio adaptativo: <strong>${Math.max(0,Math.min(100,Math.round(Number(adaptive.mastery)||0)))}%</strong> · Fragilidade: <strong>${Math.max(0,Math.min(100,Math.round(Number(adaptive.fragility)||0)))}%</strong> · Revisão: ${esc28(review)}.</span>`;
    }else{
      div.innerHTML='<b>Conclusão e domínio são coisas diferentes.</b><span>Ao responder questões, o OAB Focus passa a acompanhar este conteúdo para revisão espaçada. Errar não trava a trilha; apenas antecipa a necessidade de revisar.</span>';
    }
    const actions=gate.querySelector('.v27-gate-actions'); if(actions) gate.insertBefore(div,actions); else gate.appendChild(div);
  }

  function enhanceReaderLayout(){
    installStyles(); patchExtractSubtopics();
    if(typeof route!=='undefined' && route!=='reader') return;
    enhanceToolbar(); buildBreadcrumb(); decorateTitle(); addLearningBridge();
  }

  function schedule(){
    if(state.scheduled) return; state.scheduled=true;
    requestAnimationFrame(()=>{state.scheduled=false;try{enhanceReaderLayout();}catch(e){console.warn('OAB v28 enhancement parcial',e);}});
  }

  // Saneia subassuntos tabulares antes que a rota do leitor seja persistida/aberta.
  const baseSetRoute28=window.setRoute;
  if(typeof baseSetRoute28==='function'){
    window.setRoute=function(r,payload=null){return baseSetRoute28(r,r==='reader'?sanitizeReaderPayload(payload):payload);};
  }
  const baseRenderReader28=window.renderReader;
  if(typeof baseRenderReader28==='function'){
    window.renderReader=function(payload){const clean=sanitizeReaderPayload(payload);const out=baseRenderReader28(clean);setTimeout(schedule,0);setTimeout(schedule,260);return out;};
  }
  const baseRenderStudy28=window.renderStudy;
  if(typeof baseRenderStudy28==='function'){
    window.renderStudy=function(payload){patchExtractSubtopics();const out=baseRenderStudy28(payload);setTimeout(schedule,0);return out;};
  }
  const baseRenderRoute28=window.renderRoute;
  if(typeof baseRenderRoute28==='function'){
    window.renderRoute=function(){const out=baseRenderRoute28();setTimeout(schedule,0);return out;};
  }

  function installObserver(){
    if(state.observer) return;
    const host=document.getElementById('content')||document.body;
    state.observer=new MutationObserver(schedule); state.observer.observe(host,{childList:true,subtree:true});
  }

  window.OAB_V28={version:VERSION,isArtifactRawLine,isArtifactHeading,sanitizeReaderPayload,enhanceToolbar,buildBreadcrumb,decorateTitle,enhanceReaderLayout,patchExtractSubtopics};
  installStyles(); patchExtractSubtopics(); installObserver(); schedule();
  document.documentElement.dataset.oabVersion=String(VERSION);
  console.info('OAB Focus SUPER v28 ativo');
})();
