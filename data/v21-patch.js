/* OAB Focus SUPER v21
   - Aplica a arquitetura contextual da pesquisa profunda.
   - Corrige contaminação editorial/material (ex.: 'DIA 02 / CIVIL' em conteúdo de outra disciplina).
   - Separa banco livre x prática contextual x revisão adaptativa.
   - Endurece responsividade/mobile do leitor.
*/
(() => {
  'use strict';
  const QA = window.OAB_V21_QA = window.OAB_V21_QA || {reader:{removed:[], anomalies:[]}, mobile:{}, questions:{}};
  const esc21 = (s='') => typeof esc === 'function' ? esc(String(s ?? '')) : String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const norm = (s='') => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const toSlug = (s='') => typeof slug === 'function' ? slug(String(s||'')) : norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const clean = (s='') => String(s||'').replace(/^\d+(?:\.\d+){0,4}[\.)]?\s+/,'').replace(/\s+/g,' ').trim();
  const currentDisciplines = () => (window.MATERIAL?.disciplines || []).map(d => d.name);

  function installStyles(){
    if(document.getElementById('v21Styles')) return;
    const css = document.createElement('style');
    css.id='v21Styles';
    css.textContent = `
      body.v21-questions-context .search-trigger,
      body.v21-questions-context .topbar .search-box,
      body.v21-questions-context .topbar input,
      body.v21-questions-context .topbar .search-wrap{display:none!important}
      body.v21-questions-context .topbar{grid-template-columns:auto 1fr auto!important}

      .v21-context-shell{display:grid;gap:18px;margin-bottom:18px}
      .v21-context-head{padding:20px 22px;border:1px solid var(--line);border-radius:18px;background:var(--surface);box-shadow:0 10px 32px rgba(15,23,42,.04)}
      .v21-context-head .kicker{display:inline-flex;align-items:center;gap:8px;font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--brand)}
      .v21-context-head .kicker:before{content:'';width:18px;height:3px;border-radius:999px;background:var(--brand)}
      .v21-context-head h2{margin:10px 0 8px;font-size:clamp(1.7rem,2.8vw,2.5rem);line-height:1.04;letter-spacing:-.04em;color:var(--ink)}
      .v21-context-head p{margin:0;max-width:72ch;color:var(--muted);line-height:1.65}
      .v21-context-breadcrumbs{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;color:var(--muted);font-size:.8rem}
      .v21-context-breadcrumbs span{display:inline-flex;align-items:center;gap:8px}
      .v21-context-breadcrumbs span+span:before{content:'›';opacity:.55;margin-right:8px}
      .v21-context-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
      .v21-context-chips span{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;border:1px solid var(--line);background:var(--card);font-size:.72rem;font-weight:760;color:var(--muted)}
      .v21-context-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
      .v21-context-actions .btn{min-height:42px}
      .v21-mode-note{padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:color-mix(in srgb,var(--brand) 8%, var(--card));font-size:.78rem;color:var(--muted);line-height:1.55}
      .v21-mode-note b{color:var(--ink)}
      .v21-questions-context .page-head,
      .v21-questions-context .filter-panel,
      .v21-questions-context #v16AdaptiveBanner,
      .v21-questions-context .v15-question-context{display:none!important}
      .v21-questions-context .question-layout{margin-top:0!important}
      .v21-questions-context .question-panel{border-radius:20px}
      .v21-questions-context .question-side .side-card h4{letter-spacing:.04em;text-transform:uppercase;font-size:.74rem}
      .v21-review-mode .page-head,
      .v21-review-mode .filter-panel,
      .v21-review-mode .v15-question-context{display:none!important}

      /* Leitor: estrutura mais resistente e mobile-first */
      body.v18-reader-active{overflow-x:hidden!important}
      body.v18-reader-active .content{overflow-x:clip}
      .v18-reader .v17-reader-chrome{overflow:auto hidden;scrollbar-width:none}
      .v18-reader .v17-reader-chrome::-webkit-scrollbar{display:none}
      .v18-reader .v17-reader-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
      .v18-reader .v17-reader-actions .v17-iconbtn{white-space:nowrap}
      .v18-reader .v16-reader-grid,.v18-reader #readerArticle,.v18-reader .v17-reader-chrome{max-width:100%}
      .v18-reader .v16-reader-toc .toc-list{padding-bottom:20px}
      .v18-reader .v16-toc-link{word-break:break-word}

      @media (max-width: 980px){
        .v18-reader .v16-reader-grid{grid-template-columns:minmax(0,1fr)!important;gap:0!important}
        .v18-reader .v16-reader-toc,
        .v18-reader .v16-reader-status{display:none!important}
        .v18-reader .v17-reader-chrome{padding:10px 14px!important;border-radius:0!important;position:sticky;top:64px;z-index:25}
        .v18-reader #readerArticle{border-radius:0!important;margin:0 -12px!important;padding:24px 18px 34px!important;border-left:none!important;border-right:none!important}
        .v18-doc-header h1{font-size:2rem!important;line-height:1.02!important}
        .v18-reader .integral-body{font-size:16.5px!important;line-height:1.82!important}
      }
      @media (max-width: 720px){
        .topbar{padding-inline:12px!important}
        .v21-context-head{padding:16px 16px!important;border-radius:16px}
        .v21-context-actions{flex-direction:column}
        .v21-context-actions .btn{width:100%}
        .v18-reader .v17-reader-actions{justify-content:flex-start}
        .v18-reader .v17-iconbtn{padding:8px 10px!important}
        .v18-reader .v17-reader-chrome{top:56px!important}
        .v18-reader #readerArticle{padding:22px 16px 32px!important;margin:0 -10px!important}
        .v18-doc-header>p{font-size:.95rem!important;line-height:1.64!important}
        .v18-reader .integral-body p{max-width:100%!important}
        .v18-highlight-dock{left:10px!important;right:10px!important;bottom:10px!important;width:auto!important}
      }
    `;
    document.head.appendChild(css);
  }

  function getReaderCtx(payload){
    try{
      const p = payload || routePayload || {};
      const d = typeof findDiscipline === 'function' ? findDiscipline(p?.discipline) : null;
      if(!d) return null;
      const full = p?.topicId === '__integral__' || p?.topicId === `${d.id}-integral`;
      const unit = full ? {id:`${d.id}-integral`, title:`${d.name} · Material integral`, mode:'integral'} : (typeof resolveStudyUnit === 'function' ? resolveStudyUnit(d.name,p?.topicId) : null);
      if(!unit) return null;
      const chapter = unit.chapter || (typeof disciplineChapters === 'function' ? disciplineChapters(d.name).find(c=>c.id===unit.id) : null) || null;
      return { discipline:d.name, unit, chapter, full, subtopic:String(p?.subtopicTitle||'').trim(), label:clean(p?.subtopicTitle || chapter?.title || unit.title || d.name) };
    } catch(e){ return null; }
  }

  function isContextQuestions(){
    return route === 'questions' && !!(qFilters?.studyContext && Array.isArray(qFilters.questionIds) && qFilters.questionIds.length && !qFilters.adaptiveMode);
  }
  function isAdaptiveQuestions(){
    return route === 'questions' && !!qFilters?.adaptiveMode;
  }

  function questionBackTarget(ctx){
    if(!ctx) return null;
    if(ctx.chapterId){
      return () => safeRoute('reader',{discipline:ctx.discipline, topicId:ctx.chapterId, subtopicTitle:ctx.subtopic || ''});
    }
    if(ctx.discipline && ctx.discipline !== 'Revisão inteligente'){
      return () => safeRoute('study',{discipline:ctx.discipline});
    }
    return () => goBack({route:'study'});
  }

  function applyQuestionArchitecture(){
    document.body.classList.toggle('v21-questions-context', isContextQuestions());
    document.body.classList.toggle('v21-review-mode', isAdaptiveQuestions());
    if(!(isContextQuestions() || isAdaptiveQuestions())) return;

    const host = document.querySelector('#questionHost');
    if(!host) return;

    const old = document.getElementById('v21ContextShell');
    if(old) old.remove();

    if(isAdaptiveQuestions()){
      const shell = document.createElement('div');
      shell.id = 'v21ContextShell';
      shell.className = 'v21-context-shell';
      shell.innerHTML = `
        <section class="v21-context-head">
          <span class="kicker">Revisão inteligente</span>
          <h2>Fila adaptativa de recuperação e consolidação</h2>
          <p>Este modo existe só para revisão calculada pela curva do esquecimento. O banco livre e a prática de uma unidade ficam separados para evitar ruído e erros de contexto.</p>
          <div class="v21-context-chips"><span>${(qFilters.questionIds||[]).length} questões na fila</span><span>mesmos microtemas</span><span>intervalos adaptativos</span></div>
          <div class="v21-context-actions"><button class="btn ghost" id="v21BackToReview">Voltar à revisão</button><button class="btn primary" id="v21OpenFreeBank">Banco livre de questões</button></div>
        </section>`;
      host.parentNode.insertBefore(shell, host);
      document.getElementById('v21BackToReview')?.addEventListener('click',()=>safeRoute('review'));
      document.getElementById('v21OpenFreeBank')?.addEventListener('click',()=>{ delete qFilters.questionIds; delete qFilters.studyContext; delete qFilters.adaptiveMode; delete qFilters.replay; safeRoute('questions'); });
      return;
    }

    const ctx = qFilters.studyContext || {};
    const shell = document.createElement('div');
    shell.id = 'v21ContextShell';
    shell.className = 'v21-context-shell';
    shell.innerHTML = `
      <section class="v21-context-head">
        <span class="kicker">Prática desta unidade</span>
        <h2>${esc21(ctx.label || 'Questões do conteúdo estudado')}</h2>
        <p>Você entrou em uma sessão específica de prática vinculada ao conteúdo que acabou de estudar. Aqui aparecem somente as questões validadas para esta unidade — sem simulado aleatório, sem filtros livres e sem pesquisa global desviando o foco.</p>
        <div class="v21-context-breadcrumbs"><span>${esc21(ctx.discipline || '')}</span>${ctx.chapterId?`<span>${esc21(ctx.label || '')}</span>`:''}</div>
        <div class="v21-context-chips"><span>${(qFilters.questionIds||[]).length} questões nesta sessão</span><span>${ctx.verified===false?'vínculo parcial':'vínculo temático validado'}</span>${ctx.subtopic?`<span>${esc21(ctx.subtopic)}</span>`:''}</div>
        <div class="v21-context-actions"><button class="btn ghost" id="v21BackToMaterial">Voltar ao material</button><button class="btn primary" id="v21ContinuePractice">Continuar sessão</button></div>
      </section>
      <div class="v21-mode-note"><b>O que faz sentido aqui:</b> responder este conteúdo e voltar ao material. <b>O que não faz sentido aqui:</b> simulado, filtros gerais, pesquisa aleatória e blocos de outros modos.</div>`;
    host.parentNode.insertBefore(shell, host);
    document.getElementById('v21ContinuePractice')?.addEventListener('click',()=>host.scrollIntoView({behavior:'smooth',block:'start'}));
    document.getElementById('v21BackToMaterial')?.addEventListener('click',questionBackTarget(ctx));
  }

  function suspiciousScore(text, ctx){
    const s = norm(text);
    if(!s) return 0;
    let score = 0;
    if(/^dia\s+\d{1,2}\b/.test(s)) score += 5;
    if(/^semana\b/.test(s)) score += 3;
    if(/cronograma/.test(s) && /oab/.test(s)) score += 5;
    if(/metodo vde|método vde|revisao nocaute/.test(s)) score += 5;
    if(/^simulado\b/.test(s)) score += 4;
    if(/^nota final\b|^numero de acertos\b|^numero de erros\b|^n[uú]mero de acertos\b|^n[uú]mero de erros\b/.test(s)) score += 4;
    if(/^ficou algum conteudo pendente/.test(s) || /^controle de habitos/.test(s)) score += 4;
    if(/^revis[aã]o\s+-\s+/.test(s)) score += 3;
    if(/preferencialmente.*13h.*18h/.test(s) || /tire todas as distra[cç][oõ]es/.test(s)) score += 5;
    const raw = String(text||'').trim();
    const isShort = raw.length <= 32;
    const isUpperish = raw === raw.toUpperCase() && /[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(raw);
    if(isShort && isUpperish){
      const list = ['CIVIL','PENAL','CONSTITUCIONAL','ADMINISTRATIVO','TRABALHO','PROCESSO CIVIL','PROCESSO PENAL','PROCESSO DO TRABALHO','ETICA'];
      if(list.includes(raw.toUpperCase()) && norm(raw) !== norm(ctx?.discipline || '')) score += 4;
    }
    return score;
  }

  function isLegalAnchor(text, ctx){
    const s = norm(clean(text));
    if(!s) return false;
    const anchors = [ctx?.label, ctx?.subtopic, ctx?.chapter?.title, ctx?.discipline].map(x=>norm(clean(x||''))).filter(Boolean);
    return anchors.some(a => a && (s.includes(a) || a.includes(s)));
  }

  function sanitizeReaderContent(payload){
    if(route !== 'reader') return;
    const ctx = getReaderCtx(payload);
    const article = document.querySelector('#readerArticle');
    const body = article?.querySelector('.integral-body');
    if(!ctx || !body) return;

    const nodes = [...body.children].filter(n => !n.classList?.contains('v20-practice-shell'));
    let contamination = 0;
    let anchorSeen = false;
    const removed = [];
    nodes.forEach((node, idx) => {
      const txt = clean(node.textContent || '');
      if(!txt) return;
      const score = suspiciousScore(txt, ctx);
      if(isLegalAnchor(txt, ctx)) anchorSeen = true;
      const leadingZone = idx < 10;
      const shouldRemove = score >= 5 || (!anchorSeen && leadingZone && score >= 3) || (!anchorSeen && leadingZone && /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ ]{4,32}$/.test(txt) && suspiciousScore(txt,ctx) >= 3);
      if(shouldRemove){
        contamination += score;
        removed.push({text:txt.slice(0,90), score});
        node.remove();
      }
    });

    // remove TOC items that mirror removed editorial garbage
    const tocLinks = [...document.querySelectorAll('.v16-toc-link')];
    tocLinks.forEach(link => {
      const txt = clean(link.textContent || '');
      if(suspiciousScore(txt, ctx) >= 4) link.remove();
    });

    // hard guard: if the first visible textual node still looks contaminated, remove until first anchor.
    const remaining = [...body.children];
    let purgeMode = false;
    for(const node of remaining){
      const txt = clean(node.textContent || '');
      if(!txt) continue;
      if(isLegalAnchor(txt, ctx) || /^\d+(?:\.\d+)+/.test(txt) || /^art\./i.test(txt)){ purgeMode = false; break; }
      if(suspiciousScore(txt, ctx) >= 3){ purgeMode = true; node.remove(); removed.push({text:txt.slice(0,90), score:suspiciousScore(txt,ctx)}); continue; }
      if(purgeMode){ node.remove(); removed.push({text:txt.slice(0,90), score:1}); continue; }
      break;
    }

    if(removed.length){
      QA.reader.removed.push({discipline:ctx.discipline,label:ctx.label,count:removed.length,items:removed.slice(0,12)});
      QA.reader.anomalies.push({discipline:ctx.discipline,label:ctx.label,contamination});
    }
  }

  function validateMobileStructure(){
    // Lightweight runtime assertions to catch obvious mobile-structure regressions.
    const narrow = window.innerWidth <= 720;
    if(!narrow || route !== 'reader') return;
    const grid = document.querySelector('.v16-reader-grid');
    const article = document.querySelector('#readerArticle');
    const toc = document.querySelector('.v16-reader-toc');
    const status = document.querySelector('.v16-reader-status');
    QA.mobile = {
      width: window.innerWidth,
      gridSingleColumn: !!grid && getComputedStyle(grid).gridTemplateColumns.split(' ').length <= 1,
      tocHidden: !toc || getComputedStyle(toc).display === 'none',
      statusHidden: !status || getComputedStyle(status).display === 'none',
      noOverflow: article ? article.scrollWidth <= article.clientWidth + 2 : true
    };
  }

  const baseRenderReader = renderReader;
  renderReader = function(payload){
    const out = baseRenderReader(payload);
    requestAnimationFrame(() => { sanitizeReaderContent(payload || routePayload); validateMobileStructure(); });
    setTimeout(() => { sanitizeReaderContent(payload || routePayload); validateMobileStructure(); }, 90);
    return out;
  };

  const baseRenderQuestions = renderQuestions;
  renderQuestions = function(payload){
    const out = baseRenderQuestions(payload);
    requestAnimationFrame(applyQuestionArchitecture);
    setTimeout(applyQuestionArchitecture, 60);
    return out;
  };

  const baseRenderRoute = renderRoute;
  renderRoute = function(){
    const out = baseRenderRoute();
    installStyles();
    document.body.classList.toggle('v21-questions-context', isContextQuestions());
    document.body.classList.toggle('v21-review-mode', isAdaptiveQuestions());
    if(route === 'reader') { requestAnimationFrame(() => { sanitizeReaderContent(routePayload); validateMobileStructure(); }); }
    if(route === 'questions') { requestAnimationFrame(applyQuestionArchitecture); }
    return out;
  };

  installStyles();
  window.OAB_V21_ACTIVE = true;
})();
