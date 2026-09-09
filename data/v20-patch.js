/* OAB Focus SUPER v20
   Refinamento visual do leitor + prática sempre ao final da unidade + correção da linha horizontal.
   Mantém a lógica existente e adiciona fallback finito de questões autorais quando não houver questões suficientes.
*/
(() => {
  'use strict';
  const V20 = '20.0';
  const QMAP = window.OAB_V16_QUESTION_MAP || {};
  const SUPP_TAG = 'Questão autoral de reforço';
  const QUALITY = window.OAB_V35_QUESTION_QUALITY || null;

  const esc20 = (s='') => typeof esc === 'function' ? esc(String(s ?? '')) : String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const clean = (s='') => String(s || '').replace(/^\d+(?:\.\d+){0,4}[\.)]?\s+/,'').replace(/\s+/g,' ').trim();
  const norm = (s='') => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const toSlug = (s='') => typeof slug === 'function' ? slug(String(s||'')) : norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const uniq = arr => [...new Set(arr.filter(Boolean))];
  const QUESTION_POOL = Array.isArray(QUESTIONS) ? QUESTIONS : (window.OAB_QUESTIONS || []);
  const qExists = id => QUESTION_POOL.some(q => q.id === id);

  function installStyles(){
    if(document.getElementById('v20Styles')) return;
    const s = document.createElement('style');
    s.id = 'v20Styles';
    s.textContent = `
      :root{
        --v20-bg:#f4f7fb;
        --v20-paper:#ffffff;
        --v20-panel:#fbfcfe;
        --v20-soft:#f7f9fc;
        --v20-line:#dbe4ef;
        --v20-line-strong:#cad5e3;
        --v20-ink:#142033;
        --v20-body:#263446;
        --v20-muted:#647488;
        --v20-accent:#2458d3;
        --v20-accent-strong:#1d4ed8;
        --v20-accent-soft:#ebf2ff;
        --v20-accent-soft-2:#f4f7ff;
        --v20-good:#1f7a4d;
        --v20-good-soft:#edf8f1;
        --v20-warn:#9a6a00;
        --v20-warn-soft:#fff8e8;
        --v20-shadow-1:0 10px 30px rgba(15,23,42,.05);
        --v20-shadow-2:0 22px 54px rgba(15,23,42,.08);
      }
      html[data-theme="dark"]{
        --v20-bg:#0f1724;
        --v20-paper:#101826;
        --v20-panel:#162031;
        --v20-soft:#1b2536;
        --v20-line:#263248;
        --v20-line-strong:#31405a;
        --v20-ink:#edf3fb;
        --v20-body:#d9e2ee;
        --v20-muted:#9aabbe;
        --v20-accent:#7aa2ff;
        --v20-accent-strong:#9dbcff;
        --v20-accent-soft:#172746;
        --v20-accent-soft-2:#132033;
        --v20-good:#63c78e;
        --v20-good-soft:#15271d;
        --v20-warn:#e6bc58;
        --v20-warn-soft:#2a2416;
        --v20-shadow-1:0 10px 30px rgba(0,0,0,.25);
        --v20-shadow-2:0 24px 56px rgba(0,0,0,.38);
      }

      .topbar{background:color-mix(in srgb,var(--v20-paper) 88%,transparent)!important;border-bottom:1px solid var(--v20-line)!important}
      .search-trigger,.search-box input,.filter-select,.btn.ghost,.icon-btn{border-color:var(--v20-line)!important}
      .content{max-width:1500px!important}

      body.v18-reader-active{--v18-bg:var(--v20-bg)!important;--v18-paper:var(--v20-paper)!important;--v18-ink:var(--v20-ink)!important;--v18-body:var(--v20-body)!important;--v18-muted:var(--v20-muted)!important;--v18-line:var(--v20-line)!important;--v18-soft:var(--v20-soft)!important;--v18-wine:var(--v20-accent)!important;--v18-navy:var(--v20-ink)!important;background:var(--v20-bg)!important}
      body.v18-reader-active .content{background:var(--v20-bg)!important;padding-bottom:108px!important}

      /* Corrige a linha horizontal indevida do progresso legado */
      .v17-progressline,.v18-progressline{display:none!important;opacity:0!important;pointer-events:none!important}

      .v18-reader .v17-reader-chrome{
        background:color-mix(in srgb,var(--v20-paper) 92%,transparent)!important;
        border-bottom:1px solid var(--v20-line)!important;
        box-shadow:0 1px 0 rgba(255,255,255,.65) inset!important;
      }
      .v18-reader .v17-iconbtn{color:var(--v20-muted)!important;border-radius:10px!important}
      .v18-reader .v17-iconbtn:hover{background:var(--v20-accent-soft)!important;color:var(--v20-accent)!important}
      .v18-reader .v17-iconbtn.primary{background:var(--v20-accent)!important;color:#fff!important}

      .v18-reader .v16-reader-grid{grid-template-columns:minmax(200px,240px) minmax(0,820px) minmax(190px,220px)!important;gap:30px!important;max-width:1380px!important}
      .v18-reader .v16-reader-toc{padding-right:16px!important;border-right:1px solid var(--v20-line)!important}
      .v18-reader .v16-reader-status{padding-left:16px!important;border-left:1px solid var(--v20-line)!important}
      .v18-reader .v16-reader-toc .toc-label,.v18-reader .v16-reader-status .toc-label{color:var(--v20-muted)!important;font-size:.6rem!important;letter-spacing:.16em!important}
      .v18-reader .v16-toc-link{border-radius:12px!important;padding:9px 11px 9px 14px!important;color:var(--v20-muted)!important;transition:all .16s ease!important}
      .v18-reader .v16-toc-link:hover{background:var(--v20-accent-soft-2)!important;color:var(--v20-ink)!important}
      .v18-reader .v16-toc-link.active{background:var(--v20-accent-soft)!important;color:var(--v20-accent)!important;font-weight:850!important}
      .v18-reader .v16-toc-link.active:before{background:var(--v20-accent)!important}
      .v18-reader .v16-toc-link.level-section{color:var(--v20-ink)!important;font-weight:800!important}

      .v18-reader .v16-status-card{border-bottom:1px solid var(--v20-line)!important}
      .v18-reader .v16-status-card small{color:var(--v20-muted)!important}
      .v18-reader .v16-status-card strong{color:var(--v20-ink)!important;font-size:1.12rem!important}
      .v18-reader .v16-status-progress{height:5px!important;background:color-mix(in srgb,var(--v20-line) 86%,white)!important;border-radius:999px!important}
      .v18-reader .v16-status-progress i{background:linear-gradient(90deg,var(--v20-accent),#5c88ff)!important}

      .v18-reader #readerArticle{
        background:linear-gradient(180deg,var(--v20-paper) 0%, color-mix(in srgb,var(--v20-paper) 82%,var(--v20-soft)) 100%)!important;
        border:1px solid var(--v20-line)!important;
        border-radius:24px!important;
        box-shadow:var(--v20-shadow-1)!important;
        padding:42px 52px 58px!important;
      }
      .v18-doc-header{padding-bottom:26px!important;margin-bottom:34px!important;border-bottom:1px solid var(--v20-line)!important}
      .v18-doc-header .trail{color:var(--v20-muted)!important}
      .v18-doc-header .trail i{color:#9fb0c2!important}
      .v18-doc-header .kicker{color:var(--v20-accent)!important}
      .v18-doc-header .kicker:before{background:var(--v20-accent)!important;width:22px!important;height:3px!important}
      .v18-doc-header h1{color:var(--v20-ink)!important;max-width:16ch!important;font-size:clamp(2.2rem,3.2vw,3.3rem)!important;line-height:1.02!important;letter-spacing:-.05em!important}
      .v18-doc-header>p{max-width:66ch!important;color:var(--v20-muted)!important;font-size:1rem!important;line-height:1.72!important}
      .v18-doc-meta span{background:var(--v20-panel)!important;border:1px solid var(--v20-line)!important;color:var(--v20-muted)!important;padding:7px 10px!important;font-size:.68rem!important}
      .v18-doc-meta span.done{background:var(--v20-good-soft)!important;border-color:color-mix(in srgb,var(--v20-good) 30%,var(--v20-line))!important;color:var(--v20-good)!important}
      .v18-doc-meta span.plan{background:var(--v20-accent-soft)!important;border-color:color-mix(in srgb,var(--v20-accent) 22%,var(--v20-line))!important;color:var(--v20-accent)!important}

      .v18-reader .study-zone-head{margin-bottom:18px!important;padding-bottom:12px!important;border-bottom:1px solid var(--v20-line)!important}
      .v18-reader .study-zone-head .zone-kicker{color:var(--v20-muted)!important}
      .v18-reader .study-zone-head h2{color:var(--v20-ink)!important;font-size:1.22rem!important;letter-spacing:-.02em!important}
      .v18-reader .study-zone-head p{color:var(--v20-muted)!important;font-size:.8rem!important;line-height:1.55!important}

      .v18-reader .integral-section{margin-bottom:40px!important}
      .v18-reader .integral-section-head{border-bottom:1px solid var(--v20-line)!important;padding-bottom:14px!important;margin-bottom:18px!important}
      .v18-reader .integral-kind{color:var(--v20-accent)!important}
      .v18-reader .integral-section-head h2{color:var(--v20-ink)!important;font-size:1.65rem!important;letter-spacing:-.03em!important}
      .v18-reader .integral-body{font-size:18px!important;line-height:1.9!important;color:var(--v20-body)!important;text-wrap:pretty}
      .v18-reader .integral-body p{max-width:72ch!important;margin:0 0 1.28em!important}
      .v18-reader .integral-body h3{color:var(--v20-ink)!important;font-size:1.18em!important;line-height:1.32!important;margin:2.2em 0 .8em!important}
      .v18-reader .integral-bullet{line-height:1.78!important}
      .v18-reader .v16-law-line{background:var(--v20-warn-soft)!important;border-left:3px solid #e1be62!important;color:var(--v20-ink)!important}
      .v18-reader .reference-accordion{background:var(--v20-soft)!important;border:1px solid var(--v20-line)!important;border-radius:18px!important;overflow:hidden!important}
      .v18-reader .reference-accordion summary{padding:14px 16px!important}
      .v18-reader .reference-inner{padding:0 16px 12px!important}

      .v18-highlight-dock{background:color-mix(in srgb,var(--v20-paper) 94%,transparent)!important;border:1px solid var(--v20-line)!important;box-shadow:var(--v20-shadow-2)!important;border-radius:18px!important;padding:10px 12px!important}
      .v18-highlight-dock .label b{color:var(--v20-ink)!important}
      .v18-highlight-dock .label small{color:var(--v20-muted)!important}
      .v18-highlight-dock .tool{border-left:1px solid var(--v20-line)!important;color:var(--v20-muted)!important}
      .v18-highlight-dock .tool:hover{color:var(--v20-accent)!important}
      mark.oab-highlight[data-v18-highlight]{padding:.04em .08em!important;border-radius:.2em!important;box-decoration-break:clone;-webkit-box-decoration-break:clone}
      .oab-highlight.yellow{background:#ffe79c!important}.oab-highlight.green{background:#c9efd4!important}.oab-highlight.blue{background:#d5e7ff!important}

      .v20-practice-shell{margin-top:8px;border:1px solid var(--v20-line);border-radius:20px;background:linear-gradient(180deg,var(--v20-panel) 0%,var(--v20-soft) 100%);box-shadow:var(--v20-shadow-1);overflow:hidden}
      .v20-practice-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:18px 18px 12px}
      .v20-practice-head h3{margin:0;font-size:1.05rem;color:var(--v20-ink);letter-spacing:-.02em}
      .v20-practice-head p{margin:6px 0 0;color:var(--v20-muted);font-size:.8rem;line-height:1.55}
      .v20-practice-badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
      .v20-practice-badges span{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border:1px solid var(--v20-line);border-radius:999px;background:var(--v20-paper);font-size:.66rem;color:var(--v20-muted);font-weight:760}
      .v20-practice-list{display:grid;gap:10px;padding:0 18px 18px}
      .v20-practice-card{padding:14px 15px;border:1px solid var(--v20-line);border-radius:16px;background:var(--v20-paper)}
      .v20-practice-card small{display:flex;gap:8px;flex-wrap:wrap;color:var(--v20-muted);font-size:.66rem;font-weight:760}
      .v20-practice-card b{display:block;color:var(--v20-ink);margin:8px 0 0;font-size:.93rem;line-height:1.5;font-weight:720}
      .v20-q-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;background:var(--v20-accent-soft);color:var(--v20-accent);font-weight:850}
      .v20-q-chip.autoral{background:var(--v20-warn-soft);color:var(--v20-warn)}
      .v20-practice-actions{display:flex;flex-wrap:wrap;gap:10px;padding:0 18px 18px}
      .v20-practice-note{padding:0 18px 18px;color:var(--v20-muted);font-size:.72rem;line-height:1.6}
      .v20-btn-main{background:var(--v20-accent)!important;border-color:var(--v20-accent)!important;color:#fff!important}
      .v20-btn-main:hover{background:var(--v20-accent-strong)!important}

      @media(max-width:1180px){
        .v18-reader .v16-reader-grid{grid-template-columns:minmax(190px,230px) minmax(0,1fr)!important}
      }
      @media(max-width:900px){
        body.v18-reader-active .content{padding-bottom:96px!important}
        .v18-reader #readerArticle{padding:30px 22px 40px!important;border-radius:0!important;border-left:0!important;border-right:0!important;box-shadow:none!important}
        .v18-doc-header h1{font-size:2.1rem!important;max-width:100%!important}
        .v18-reader .integral-body{font-size:17px!important;line-height:1.82!important}
        .v20-practice-head{flex-direction:column!important}
        .v20-practice-actions .btn{flex:1 1 100%}
      }
    `;
    document.head.appendChild(s);
  }

  function getReaderCtx(payload){
    try{
      const p = payload || routePayload || {};
      const d = typeof findDiscipline === 'function' ? findDiscipline(p?.discipline) : null;
      if(!d) return null;
      const full = p?.topicId === '__integral__' || p?.topicId === `${d.id}-integral`;
      const unit = full ? {id:`${d.id}-integral`, title:`${d.name} · Material integral`, mode:'integral'} : (typeof resolveStudyUnit === 'function' ? resolveStudyUnit(d.name,p?.topicId) : null);
      if(!unit) return null;
      const subtopic = String(p?.subtopicTitle || '').trim();
      const chapter = unit.chapter || (typeof disciplineChapters === 'function' ? disciplineChapters(d.name).find(c=>c.id===unit.id) : null) || null;
      return {discipline:d.name, disciplineObj:d, unit, chapter, subtopic, full, label:clean(subtopic || chapter?.title || unit.title || d.name)};
    }catch(e){ console.warn('v20 ctx',e); return null; }
  }

  function qMetaMatch(q,ctx){
    const m = QMAP[q.id];
    if(!m || m.discipline !== ctx.discipline) return false;
    if(ctx.full) return true;
    if(!ctx.chapter) return false;
    if(m.chapterId !== ctx.chapter.id) return false;
    if(ctx.subtopic){
      return toSlug(m.subtopicTitle || '') === toSlug(ctx.subtopic) || toSlug(m.topic || '') === toSlug(ctx.subtopic);
    }
    return true;
  }

  function fuzzyTopicMatch(q,ctx){
    if(q.discipline !== ctx.discipline) return false;
    const target = `${ctx.subtopic || ''} ${ctx.chapter?.title || ''} ${ctx.unit?.title || ''}`.trim();
    const qtext = `${q.topic || ''} ${q.statement || ''}`;
    if(!target || !qtext) return false;
    const A = norm(target), B = norm(qtext);
    if(!A || !B) return false;
    if(B.includes(A) || A.includes(norm(q.topic || ''))) return true;
    const words = A.split(/\s+/).filter(w=>w.length>=4);
    let hits = 0;
    for(const w of words){ if(B.includes(w)) hits++; }
    return hits >= Math.min(2, words.length);
  }

  function firstTheoryText(){
    const nodes = [...document.querySelectorAll('#readerArticle .integral-body p, #readerArticle .integral-body li')];
    return nodes.map(n => n.textContent.trim()).filter(t => t.length > 35).join(' ');
  }

  function makeAuthorialQuestion(ctx, idx, theoryText){
    const topic = clean(ctx.subtopic || ctx.chapter?.title || ctx.unit?.title || ctx.discipline);
    const id = `v20-auto-${toSlug(ctx.discipline)}-${toSlug(topic)}-${idx}`;
    if(qExists(id)) return id;
    const extracted=QUALITY?.extractRule?.(theoryText,topic),correct=extracted?.rule||'';
    if(!correct||!QUALITY?.isCompleteLegalStatement?.(correct))return '';
    const wrong=QUALITY?.buildDistractors?.(correct,topic)||[];
    if(wrong.length<3)return '';
    const options=[correct,...wrong.slice(0,3)];
    if(options.some(x=>!QUALITY?.isCompleteLegalStatement?.(x)))return '';
    const research=QUALITY?.buildResearch?.(correct,options,0,topic,theoryText)||null;
    const q = {
      id,
      number: idx,
      displayNumber: idx,
      discipline: ctx.discipline,
      exam: `${SUPP_TAG} — estilo FGV/OAB`,
      statement: `${SUPP_TAG} — estilo FGV/OAB. Sobre ${topic}, assinale a alternativa correta.`,
      options,
      answer: 0,
      comment: research?`${research.whyCorrect} Fundamento jurídico: ${research.basis}`:`A alternativa A reproduz a regra jurídica completa estudada em ${topic}.`,
      research: research||undefined,
      researchVersion: research?'v35.7-authorial':undefined,
      sourceType:'authorial',authorial:true,
      topic
    };
    QUESTION_POOL.push(q);
    window.OAB_QUESTIONS = QUESTION_POOL;
    return id;
  }

  function questionSetForCtx(ctx){
    if(!ctx) return {ids:[], real:0, authorial:0};
    let strict = QUESTION_POOL.filter(q => qMetaMatch(q,ctx)).map(q=>q.id);
    let loose = QUESTION_POOL.filter(q => !strict.includes(q.id) && fuzzyTopicMatch(q,ctx)).map(q=>q.id);
    let ids = uniq([...strict, ...loose]).slice(0, 18);
    const real = ids.filter(id => !(QUESTION_POOL.find(q=>q.id===id)?.exam || '').startsWith(SUPP_TAG)).length;
    let authorial = ids.length - real;
    if(ids.length < 3){
      const text = firstTheoryText();
      const needed = Math.min(3 - ids.length, 3);
      for(let i=1;i<=needed;i++){
        const id = makeAuthorialQuestion(ctx, i, text);
        if(id && !ids.includes(id)) ids.push(id);
      }
      authorial = ids.filter(id => (QUESTION_POOL.find(q=>q.id===id)?.exam || '').startsWith(SUPP_TAG)).length;
    }
    return {ids, real: ids.length - authorial, authorial};
  }

  function openQuestionBlock(ctx,set){
    if(!ctx || !set?.ids?.length) return;
    const opened=window.OAB_STATE.openQuestionContext({
      discipline:ctx.discipline,questionIds:set.ids,
      studyContext:{discipline:ctx.discipline,label:ctx.label,mode:set.authorial?'v20-hybrid-topic':'v20-real-topic',count:set.ids.length,verified:!set.authorial,chapterId:ctx.chapter?.id||'',subtopic:ctx.subtopic||''}
    });
    if(!opened){toast('Ainda não há questão específica validada para esta unidade.','bad');return;}
    safeRoute('questions');
  }

  function updateReaderLabels(ctx,set){
    const qbtn = document.getElementById('topicQuestions');
    if(qbtn){
      qbtn.disabled = !set.ids.length;
      qbtn.textContent = set.ids.length ? `Resolver ${set.ids.length} questões desta unidade` : 'Sem questões disponíveis';
      qbtn.classList.add('v20-btn-main');
      qbtn.onclick = () => openQuestionBlock(ctx,set);
    }
    const footerBtn = document.getElementById('v16EndQuestions');
    if(footerBtn){
      footerBtn.disabled = !set.ids.length;
      footerBtn.textContent = set.ids.length ? `Resolver ${set.ids.length} questões desta unidade` : 'Sem questões disponíveis';
      footerBtn.onclick = () => openQuestionBlock(ctx,set);
    }
    document.querySelectorAll('.v16-status-card').forEach(card => {
      const small = card.querySelector('small');
      const strong = card.querySelector('strong');
      if(!small || !strong) return;
      const t = norm(small.textContent);
      if(t.includes('questoes')){ small.textContent = 'Questões desta unidade'; strong.textContent = String(set.ids.length); }
    });
    const headerMeta = document.querySelector('.v18-doc-meta');
    if(headerMeta){
      const spans = [...headerMeta.querySelectorAll('span')];
      const target = spans.find(sp => /quest/i.test(sp.textContent));
      if(target) target.textContent = `${set.ids.length} questões desta unidade`;
    }
    const zoneDesc = document.querySelector('#zoneQuestions .study-zone-head p');
    if(zoneDesc){
      zoneDesc.textContent = set.real
        ? (set.authorial ? 'Questões reais vêm primeiro. Quando o banco específico não basta, o sistema libera um complemento finito de questões autorais de reforço no mesmo tema.' : 'Questões reais vinculadas a esta unidade, para transformar a leitura em prática imediata.')
        : 'Como ainda não há questões reais suficientes nesta unidade, foi liberado um pequeno complemento finito de questões autorais de reforço, sem misturar assunto.';
    }
  }

  function injectPracticePreview(ctx,set){
    const zone = document.getElementById('zoneQuestions');
    if(!zone || zone.querySelector('.v20-practice-shell')) return;
    const list = set.ids.slice(0,3).map(id => QUESTION_POOL.find(q=>q.id===id)).filter(Boolean);
    const wrap = document.createElement('div');
    wrap.className = 'v20-practice-shell';
    wrap.innerHTML = `
      <div class="v20-practice-head">
        <div>
          <h3>Pratique logo após a leitura</h3>
          <p>O bloco abaixo sempre prioriza questões reais do mesmo conteúdo. Quando elas não são suficientes, o sistema usa um complemento finito de reforço, claramente identificado.</p>
          <div class="v20-practice-badges">
            <span>${set.ids.length} questão${set.ids.length===1?'':'ões'} prontas</span>
            <span>${set.real} real${set.real===1?'':'is'}</span>
            <span>${set.authorial} autoral${set.authorial===1?'':'ais'}</span>
          </div>
        </div>
      </div>
      <div class="v20-practice-list">
        ${list.map((q,i)=>{
          const isAut = String(q.exam||'').startsWith(SUPP_TAG);
          return `<article class="v20-practice-card"><small><span class="v20-q-chip ${isAut?'autoral':''}">${isAut?'Autoral de reforço':'Questão real'}</span><span>${esc20(q.exam||'Banco OAB')}</span><span>${esc20(clean(q.topic||ctx.label))}</span></small><b>${esc20(q.statement)}</b></article>`;
        }).join('')}
      </div>
      <div class="v20-practice-actions">
        <button class="btn v20-btn-main" id="v20OpenPractice">Abrir bloco de questões</button>
        <button class="btn ghost" id="v20ReviewFromPractice">Revisar este conteúdo primeiro</button>
      </div>
      <div class="v20-practice-note">Política finita do reforço: no máximo 3 questões autorais por microtema, sempre rotuladas como autorais. O sistema não gera fluxo infinito.</div>
    `;
    zone.appendChild(wrap);
    document.getElementById('v20OpenPractice')?.addEventListener('click',()=>openQuestionBlock(ctx,set));
    document.getElementById('v20ReviewFromPractice')?.addEventListener('click',()=>document.getElementById('zoneTheory')?.scrollIntoView({behavior:'smooth',block:'start'}));
  }

  function applyReaderRefinement(payload){
    if(route !== 'reader') return;
    installStyles();
    const ctx = getReaderCtx(payload);
    if(!ctx) return;
    const set = questionSetForCtx(ctx);
    updateReaderLabels(ctx,set);
    injectPracticePreview(ctx,set);
  }

  const baseRenderReader = renderReader;
  renderReader = function(payload){
    baseRenderReader(payload);
    requestAnimationFrame(()=>applyReaderRefinement(payload||routePayload));
    setTimeout(()=>applyReaderRefinement(payload||routePayload), 120);
  };

  const baseRenderRoute = renderRoute;
  renderRoute = function(){
    const out = baseRenderRoute();
    if(route === 'reader'){
      requestAnimationFrame(()=>applyReaderRefinement(routePayload));
      setTimeout(()=>applyReaderRefinement(routePayload),120);
    }
    return out;
  };

  installStyles();
  window.OAB_V20_ACTIVE = V20;
})();
