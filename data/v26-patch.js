/* OAB Focus SUPER v26
   Leitor com uma tarefa por tela e views internas próprias.
*/
(() => {
  'use strict';

  const V26_VIEWS = new Set(['reading','index','study','highlights','notes']);
  const api = {
    readerSession: {
      payload: null,
      origin: null,
      view: 'reading',
      scrollAnchor: null,
      focusMode: false,
      context: null,
      article: null,
      shell: null,
      stage: null,
      pendingRestore: null,
      pendingQuestionOrigin: null
    },
    setView,
    returnToReading
  };

  const clone = value => value == null ? null : JSON.parse(JSON.stringify(value));
  const esc26 = value => typeof esc === 'function' ? esc(String(value ?? '')) : String(value ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const cleanTitle26 = value => String(value || '').replace(/^\d+(?:\.\d+){0,4}[\.)]?\s+/,'').replace(/\s+/g,' ').trim();
  const slug26 = value => typeof slug === 'function' ? slug(String(value || '')) : String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

  function installStyles(){
    if(document.getElementById('v26Styles')) return;
    const s=document.createElement('style');
    s.id='v26Styles';
    s.textContent=`
      body.v26-reader-active{overflow-x:hidden;background:var(--bg,var(--v20-bg,#f4f7fb))}
      body.v26-reader-active .content{max-width:none!important;width:100%!important;box-sizing:border-box!important;padding-left:clamp(14px,2.2vw,34px)!important;padding-right:clamp(14px,2.2vw,34px)!important}
      .v26-reader-shell{width:100%;max-width:1240px;margin:0 auto;padding-bottom:110px}
      .v26-reader-toolbar{position:sticky;top:0;z-index:60;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px 12px;margin:0 0 18px;border:1px solid var(--line);border-radius:16px;background:color-mix(in srgb,var(--surface,#fff) 95%,transparent);backdrop-filter:blur(14px);box-shadow:0 10px 30px rgba(15,23,42,.05)}
      .v26-toolbar-left,.v26-toolbar-actions{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}
      .v26-toolbar-crumb{font-size:.72rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:min(42vw,540px)}
      .v26-toolbar-btn{border:0;background:transparent;color:var(--muted);min-height:38px;padding:0 10px;border-radius:10px;font:inherit;font-size:.74rem;font-weight:800;cursor:pointer}
      .v26-toolbar-btn:hover,.v26-toolbar-btn[aria-current="page"]{background:var(--surface-2,#f3f6fa);color:var(--ink)}
      .v26-toolbar-btn.back{background:var(--brand,#2458d3);color:#fff;padding-inline:14px}
      .v26-reading-stage{width:100%;display:flex;justify-content:center}
      .v26-reading-stage #readerArticle{width:min(100%,980px)!important;max-width:980px!important;margin:0 auto!important;padding:44px clamp(30px,4.5vw,62px) 62px!important}
      .v26-reading-stage .v18-doc-header,.v26-reading-stage .study-zone,.v26-reading-stage .v16-reader-end,.v26-reading-stage .v20-practice-shell{max-width:84ch!important;margin-left:auto!important;margin-right:auto!important}
      .v26-reading-stage .integral-body p{max-width:80ch!important}
      .v26-reader-shell .v16-reader-toc,.v26-reader-shell .v16-reader-status,.v26-reader-shell .v16-reader-grid>.v16-reader-toc,.v26-reader-shell .v16-reader-grid>.v16-reader-status{display:none!important}
      .v26-internal-view{width:min(100%,1120px);margin:0 auto;padding:8px 0 70px}
      .v26-internal-top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px}
      .v26-internal-back{min-height:42px;border:1px solid var(--line);background:var(--surface,#fff);color:var(--ink);border-radius:12px;padding:0 14px;font:inherit;font-weight:800;cursor:pointer}
      .v26-internal-hero{padding:24px 0 20px;border-bottom:1px solid var(--line);margin-bottom:18px}
      .v26-internal-hero .eyebrow{color:var(--brand);font-size:.66rem;font-weight:900;letter-spacing:.14em}
      .v26-internal-hero h2{font-size:clamp(2rem,4vw,3rem);line-height:1.02;letter-spacing:-.045em;margin:8px 0 10px}
      .v26-internal-hero p{max-width:72ch;color:var(--muted);line-height:1.65;margin:0}
      .v26-index-list{display:grid;gap:12px}
      .v26-index-chapter{border:1px solid var(--line);border-radius:16px;background:var(--surface,#fff);padding:16px}
      .v26-index-chapter>button{width:100%;border:0;background:transparent;text-align:left;color:var(--ink);font:inherit;font-weight:850;font-size:1rem;padding:0;cursor:pointer}
      .v26-index-subs{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px;margin-top:12px}
      .v26-index-subs button{min-height:44px;border:1px solid var(--line);border-radius:12px;background:var(--surface-2,#f7f9fc);color:var(--muted);font:inherit;text-align:left;padding:9px 11px;cursor:pointer}
      .v26-index-subs button.current{border-color:color-mix(in srgb,var(--brand) 45%,var(--line));background:color-mix(in srgb,var(--brand) 9%,var(--surface));color:var(--brand);font-weight:850}
      .v26-study-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
      .v26-study-card{min-width:260px;min-height:148px;border:1px solid var(--line);border-radius:18px;background:var(--surface,#fff);padding:18px;display:flex;flex-direction:column;gap:7px}
      .v26-study-card small{color:var(--muted);font-size:.7rem;font-weight:760}
      .v26-study-card strong{font-size:1.65rem;line-height:1;color:var(--ink)}
      .v26-study-card p{margin:0;color:var(--muted);font-size:.78rem;line-height:1.5}
      .v26-study-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
      .v26-study-actions .btn{min-height:46px}
      .v26-state-pill{display:inline-flex;align-items:center;align-self:flex-start;padding:6px 9px;border-radius:999px;background:var(--surface-2,#f5f7fa);color:var(--muted);font-size:.7rem;font-weight:850}
      .v26-state-pill.done{background:#eaf7ef;color:#287146}
      .v26-highlight-groups{display:grid;gap:18px}
      .v26-highlight-group{border:1px solid var(--line);border-radius:18px;background:var(--surface,#fff);padding:16px}
      .v26-highlight-group h3{margin:0 0 12px;font-size:1rem}
      .v26-highlight-list{display:grid;gap:10px}
      .v26-highlight-item{border:1px solid var(--line);border-radius:14px;padding:13px 14px;background:var(--surface-2,#f7f9fc)}
      .v26-highlight-item blockquote{margin:0 0 10px;font-size:.88rem;line-height:1.6;color:var(--ink)}
      .v26-highlight-actions{display:flex;gap:8px;flex-wrap:wrap}
      .v26-highlight-actions button{min-height:38px;border:1px solid var(--line);border-radius:10px;background:var(--surface,#fff);padding:0 10px;font:inherit;font-size:.72rem;font-weight:800;cursor:pointer}
      .v26-notes-shell{display:grid;grid-template-columns:minmax(280px,1.05fr) minmax(280px,.95fr);gap:18px}
      .v26-note-editor,.v26-note-list{border:1px solid var(--line);border-radius:18px;background:var(--surface,#fff);padding:18px}
      .v26-note-editor textarea{width:100%;min-height:210px;resize:vertical;border:1px solid var(--line);border-radius:14px;padding:12px;background:var(--surface-2,#f7f9fc);color:var(--ink);font:inherit;line-height:1.55}
      .v26-note-editor .btn{margin-top:10px}
      .v26-note-list-items{display:grid;gap:10px;margin-top:12px}
      .v26-note-item{border:1px solid var(--line);border-radius:13px;padding:12px;background:var(--surface-2,#f7f9fc)}
      .v26-note-item p{margin:0 0 8px;white-space:pre-wrap;color:var(--ink);line-height:1.55}
      body.v26-focus .sidebar,body.v26-focus .topbar,body.v26-focus .bottom-nav,body.v26-focus .v26-reader-toolbar,body.v26-focus .v24-focus-exit,body.v26-focus .v24-focus-progress{display:none!important}
      body.v26-focus .content{max-width:none!important;padding:12px 0 100px!important}
      body.v26-focus .v26-reader-shell{max-width:1060px!important}
      body.v26-focus .v26-reading-stage #readerArticle{width:min(100%,1000px)!important;max-width:1000px!important;padding-top:54px!important}
      body.v26-internal-active .v18-highlight-dock,body.v26-internal-active .v17-highlight-dock,body.v26-internal-active .v15-floating-highlighter,body.v26-internal-active .v18-highlight-palette,body.v26-internal-active .v17-selection-palette,body.v26-internal-active .v16-selection-tools{display:none!important;visibility:hidden!important;pointer-events:none!important}
      body.v26-focus .v18-highlight-dock,body.v26-focus .v17-highlight-dock,body.v26-focus .v15-floating-highlighter{display:flex!important;visibility:visible!important}
      .v26-focus-exit{display:none;position:fixed;top:14px;right:14px;z-index:220;min-height:42px;border:1px solid var(--line);border-radius:999px;background:color-mix(in srgb,var(--surface,#fff) 94%,transparent);backdrop-filter:blur(12px);color:var(--ink);padding:0 14px;font:inherit;font-size:.74rem;font-weight:850;cursor:pointer;box-shadow:0 12px 32px rgba(15,23,42,.10)}
      body.v26-focus .v26-focus-exit{display:inline-flex;align-items:center}
      .v26-focus-progress{display:none;position:fixed;left:0;right:0;top:0;height:3px;z-index:221;background:transparent}
      body.v26-focus .v26-focus-progress{display:block}
      .v26-focus-progress i{display:block;width:0;height:100%;background:var(--brand,#2458d3)}
      @media(max-width:800px){
        body.v26-reader-active .content{padding-left:0!important;padding-right:0!important}
        .v26-reader-shell{max-width:none}
        .v26-reader-toolbar{top:0;border-radius:0;margin-bottom:0;padding:9px 10px;overflow-x:auto;scrollbar-width:none}
        .v26-reader-toolbar::-webkit-scrollbar{display:none}
        .v26-toolbar-crumb{display:none}
        .v26-toolbar-actions{flex-wrap:nowrap;min-width:max-content}
        .v26-reading-stage #readerArticle{max-width:100%!important;border-radius:0!important;border-left:0!important;border-right:0!important;padding:28px 17px 44px!important;box-shadow:none!important}
        .v26-study-grid,.v26-notes-shell{grid-template-columns:1fr!important}
        .v26-study-card{min-width:0}
      }
    `;
    document.head.appendChild(s);
  }

  function inferContext(payload){
    const p=payload || routePayload || {};
    const discipline=String(p.discipline || '');
    let chapter=null, unit=null;
    try{
      const d=typeof findDiscipline==='function' ? findDiscipline(discipline) : null;
      unit=d && typeof resolveStudyUnit==='function' ? resolveStudyUnit(d.name,p.topicId) : null;
      chapter=unit?.chapter || (typeof disciplineChapters==='function' ? disciplineChapters(discipline).find(c=>c.id===p.topicId) : null) || null;
    }catch{}
    const title=document.querySelector('#readerArticle .v18-doc-header h1,#readerArticle h1')?.textContent?.trim() || cleanTitle26(p.subtopicTitle || chapter?.title || unit?.title || discipline || 'Leitura');
    const trail=document.querySelector('#readerArticle .trail')?.textContent?.trim() || [discipline,chapter?.title,p.subtopicTitle].filter(Boolean).join(' › ');
    return {discipline,chapter,unit,subtopic:String(p.subtopicTitle||'').trim(),title,trail,payload:clone(p)};
  }

  function rememberOrigin(){
    if(api.readerSession.origin) return;
    if(window.__prevRoute && window.__prevRoute.route && window.__prevRoute.route!=='reader') api.readerSession.origin=clone(window.__prevRoute);
    else api.readerSession.origin={route:'study',payload:{discipline:api.readerSession.context?.discipline||''}};
  }

  function makeToolbar(context){
    const bar=document.createElement('div');
    bar.className='v26-reader-toolbar';
    bar.innerHTML=`
      <div class="v26-toolbar-left">
        <button class="v26-toolbar-btn back" data-v26-action="back">← Voltar</button>
        <div class="v26-toolbar-crumb">${esc26(context.trail||context.title)}</div>
      </div>
      <div class="v26-toolbar-actions">
        <button class="v26-toolbar-btn" data-v26-view="index">Índice</button>
        <button class="v26-toolbar-btn" data-v26-view="study">Seu estudo</button>
        <button class="v26-toolbar-btn" data-v26-view="highlights">Grifos</button>
        <button class="v26-toolbar-btn" data-v26-view="notes">Anotações</button>
        <button class="v26-toolbar-btn" data-v26-action="font-down">A−</button>
        <button class="v26-toolbar-btn" data-v26-action="font-up">A+</button>
        <button class="v26-toolbar-btn" data-v26-action="theme" aria-label="Alternar tema">◐</button>
        <button class="v26-toolbar-btn" data-v26-action="focus">Foco</button>
      </div>`;
    return bar;
  }

  function makeQuestionOrigin(){
    return {
      payload: clone(api.readerSession.payload || routePayload || {}),
      scrollAnchor: clone(api.readerSession.scrollAnchor || captureReaderPosition()),
      at: Date.now()
    };
  }

  function stampQuestionOrigin(origin){
    if(typeof qFilters==='object'&&qFilters){
      qFilters.studyContext=qFilters.studyContext||{};
      qFilters.studyContext.readerOrigin=clone(origin);
    }
  }

  function bindQuestionLaunchOrigin(){
    const article=api.readerSession.article; if(!article)return;
    article.querySelectorAll('#topicQuestions,#v16EndQuestions').forEach(btn=>{
      if(btn.dataset.v26OriginBound)return; btn.dataset.v26OriginBound='1';
      btn.addEventListener('click',()=>{
        const origin=makeQuestionOrigin();
        api.readerSession.pendingQuestionOrigin=origin;
        setTimeout(()=>{stampQuestionOrigin(origin);bindQuestionBackOverride();},0);
      },true);
    });
  }

  function bindQuestionBackOverride(){
    const origin=qFilters?.studyContext?.readerOrigin || api.readerSession.pendingQuestionOrigin;
    if(!origin)return;
    const btn=document.getElementById('v21BackToMaterial');
    if(!btn||btn.dataset.v26BackBound)return; btn.dataset.v26BackBound='1';
    btn.addEventListener('click',e=>{
      e.preventDefault();e.stopImmediatePropagation();
      api.readerSession.pendingRestore=clone(origin.scrollAnchor);
      if(typeof safeRoute==='function')safeRoute('reader',clone(origin.payload));
    },true);
  }

  function mountReadingView(payload){
    if(typeof route!=='undefined' && route!=='reader') return;
    const article=document.getElementById('readerArticle');
    if(!article) return;
    installStyles();
    api.readerSession.payload=clone(payload || routePayload || {});
    api.readerSession.context=inferContext(payload);
    api.readerSession.article=article;
    api.readerSession.view='reading';
    rememberOrigin();

    const host=document.getElementById('content') || (typeof content!=='undefined' ? content : null);
    if(!host) return;
    article.remove();
    host.innerHTML='';
    const shell=document.createElement('section'); shell.className='v26-reader-shell';
    const toolbar=makeToolbar(api.readerSession.context);
    const stage=document.createElement('div'); stage.className='v26-reading-stage';
    stage.appendChild(article); shell.append(toolbar,stage); host.appendChild(shell);
    api.readerSession.shell=shell; api.readerSession.stage=stage;
    document.body.classList.add('v26-reader-active');
    document.querySelectorAll('.v16-reader-toc,.v16-reader-status').forEach(el=>el.remove());
    bindToolbar();
    bindQuestionLaunchOrigin();
    if(api.readerSession.pendingRestore){
      api.readerSession.scrollAnchor=clone(api.readerSession.pendingRestore);
      api.readerSession.pendingRestore=null;
      restoreReaderPosition(api.readerSession.scrollAnchor);
    }
  }

  function changeFont(delta){
    progress.readerPrefs=progress.readerPrefs||{};
    const next=Math.max(.88,Math.min(1.22,Number(progress.readerPrefs.fontScale||1)+delta));
    progress.readerPrefs.fontScale=Math.round(next*100)/100;
    document.documentElement.style.setProperty('--v26-font-scale',String(progress.readerPrefs.fontScale));
    document.body.style.setProperty('--v16-font-scale',String(progress.readerPrefs.fontScale));
    try{markDirty();}catch{}
  }

  function toggleTheme(){
    const legacy=document.getElementById('v19ThemeToggle');
    if(legacy){legacy.click();return;}
    const dark=document.documentElement.dataset.theme==='dark';
    document.documentElement.dataset.theme=dark?'light':'dark';
    document.body.classList.toggle('v16-reader-dark',!dark);
    try{localStorage.setItem('oab_focus_theme_v19',dark?'light':'dark');}catch{}
  }

  function ensureFocusUI(){
    let exit=document.querySelector('.v26-focus-exit');
    if(!exit){exit=document.createElement('button');exit.className='v26-focus-exit';exit.type='button';exit.textContent='← Sair do foco';exit.addEventListener('click',()=>setFocusMode(false));document.body.appendChild(exit);}
    let progressBar=document.querySelector('.v26-focus-progress');
    if(!progressBar){progressBar=document.createElement('div');progressBar.className='v26-focus-progress';progressBar.innerHTML='<i></i>';document.body.appendChild(progressBar);}
  }

  function updateFocusProgress(){
    if(!api.readerSession.focusMode)return; const article=api.readerSession.article,bar=document.querySelector('.v26-focus-progress i');if(!article||!bar)return;
    const top=window.scrollY+article.getBoundingClientRect().top,total=Math.max(1,article.scrollHeight-window.innerHeight*.45),read=window.scrollY+window.innerHeight*.25-top;
    bar.style.width=Math.max(0,Math.min(100,Math.round(read/total*100)))+'%';
  }

  function setFocusMode(on){
    const active=!!on && api.readerSession.view==='reading' && (typeof route==='undefined'||route==='reader');
    api.readerSession.focusMode=active; ensureFocusUI();
    document.body.classList.toggle('v26-focus',active);
    document.body.classList.remove('v24-focus','v17-focus','v16-focus','focus-mode');
    if(active){window.addEventListener('scroll',updateFocusProgress,{passive:true});requestAnimationFrame(updateFocusProgress);}
    else{window.removeEventListener('scroll',updateFocusProgress);document.querySelector('.v26-focus-progress i')?.style.setProperty('width','0');}
  }

  function bindToolbar(){
    const shell=api.readerSession.shell; if(!shell) return;
    shell.querySelector('[data-v26-action="back"]')?.addEventListener('click',()=>{
      const origin=api.readerSession.origin;
      if(origin?.route && typeof safeRoute==='function') safeRoute(origin.route,clone(origin.payload));
      else if(typeof goBack==='function') goBack({route:'study',payload:{discipline:api.readerSession.context?.discipline||''}});
    });
    shell.querySelectorAll('[data-v26-view]').forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.v26View)));
    shell.querySelector('[data-v26-action="focus"]')?.addEventListener('click',()=>setFocusMode(!api.readerSession.focusMode));
    shell.querySelector('[data-v26-action="font-down"]')?.addEventListener('click',()=>changeFont(-.04));
    shell.querySelector('[data-v26-action="font-up"]')?.addEventListener('click',()=>changeFont(.04));
    shell.querySelector('[data-v26-action="theme"]')?.addEventListener('click',toggleTheme);
  }

  function captureReaderPosition(){
    const article=api.readerSession.article;
    if(!article) return null;
    const articleTop=window.scrollY+article.getBoundingClientRect().top;
    const max=Math.max(1,article.scrollHeight-window.innerHeight*.45);
    const ratio=Math.max(0,Math.min(1,(window.scrollY-articleTop)/max));
    const marker=window.scrollY+Math.min(window.innerHeight*.28,220);
    const candidates=[...article.querySelectorAll('[id],.integral-section,h2,h3')];
    let block=null,blockTop=articleTop;
    for(const el of candidates){
      const top=window.scrollY+el.getBoundingClientRect().top;
      if(top<=marker && top>=blockTop){ block=el; blockTop=top; }
    }
    let blockId='readerArticle';
    if(block){
      if(!block.id) block.id=`v26-anchor-${block.dataset.sectionKey||slug26(block.textContent||'section')||Math.random().toString(36).slice(2,7)}`;
      blockId=block.id;
    }
    return {ratio,blockId,blockOffset:window.scrollY-blockTop};
  }

  function restoreReaderPosition(anchor){
    if(!anchor) return;
    requestAnimationFrame(()=>{
      const article=api.readerSession.article; if(!article) return;
      const block=anchor.blockId?document.getElementById(anchor.blockId):null;
      if(block){
        const top=window.scrollY+block.getBoundingClientRect().top;
        window.scrollTo(0,Math.max(0,top+(Number(anchor.blockOffset)||0)));
        return;
      }
      const articleTop=window.scrollY+article.getBoundingClientRect().top;
      const max=Math.max(1,article.scrollHeight-window.innerHeight*.45);
      window.scrollTo(0,Math.max(0,articleTop+(Number(anchor.ratio)||0)*max));
    });
  }

  function clearInternalView(){
    api.readerSession.shell?.querySelector('.v26-internal-view')?.remove();
  }

  function internalFrame(view,label,title,description,bodyHtml){
    const node=document.createElement('section');
    node.className='v26-internal-view'; node.dataset.view=view;
    node.innerHTML=`<div class="v26-internal-top"><button class="v26-internal-back" data-v26-back-reading>← Voltar à leitura</button></div><header class="v26-internal-hero"><span class="eyebrow">${esc26(label)}</span><h2>${esc26(title)}</h2><p>${esc26(description)}</p></header>${bodyHtml}`;
    node.querySelector('[data-v26-back-reading]')?.addEventListener('click',returnToReading);
    return node;
  }

  function renderIndexView(){
    const ctx=api.readerSession.context || {};
    let chapters=[];
    try{ chapters=typeof disciplineChapters==='function' ? disciplineChapters(ctx.discipline) : []; }catch{}
    const currentChapter=ctx.chapter?.id || api.readerSession.payload?.topicId || '';
    const currentSub=cleanTitle26(ctx.subtopic || '');
    const body=`<div class="v26-index-list">${chapters.map(ch=>`<article class="v26-index-chapter"><button data-v26-open-chapter="${esc26(ch.id)}">${esc26(cleanTitle26(ch.title))}</button>${(ch.subtopics||[]).length?`<div class="v26-index-subs">${ch.subtopics.map(st=>`<button class="${ch.id===currentChapter&&cleanTitle26(st)===currentSub?'current':''}" data-v26-open-sub="${esc26(ch.id)}" data-subtopic="${esc26(st)}">${esc26(cleanTitle26(st))}</button>`).join('')}</div>`:''}</article>`).join('')}</div>`;
    const node=internalFrame('index','ÍNDICE DA MATÉRIA','Onde você está e o que vem depois','Navegue pela disciplina sem dividir espaço com o material de leitura.',body);
    node.querySelectorAll('[data-v26-open-chapter]').forEach(btn=>btn.addEventListener('click',()=>{
      if(typeof safeRoute==='function') safeRoute('reader',{discipline:ctx.discipline,topicId:btn.dataset.v26OpenChapter});
    }));
    node.querySelectorAll('[data-v26-open-sub]').forEach(btn=>btn.addEventListener('click',()=>{
      if(typeof safeRoute==='function') safeRoute('reader',{discipline:ctx.discipline,topicId:btn.dataset.v26OpenSub,subtopicTitle:btn.dataset.subtopic});
    }));
    return node;
  }

  function currentReaderKey(){
    const ctx=api.readerSession.context||{};
    const chapterId=ctx.chapter?.id || api.readerSession.payload?.topicId || ctx.unit?.id || 'reader';
    const id=ctx.subtopic ? `${chapterId}::${slug26(ctx.subtopic)}` : chapterId;
    try{ return typeof readerKey==='function' ? readerKey(ctx.discipline,id) : `${ctx.discipline}::${id}`; }catch{ return `${ctx.discipline}::${id}`; }
  }

  function currentQuestionIds(){
    const ctx=api.readerSession.context||{}, map=window.OAB_V16_QUESTION_MAP||{};
    const chapterId=ctx.chapter?.id || api.readerSession.payload?.topicId || ctx.unit?.id || '';
    const sub=ctx.subtopic?slug26(cleanTitle26(ctx.subtopic)):'';
    const ids=[];
    for(const [id,m] of Object.entries(map)){
      if(!m?.strict || m.discipline!==ctx.discipline || m.chapterId!==chapterId)continue;
      if(sub){
        if(!m.subtopicStrict)continue;
        if(slug26(cleanTitle26(m.subtopicTitle||''))!==sub)continue;
      }
      ids.push(id);
    }
    const prefix=`v20-auto-${slug26(ctx.discipline)}-${slug26(cleanTitle26(ctx.subtopic||ctx.chapter?.title||ctx.title||''))}-`;
    for(const id of Object.keys(progress.answers||{})){if(String(id).startsWith(prefix)&&!ids.includes(id))ids.push(id);}
    return ids;
  }

  function currentQuestionCount(){
    const text=api.readerSession.article?.querySelector('#topicQuestions,#v16EndQuestions')?.textContent||'';
    const m=text.match(/(\d+)/); return m?Number(m[1]):currentQuestionIds().length;
  }

  function readingPercent(){
    const article=api.readerSession.article; if(!article) return 0;
    const rect=article.getBoundingClientRect();
    const top=window.scrollY+rect.top;
    const total=Math.max(1,article.scrollHeight-window.innerHeight*.45);
    const read=window.scrollY+window.innerHeight*.25-top;
    return Math.max(0,Math.min(100,Math.round(read/total*100)));
  }

  function renderStudyView(){
    const ctx=api.readerSession.context||{}, key=currentReaderKey();
    progress.readerNotes=progress.readerNotes||{};
    const topicId=ctx.unit?.id || ctx.chapter?.id || api.readerSession.payload?.topicId;
    const tp=(progress.topics||{})[topicId]||{};
    const highlights=(progress.highlights||{})[key]||[];
    const qIds=currentQuestionIds(),qCount=Math.max(currentQuestionCount(),qIds.length);
    const answers=qIds.map(id=>(progress.answers||{})[id]).filter(Boolean);
    const correct=answers.filter(a=>a?.correct).length,wrong=answers.filter(a=>a&&!a.correct).length;
    const done=!!tp.completedAt;
    const adaptiveKey=`${ctx.discipline}|${ctx.chapter?.id||api.readerSession.payload?.topicId||ctx.unit?.id||''}|${ctx.subtopic?slug26(cleanTitle26(ctx.subtopic)):'__chapter__'}`;
    const adaptive=(progress.adaptive||{}).micro?.[adaptiveKey]||null;
    const adaptiveCard=adaptive&&Number(adaptive.attempts||0)>=3?`<article class="v26-study-card"><small>DOMÍNIO ADAPTATIVO</small><strong>${Math.max(0,Math.min(100,Math.round(Number(adaptive.mastery)||0)))}%</strong><p>Fragilidade ${Math.max(0,Math.min(100,Math.round(Number(adaptive.fragility)||0)))} · ${Number(adaptive.attempts)||0} tentativas acompanhadas.</p></article>`:'';
    const body=`<div class="v26-study-grid">
      <article class="v26-study-card"><small>PROGRESSO DE LEITURA</small><strong>${readingPercent()}%</strong><p>Percentual aproximado desta sessão de leitura.</p></article>
      <article class="v26-study-card"><small>TEMPO NESTA UNIDADE</small><strong>${Math.max(0,Math.round((tp.studySec||0)/60))} min</strong><p>Tempo ativo registrado para este conteúdo.</p></article>
      <article class="v26-study-card"><small>QUESTÕES DA UNIDADE</small><strong>${qCount}</strong><p>Prática vinculada ao conteúdo atual.</p></article>
      <article class="v26-study-card"><small>GRIFOS</small><strong>${highlights.length}</strong><p>Trechos salvos nesta unidade.</p></article>
      <article class="v26-study-card"><small>HISTÓRICO DE RESPOSTAS</small><strong>${correct}/${correct+wrong}</strong><p>${correct} acertos · ${wrong} erros no histórico atual.</p></article>
      <article class="v26-study-card"><small>ESTADO DA UNIDADE</small><span class="v26-state-pill ${done?'done':''}">${done?'✓ concluída':'em andamento'}</span><p>Conclusão manual preserva seu avanço no Prepare-se.</p></article>${adaptiveCard}
    </div><div class="v26-study-actions"><button class="btn primary" data-v26-complete>${done?'✓ Unidade estudada':'Marcar como estudada'}</button><button class="btn ghost" data-v26-unit-questions ${qCount?'':'disabled'}>Fazer questões desta unidade</button></div>`;
    const node=internalFrame('study','SEU ESTUDO',ctx.title||'Unidade atual','Acompanhe o estado desta unidade em uma tela própria, sem comprimir o material.',body);
    node.querySelector('[data-v26-complete]')?.addEventListener('click',()=>{
      const legacy=api.readerSession.article?.querySelector('#v18CompleteUnit') || api.readerSession.article?.querySelector('#v16CompleteUnit');
      if(legacy)legacy.click();
      progress.topics=progress.topics||{}; progress.topics[topicId]=progress.topics[topicId]||{};
      progress.topics[topicId].completedAt=Date.now(); progress.topics[topicId].lastAt=Date.now();
      try{ markDirty(); }catch{}
      renderInternalView('study');
    });
    node.querySelector('[data-v26-unit-questions]')?.addEventListener('click',()=>{
      const qbtn=api.readerSession.article?.querySelector('#topicQuestions,#v16EndQuestions');
      if(!qbtn)return;
      const origin=makeQuestionOrigin(); api.readerSession.pendingQuestionOrigin=origin;
      qbtn.click(); stampQuestionOrigin(origin); setTimeout(()=>bindQuestionBackOverride(),0);
    });
    return node;
  }

  function highlightItemsForCurrent(){
    const key=currentReaderKey();
    return {key,items:[...((progress.highlights||{})[key]||[])]};
  }

  function goToHighlight(item){
    const anchor={ratio:0,blockId:item.sectionKey||'',blockOffset:0};
    api.readerSession.scrollAnchor=anchor;
    returnToReading();
    requestAnimationFrame(()=>{
      const mark=api.readerSession.article?.querySelector(`[data-highlight-id="${String(item.id).replace(/"/g,'')}"]`);
      const target=mark || (item.sectionKey?document.querySelector(`[data-section-key="${String(item.sectionKey).replace(/"/g,'')}"]`):null);
      target?.scrollIntoView({block:'center'});
    });
  }

  function renderHighlightsView(){
    const ctx=api.readerSession.context||{}, data=highlightItemsForCurrent();
    const colors=[['yellow','Amarelos'],['green','Verdes'],['blue','Azuis'],['pink','Rosas'],['purple','Lilases'],['orange','Laranjas']];
    const body=`<div class="v26-highlight-groups">${colors.map(([color,label])=>{const list=data.items.filter(h=>(h.color||'yellow')===color);return `<section class="v26-highlight-group"><h3>${label} · ${list.length}</h3><div class="v26-highlight-list">${list.length?list.map(h=>`<article class="v26-highlight-item" data-highlight-id="${esc26(h.id)}"><blockquote>“${esc26(h.quote||'Trecho grifado')}”</blockquote><div class="v26-highlight-actions"><button data-v26-highlight-go="${esc26(h.id)}">Ir para este trecho</button><button data-v26-highlight-remove="${esc26(h.id)}">Remover</button></div></article>`).join(''):'<span class="muted">Nenhum grifo desta cor.</span>'}</div></section>`;}).join('')}</div>`;
    const node=internalFrame('highlights','GRIFOS DA UNIDADE',ctx.title||'Unidade atual','Revise os trechos que você destacou sem ocupar espaço permanente ao lado da leitura.',body);
    node.querySelectorAll('[data-v26-highlight-go]').forEach(btn=>btn.addEventListener('click',()=>{const h=data.items.find(x=>String(x.id)===btn.dataset.v26HighlightGo);if(h)goToHighlight(h);}));
    node.querySelectorAll('[data-v26-highlight-remove]').forEach(btn=>btn.addEventListener('click',()=>{
      progress.highlights=progress.highlights||{}; progress.highlights[data.key]=(progress.highlights[data.key]||[]).filter(h=>String(h.id)!==btn.dataset.v26HighlightRemove);
      try{markDirty();}catch{} renderInternalView('highlights');
    }));
    return node;
  }

  function unitNotes(){
    const key=currentReaderKey(); progress.readerNotes=progress.readerNotes||{}; progress.readerNotes[key]=progress.readerNotes[key]||[]; return {key,items:progress.readerNotes[key]};
  }

  function renderNotesView(){
    const ctx=api.readerSession.context||{}, data=unitNotes();
    const body=`<div class="v26-notes-shell"><section class="v26-note-editor"><h3>Nova anotação</h3><textarea data-v26-note-text placeholder="Escreva o que você não pode esquecer desta unidade…"></textarea><button class="btn primary" data-v26-note-save>Salvar anotação</button></section><section class="v26-note-list"><h3>Minhas anotações</h3><div class="v26-note-list-items">${data.items.length?data.items.map(n=>`<article class="v26-note-item" data-note-id="${esc26(n.id)}"><p>${esc26(n.text||'')}</p><div class="v26-highlight-actions"><button data-v26-note-edit="${esc26(n.id)}">Editar</button><button data-v26-note-remove="${esc26(n.id)}">Excluir</button></div></article>`).join(''):'<span class="muted">Nenhuma anotação nesta unidade.</span>'}</div></section></div>`;
    const node=internalFrame('notes','ANOTAÇÕES DA UNIDADE',ctx.title||'Unidade atual','Crie e revise notas do conteúdo atual em uma tela própria.',body);
    const textarea=node.querySelector('[data-v26-note-text]');
    node.querySelector('[data-v26-note-save]')?.addEventListener('click',()=>{const text=textarea?.value?.trim();if(!text)return;data.items.push({id:`n26-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,text,createdAt:Date.now()});try{markDirty();}catch{}renderInternalView('notes');});
    node.querySelectorAll('[data-v26-note-remove]').forEach(btn=>btn.addEventListener('click',()=>{progress.readerNotes[data.key]=data.items.filter(n=>String(n.id)!==btn.dataset.v26NoteRemove);try{markDirty();}catch{}renderInternalView('notes');}));
    node.querySelectorAll('[data-v26-note-edit]').forEach(btn=>btn.addEventListener('click',()=>{const note=data.items.find(n=>String(n.id)===btn.dataset.v26NoteEdit);if(!note)return;const edited=prompt('Editar anotação',note.text||'');if(edited==null)return;note.text=edited.trim();note.updatedAt=Date.now();try{markDirty();}catch{}renderInternalView('notes');}));
    return node;
  }

  function renderInternalView(view){
    clearInternalView();
    const shell=api.readerSession.shell,stage=api.readerSession.stage; if(!shell||!stage) return;
    const toolbar=shell.querySelector('.v26-reader-toolbar');
    stage.hidden=true; if(toolbar) toolbar.hidden=true;
    if(api.readerSession.article?.parentNode===stage) stage.removeChild(api.readerSession.article);
    document.body.classList.add('v26-internal-active');
    let node=null;
    if(view==='index') node=renderIndexView();
    else if(view==='study') node=renderStudyView();
    else if(view==='highlights') node=renderHighlightsView();
    else if(view==='notes') node=renderNotesView();
    if(node) shell.appendChild(node);
    window.scrollTo({top:0,behavior:'instant'});
  }

  function setView(view){
    if(!V26_VIEWS.has(view)) return;
    if(view==='reading'){ returnToReading(); return; }
    if(api.readerSession.view==='reading') api.readerSession.scrollAnchor=captureReaderPosition();
    if(api.readerSession.focusMode)setFocusMode(false);
    api.readerSession.view=view;
    renderInternalView(view);
  }

  function returnToReading(){
    const anchor=api.readerSession.scrollAnchor;
    api.readerSession.view='reading';
    document.body.classList.remove('v26-internal-active');
    clearInternalView();
    if(api.readerSession.stage){
      if(api.readerSession.article && api.readerSession.article.parentNode!==api.readerSession.stage) api.readerSession.stage.appendChild(api.readerSession.article);
      api.readerSession.stage.hidden=false;
    }
    const toolbar=api.readerSession.shell?.querySelector('.v26-reader-toolbar'); if(toolbar) toolbar.hidden=false;
    restoreReaderPosition(anchor);
  }

  const baseSetRoute26=window.setRoute;
  if(typeof baseSetRoute26==='function'){
    window.setRoute=function(r,payload=null){
      try{
        if(r==='reader' && typeof route!=='undefined' && route && route!=='reader'){
          api.readerSession.origin={route, payload:clone(typeof routePayload!=='undefined'?routePayload:null)};
        }
      }catch{}
      return baseSetRoute26(r,payload);
    };
  }

  const baseRenderReader=window.renderReader;
  if(typeof baseRenderReader==='function'){
    window.renderReader=function(payload){
      const out=baseRenderReader(payload);
      setTimeout(()=>mountReadingView(payload),0);
      setTimeout(()=>mountReadingView(payload),180);
      return out;
    };
  }

  const baseRenderQuestions=window.renderQuestions;
  if(typeof baseRenderQuestions==='function'){
    window.renderQuestions=function(payload){
      const out=baseRenderQuestions(payload);
      setTimeout(bindQuestionBackOverride,0);
      setTimeout(bindQuestionBackOverride,80);
      return out;
    };
  }

  const baseRenderRoute=window.renderRoute;
  if(typeof baseRenderRoute==='function'){
    window.renderRoute=function(){
      if(typeof route!=='undefined' && route!=='reader'){
        document.body.classList.remove('v26-reader-active','v26-internal-active','v26-focus');
        api.readerSession.view='reading';
      }
      return baseRenderRoute();
    };
  }

  api.captureReaderPosition=captureReaderPosition;
  api.restoreReaderPosition=restoreReaderPosition;
  api.setFocusMode=setFocusMode;
  installStyles();
  window.OAB_V26=api;
})();
