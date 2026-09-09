/* OAB Focus SUPER v27
   Trilha de estudo progressiva baseada em exposição + amostra mínima de recuperação ativa.
   Mantém leitor amplo da v26, material jurídico integral e separação entre estudo, prática, revisão e banco livre.
*/
(() => {
  'use strict';

  const VERSION = '27.0';
  const STATE_LABELS = {
    available: 'Disponível',
    in_study: 'Em estudo',
    questions_pending: 'Questões pendentes',
    completed: 'Concluído',
    locked: 'Bloqueado'
  };
  const state = { observer:null, scheduled:false };

  const esc27 = value => typeof esc === 'function' ? esc(String(value ?? '')) : String(value ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const clean27 = value => String(value || '').replace(/^\d+(?:\.\d+){0,4}[\.)]?\s+/,'').replace(/\s+/g,' ').trim();
  const slug27 = value => typeof slug === 'function' ? slug(String(value || '')) : String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const norm27 = value => typeof normalizeSearch === 'function' ? normalizeSearch(String(value || '')) : slug27(value).replace(/-/g,' ');
  const clone27 = value => value == null ? null : JSON.parse(JSON.stringify(value));

  function installStyles(){
    if(document.getElementById('v27Styles')) return;
    const s=document.createElement('style'); s.id='v27Styles';
    s.textContent=`
      :root{--v27-ok:#2f7650;--v27-ok-bg:#eef8f2;--v27-warn:#8a6428;--v27-warn-bg:#fbf5e8;--v27-active:#2458d3;--v27-active-bg:#eef3ff;--v27-lock:#7b8491;--v27-lock-bg:#f4f6f8}
      .v27-mode-note{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin:18px 0 4px;padding:16px 18px;border:1px solid var(--line);border-radius:16px;background:var(--surface,#fff)}
      .v27-mode-note b{display:block;margin-bottom:4px;font-size:.88rem;color:var(--ink)}.v27-mode-note p{margin:0;color:var(--muted);font-size:.76rem;line-height:1.55;max-width:78ch}
      .v27-trail-shell{width:100%;min-width:0}.v27-trail-summary{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;padding:20px 22px;margin:0 0 18px;border:1px solid var(--line);border-radius:18px;background:var(--surface,#fff)}
      .v27-trail-summary .eyebrow{display:block;color:var(--brand);font-size:.62rem;font-weight:900;letter-spacing:.13em}.v27-trail-summary h3{margin:5px 0 6px;font-size:1.3rem;letter-spacing:-.025em;color:var(--ink)}.v27-trail-summary p{margin:0;color:var(--muted);font-size:.78rem;line-height:1.55;max-width:76ch}
      .v27-progress-number{text-align:right;white-space:nowrap}.v27-progress-number strong{display:block;font-size:1.55rem;color:var(--ink);line-height:1}.v27-progress-number small{color:var(--muted);font-size:.68rem}
      .v27-progress-track{grid-column:1/-1;height:6px;border-radius:999px;background:var(--surface-2,#eef1f5);overflow:hidden}.v27-progress-track i{display:block;height:100%;border-radius:inherit;background:var(--brand,#2458d3)}
      .v27-trail-legend{display:flex;gap:8px;flex-wrap:wrap;margin:-7px 0 16px}.v27-trail-legend span{font-size:.65rem;color:var(--muted);padding:5px 8px;border:1px solid var(--line);border-radius:999px;background:var(--surface,#fff)}
      .v27-trail-chapters{display:grid;gap:14px}.v27-trail-chapter{border:1px solid var(--line);border-radius:18px;background:var(--surface,#fff);overflow:hidden}.v27-trail-chapter-head{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:12px;padding:16px 48px 16px 18px;border-bottom:1px solid var(--line);cursor:pointer;list-style:none;user-select:none}.v27-trail-chapter-head::-webkit-details-marker{display:none}.v27-trail-chapter:not([open])>.v27-trail-chapter-head{border-bottom-color:transparent}.v27-trail-chapter-head:after{content:'⌄';position:absolute;right:18px;top:50%;transform:translateY(-52%) rotate(-90deg);font-size:1rem;color:var(--muted);transition:transform .18s ease}.v27-trail-chapter[open]>.v27-trail-chapter-head:after{transform:translateY(-52%) rotate(0deg)}.v27-trail-chapter-head:hover{background:color-mix(in srgb,var(--brand) 2.5%,var(--surface,#fff))}.v27-trail-chapter-head:focus-visible{outline:2px solid color-mix(in srgb,var(--brand) 55%,transparent);outline-offset:-3px}
      .v27-chapter-no{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:var(--surface-2,#f3f6fa);color:var(--muted);font-size:.7rem;font-weight:900}.v27-trail-chapter-head b{display:block;color:var(--ink);font-size:.94rem}.v27-trail-chapter-head small{color:var(--muted);font-size:.68rem}.v27-chapter-progress{white-space:nowrap;font-size:.68rem;color:var(--muted);font-weight:800}
      .v27-trail-units{display:grid}.v27-trail-unit{display:grid;grid-template-columns:40px minmax(0,1fr) minmax(155px,auto);gap:12px;align-items:center;padding:13px 18px;border-bottom:1px solid var(--line);min-width:0}.v27-trail-unit:last-child{border-bottom:0}.v27-trail-unit.current{background:color-mix(in srgb,var(--brand) 4%,var(--surface,#fff))}
      .v27-unit-marker{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;border:1px solid var(--line);background:var(--surface-2,#f5f7fa);color:var(--muted);font-size:.68rem;font-weight:900}.v27-unit-copy{min-width:0}.v27-unit-copy b{display:block;color:var(--ink);font-size:.82rem;line-height:1.35}.v27-unit-copy small{display:flex;gap:7px;flex-wrap:wrap;margin-top:5px;color:var(--muted);font-size:.65rem;line-height:1.4}.v27-unit-copy small span+span:before{content:'·';margin-right:7px;color:var(--line-strong,#aeb5bf)}
      .v27-unit-side{display:flex;align-items:center;justify-content:flex-end;gap:8px;min-width:0}.v27-state{display:inline-flex;align-items:center;min-height:28px;padding:0 9px;border-radius:999px;font-size:.62rem;font-weight:900;white-space:nowrap}.v27-state.completed{color:var(--v27-ok);background:var(--v27-ok-bg)}.v27-state.questions_pending{color:var(--v27-warn);background:var(--v27-warn-bg)}.v27-state.available,.v27-state.in_study{color:var(--v27-active);background:var(--v27-active-bg)}.v27-state.locked{color:var(--v27-lock);background:var(--v27-lock-bg)}
      .v27-unit-open{min-height:38px;border:1px solid var(--line);border-radius:10px;background:var(--surface,#fff);color:var(--ink);padding:0 11px;font:inherit;font-size:.68rem;font-weight:850;cursor:pointer;white-space:nowrap}.v27-unit-open:not(:disabled):hover{border-color:color-mix(in srgb,var(--brand) 38%,var(--line));color:var(--brand)}.v27-unit-open:disabled{cursor:not-allowed;color:#9aa2ad;background:var(--v27-lock-bg);opacity:.85}
      .v27-question-action{min-height:36px;border:0;border-radius:10px;background:transparent;color:var(--brand);font:inherit;font-size:.66rem;font-weight:850;cursor:pointer;padding:0 8px}
      .v27-no-results{padding:28px;text-align:center;color:var(--muted)}
      .v27-progress-gate{max-width:84ch;margin:28px auto 4px;padding:20px 22px;border:1px solid var(--line);border-radius:18px;background:var(--surface,#fff)}.v27-progress-gate-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}.v27-progress-gate .eyebrow{color:var(--brand);font-size:.6rem;font-weight:900;letter-spacing:.13em}.v27-progress-gate h3{margin:5px 0 6px;color:var(--ink);font-size:1.2rem}.v27-progress-gate p{margin:0;color:var(--muted);font-size:.76rem;line-height:1.55;max-width:74ch}.v27-gate-steps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.v27-gate-step{border:1px solid var(--line);border-radius:13px;padding:12px 13px;background:var(--surface-2,#f7f9fb)}.v27-gate-step small{display:block;color:var(--muted);font-size:.62rem;font-weight:800}.v27-gate-step b{display:block;margin-top:4px;color:var(--ink);font-size:.8rem}.v27-gate-step.done{border-color:#d4e9dc;background:var(--v27-ok-bg)}.v27-gate-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:15px}.v27-gate-actions button{min-height:43px;border-radius:11px;padding:0 14px;font:inherit;font-size:.72rem;font-weight:850;cursor:pointer}.v27-gate-actions .primary{border:0;background:var(--brand,#2458d3);color:#fff}.v27-gate-actions .ghost{border:1px solid var(--line);background:var(--surface,#fff);color:var(--ink)}.v27-gate-actions button:disabled{opacity:.55;cursor:not-allowed}.v27-gate-note{display:block;margin-top:11px;color:var(--muted);font-size:.65rem;line-height:1.45}
      .v27-study-progress-card{margin:0 0 16px;padding:18px 20px;border:1px solid var(--line);border-radius:18px;background:var(--surface,#fff)}.v27-study-progress-card .head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}.v27-study-progress-card h3{margin:5px 0 6px;color:var(--ink);font-size:1.15rem}.v27-study-progress-card p{margin:0;color:var(--muted);font-size:.76rem;line-height:1.55}.v27-study-progress-card .v27-gate-actions{margin-top:13px}
      .v27-trail-view .v26-index-list{display:none!important}.v27-trail-view .v26-internal-hero{margin-bottom:18px}.v27-reader-progressed .v18-reader-footer .neighbors,.v27-reader-progressed .v16-prevnext{display:none!important}
      @media(max-width:820px){
        .v27-mode-note{margin-inline:12px;display:block}.v27-mode-note p{margin-top:4px}.v27-trail-summary{grid-template-columns:1fr;padding:17px 16px;border-radius:15px}.v27-progress-number{text-align:left;display:flex;gap:8px;align-items:baseline}.v27-progress-number strong{font-size:1.25rem}.v27-trail-chapter{border-radius:0;border-left:0;border-right:0}.v27-trail-chapter-head{grid-template-columns:auto minmax(0,1fr);padding:14px}.v27-chapter-progress{grid-column:2}.v27-trail-unit{grid-template-columns:36px minmax(0,1fr);padding:13px 14px;gap:10px}.v27-unit-side{grid-column:2;justify-content:flex-start;flex-wrap:wrap}.v27-unit-open{min-height:42px}.v27-progress-gate{margin:22px 14px 4px;padding:17px 16px}.v27-progress-gate-head{display:block}.v27-gate-steps{grid-template-columns:1fr}.v27-gate-actions{display:grid;grid-template-columns:1fr}.v27-gate-actions button{width:100%}.v27-study-progress-card{padding:16px}.v27-study-progress-card .head{display:block}
      }
    `;
    document.head.appendChild(s);
  }

  function questionPool(){
    try{
      if(Array.isArray(window.OAB_QUESTIONS)) return window.OAB_QUESTIONS;
      if(typeof QUESTIONS !== 'undefined' && Array.isArray(QUESTIONS)) return QUESTIONS;
    }catch{}
    return [];
  }

  function questionIdSet(){ return new Set(questionPool().map(q=>String(q.id))); }

  function strictQuestionIds(discipline, chapterId, subtopic=''){
    const map=window.OAB_V16_QUESTION_MAP||{};
    const available=questionIdSet();
    const taxonomy=window.OAB_V35_TAXONOMY;
    const sources=subtopic?(taxonomy?.sourceSubtopicsFor?.(discipline,chapterId,subtopic)||[subtopic]):[];
    const sourceKeys=new Set(sources.map(x=>slug27(clean27(x))).filter(Boolean));
    const ids=[];
    for(const [id,m] of Object.entries(map)){
      if(!m?.strict || m.discipline!==discipline || m.chapterId!==chapterId) continue;
      if(subtopic){
        if(!m.subtopicStrict) continue;
        if(!sourceKeys.has(slug27(clean27(m.subtopicTitle||'')))) continue;
      }
      if(available.size && !available.has(String(id))) continue;
      ids.push(String(id));
    }
    return ids;
  }

  function requiredQuestionCount(idsOrCount){
    const n=Array.isArray(idsOrCount)?idsOrCount.length:Number(idsOrCount||0);
    return n>0?Math.min(3,n):0;
  }

  function learningBaseKey(unit){ return `${unit.discipline}|${unit.chapterId}|${unit.subtopicTitle?slug27(clean27(unit.subtopicTitle)):'__chapter__'}`; }

  function fragmentCompletion(baseKey){
    const completed=progress?.learningPath?.completed||{};
    if(completed[baseKey]) return true;
    const prefix=`${baseKey}|part-`;
    const matches=Object.keys(completed).filter(k=>k.startsWith(prefix));
    if(!matches.length) return false;
    let expected=0; const parts=new Set();
    for(const key of matches){
      const m=key.match(/\|part-(\d+)-of-(\d+)$/); if(!m) continue;
      parts.add(Number(m[1])); expected=Math.max(expected,Number(m[2]));
    }
    return expected>0 && parts.size>=expected;
  }

  function learningDone(unit){
    const base=learningBaseKey(unit),taxonomy=window.OAB_V35_TAXONOMY;
    if(taxonomy?.isLearningKeyDone?.(base,progress)) return true;
    if(fragmentCompletion(base)) return true;
    // Compatibilidade apenas para unidade de capítulo sem subtópicos.
    if(!unit.subtopicTitle && progress?.topics?.[unit.chapterId]?.completedAt) return true;
    return false;
  }

  function answeredCount(ids){ return (ids||[]).filter(id=>!!progress?.answers?.[id]).length; }

  function unitStarted(unit){
    try{
      const cur=progress?.currentStudy;
      if(cur?.discipline===unit.discipline && cur?.topicId===unit.chapterId){
        const cs=clean27(cur.subtopicTitle||'');
        if(!unit.subtopicTitle || !cs || cs===clean27(unit.subtopicTitle)) return true;
      }
      const pos=typeof readingPositionFor==='function'?readingPositionFor(unit.discipline,unit.chapterId):null;
      if(pos){
        if(!unit.subtopicTitle) return true;
        if(clean27(pos.subtopicTitle||'')===clean27(unit.subtopicTitle)) return true;
      }
    }catch{}
    return Number(progress?.topics?.[unit.chapterId]?.studySec||0)>0 && !unit.subtopicTitle;
  }

  function makeRawUnits(discipline){
    let chapters=[];
    try{ chapters=typeof disciplineChapters==='function'?disciplineChapters(discipline):[]; }catch{}
    const units=[];
    chapters.forEach((chapter,chapterIndex)=>{
      const subs=(chapter.subtopics||[]).filter(Boolean);
      const list=subs.length?subs:[''];
      list.forEach((subtopicTitle,unitIndex)=>{
        const qids=strictQuestionIds(discipline,chapter.id,subtopicTitle);
        const unit={
          discipline, chapter, chapterId:chapter.id, chapterTitle:clean27(chapter.title), chapterIndex,
          subtopicTitle, label:subtopicTitle?(window.OAB_V35_TAXONOMY?.labelFor?.(discipline,chapter.id,subtopicTitle)||clean27(subtopicTitle)):clean27(chapter.title), unitIndex,
          key:`${discipline}|${chapter.id}|${subtopicTitle?slug27(clean27(subtopicTitle)):'__chapter__'}`,
          questionIds:qids, requiredQuestions:requiredQuestionCount(qids), answeredQuestions:answeredCount(qids)
        };
        unit.learned=learningDone(unit);
        unit.practiceDone=unit.requiredQuestions===0 || unit.answeredQuestions>=unit.requiredQuestions;
        unit.complete=unit.learned && unit.practiceDone;
        unit.started=unitStarted(unit);
        units.push(unit);
      });
    });
    return {chapters,units};
  }

  function unitState(unit, chainOpen=true){
    if(unit.complete) return 'completed';
    if(!chainOpen) return 'locked';
    if(unit.learned && !unit.practiceDone) return 'questions_pending';
    if(unit.started) return 'in_study';
    return 'available';
  }

  function buildDisciplinePath(discipline){
    const {chapters,units}=makeRawUnits(discipline);
    let chainOpen=true;
    units.forEach((unit,index)=>{
      unit.index=index;
      unit.state=unitState(unit,chainOpen);
      // Um item concluído fora da ordem preserva seu estado histórico, mas não pula uma lacuna anterior.
      if(chainOpen && !unit.complete) chainOpen=false;
    });
    const completed=units.filter(u=>u.complete).length;
    const firstIncomplete=units.find(u=>!u.complete)||null;
    const grouped=chapters.map((chapter,chapterIndex)=>{
      const items=units.filter(u=>u.chapterIndex===chapterIndex);
      return {chapter,chapterIndex,units:items,completed:items.filter(u=>u.complete).length,total:items.length};
    });
    return {
      discipline,chapters:grouped,units,completed,total:units.length,
      percent:units.length?Math.round(completed/units.length*100):0,
      firstIncomplete,
      completedAll:!!units.length && completed===units.length
    };
  }

  function findPathUnit(discipline, topicId, subtopicTitle=''){
    const path=buildDisciplinePath(discipline);
    const wanted=clean27(subtopicTitle||'');
    let unit=null;
    if(wanted) unit=path.units.find(u=>u.chapterId===topicId && clean27(u.subtopicTitle)===wanted)||null;
    else unit=path.units.find(u=>u.chapterId===topicId && !u.subtopicTitle)||null;
    return {path,unit};
  }

  function openUnit(unit){
    if(!unit) return false;
    const fresh=buildDisciplinePath(unit.discipline).units.find(u=>u.key===unit.key)||unit;
    if(fresh.state==='locked'){
      try{toast('Conclua a unidade anterior para liberar esta etapa.','bad');}catch{}
      return false;
    }
    if(typeof safeRoute==='function') safeRoute('reader',{discipline:fresh.discipline,topicId:fresh.chapterId,subtopicTitle:fresh.subtopicTitle||''});
    return true;
  }

  function readerOrigin(){
    const s=window.OAB_V26?.readerSession;
    if(!s || (typeof route!=='undefined' && route!=='reader')) return null;
    const anchor=clone27(s.scrollAnchor || window.OAB_V26?.captureReaderPosition?.() || null);
    return {payload:clone27(s.payload||routePayload||{}),scrollAnchor:anchor,at:Date.now()};
  }

  function openVerifiedQuestions(unit){
    if(!unit) return false;
    const fresh=buildDisciplinePath(unit.discipline).units.find(u=>u.key===unit.key)||unit;
    const byId=new Map(questionPool().map(q=>[String(q.id),q]));
    const ids=[...(fresh.questionIds||[])].map(String).filter(id=>byId.get(id)?.discipline===fresh.discipline);
    if(!ids.length){
      try{toast('Não há questão FGV/OAB especificamente validada para esta unidade. A conclusão depende apenas do estudo do conteúdo.','bad');}catch{}
      return false;
    }
    const origin=readerOrigin();
    const opened=window.OAB_STATE.openQuestionContext({
      discipline:fresh.discipline,questionIds:ids,
      studyContext:{
        discipline:fresh.discipline,label:`${fresh.chapterTitle} · ${fresh.label}`,mode:'v27-progression-verified',
        count:ids.length,verified:true,chapterId:fresh.chapterId,subtopic:fresh.subtopicTitle||'',
        progression:true,required:requiredQuestionCount(ids),unitKey:fresh.key,
        ...(origin?{readerOrigin:origin}:{})
      }
    });
    if(!opened){try{toast('Não foi possível montar a prática específica desta unidade.','bad');}catch{}return false;}
    if(origin && window.OAB_V26?.readerSession){
      window.OAB_V26.readerSession.pendingQuestionOrigin=clone27(origin);
    }
    if(typeof safeRoute==='function') safeRoute('questions');
    return true;
  }

  function statusMeta(unit){
    const q=unit.requiredQuestions;
    if(unit.state==='completed') return unit.questionIds.length?`${unit.answeredQuestions}/${q} prática mínima · ciclo concluído`:'sem questão específica · ciclo concluído';
    if(unit.state==='questions_pending') return `${unit.answeredQuestions}/${q} questões mínimas respondidas`;
    if(unit.state==='locked') return 'libera após concluir a etapa anterior';
    if(q) return `${q} de ${unit.questionIds.length} questões específicas formam a amostra mínima`;
    return 'sem questão específica validada · basta concluir a leitura';
  }

  function renderTrailHtml(path,currentKey='',term=''){
    const query=norm27(term||'').trim();
    const currentUnit=currentKey?path.units.find(u=>u.key===currentKey):null;
    const focusUnit=currentUnit||path.firstIncomplete||path.units[path.units.length-1]||null;
    const focusChapterId=focusUnit?.chapterId||'';
    const groups=path.chapters.map(group=>{
      const visible=group.units.filter(u=>!query || norm27(`${group.chapter.title} ${u.label}`).includes(query));
      if(!visible.length) return '';
      // Divulgação progressiva: em disciplinas extensas, apenas o capítulo relevante fica aberto.
      // Uma busca abre todos os capítulos que possuem correspondência para não esconder resultados.
      const shouldOpen=!!query || group.chapter.id===focusChapterId;
      return `<details class="v27-trail-chapter" data-chapter="${esc27(group.chapter.id)}" ${shouldOpen?'open':''}>
        <summary class="v27-trail-chapter-head"><span class="v27-chapter-no">${String(group.chapterIndex+1).padStart(2,'0')}</span><span><b>${esc27(clean27(group.chapter.title))}</b><small>${group.total} unidade${group.total===1?'':'s'} de estudo</small></span><span class="v27-chapter-progress">${group.completed}/${group.total} concluídas</span></summary>
        <div class="v27-trail-units">${visible.map(u=>{
          const action=u.state==='completed'?'Reabrir':u.state==='questions_pending'?'Revisar conteúdo':u.state==='locked'?'Bloqueado':u.state==='in_study'?'Continuar':'Estudar';
          const marker=u.state==='completed'?'✓':String(u.index+1).padStart(2,'0');
          return `<article class="v27-trail-unit ${u.key===currentKey?'current':''}" data-state="${u.state}" data-unit-key="${esc27(u.key)}">
            <span class="v27-unit-marker">${marker}</span>
            <span class="v27-unit-copy"><b>${esc27(u.label)}</b><small><span>${esc27(statusMeta(u))}</span>${u.questionIds.length?`<span>${u.questionIds.length} questão${u.questionIds.length===1?'':'ões'} específica${u.questionIds.length===1?'':'s'}</span>`:''}</small></span>
            <span class="v27-unit-side"><span class="v27-state ${u.state}">${STATE_LABELS[u.state]}</span>${u.state==='questions_pending'?`<button class="v27-question-action" data-v27-unit-questions="${esc27(u.key)}">Praticar</button>`:''}<button class="v27-unit-open" data-v27-unit-open="${esc27(u.key)}" ${u.state==='locked'?'disabled aria-disabled="true"':''}>${action}</button></span>
          </article>`;
        }).join('')}</div>
      </details>`;
    }).filter(Boolean).join('');
    return `<div class="v27-trail-shell">
      <section class="v27-trail-summary"><div><span class="eyebrow">TRILHA GUIADA</span><h3>${esc27(path.discipline)}</h3><p>Avance em sequência: conclua a exposição e, quando houver questões especificamente validadas, responda uma amostra mínima. A nota não bloqueia o avanço; erros seguem para a revisão.</p></div><div class="v27-progress-number"><strong>${path.completed}/${path.total}</strong><small>unidades concluídas</small></div><div class="v27-progress-track"><i style="width:${path.percent}%"></i></div></section>
      <div class="v27-trail-legend"><span>Disponível = próxima etapa</span><span>Questões pendentes = leitura concluída</span><span>Bloqueado = etapa futura</span></div>
      <div class="v27-trail-chapters">${groups||'<div class="v27-no-results">Nenhuma unidade corresponde à busca.</div>'}</div>
    </div>`;
  }

  function bindTrail(root,path){
    if(!root) return;
    root.querySelectorAll('[data-v27-unit-open]').forEach(btn=>btn.addEventListener('click',()=>{
      const unit=path.units.find(u=>u.key===btn.dataset.v27UnitOpen); openUnit(unit);
    }));
    root.querySelectorAll('[data-v27-unit-questions]').forEach(btn=>btn.addEventListener('click',()=>{
      const unit=path.units.find(u=>u.key===btn.dataset.v27UnitQuestions); openVerifiedQuestions(unit);
    }));
  }

  function enhanceDisciplinePage(){
    if(typeof route!=='undefined' && route!=='study') return;
    const discipline=routePayload?.discipline; if(!discipline) return;
    const host=document.getElementById('chapterList'); if(!host) return;
    installStyles();
    if(host.dataset.v27TrailMounted==='1') return;
    host.dataset.v27TrailMounted='1';
    const hero=document.querySelector('.discipline-hero');
    if(hero && !document.querySelector('.v27-mode-note')){
      hero.insertAdjacentHTML('afterend',`<section class="v27-mode-note"><div><b>Trilha guiada</b><p>Este é o caminho progressivo da disciplina. As unidades futuras são liberadas quando você conclui a leitura e a pequena amostra de questões específicas disponível.</p></div><div><b>Consulta livre continua disponível</b><p>“Disciplina completa” e o banco livre permanecem acessíveis sem alterar o estado da trilha.</p></div></section>`);
    }
    const full=document.getElementById('fullMaterialBtn'); if(full) full.textContent='Consulta livre · disciplina completa';
    const bank=document.getElementById('practiceDisc'); if(bank) bank.textContent='Banco livre da disciplina';
    const oldInput=document.getElementById('chapterSearch');
    let input=oldInput;
    if(oldInput && !oldInput.dataset.v27Bound){
      const clone=oldInput.cloneNode(true); clone.dataset.v27Bound='1'; clone.placeholder='Buscar capítulo ou unidade na trilha…'; oldInput.replaceWith(clone); input=clone;
    }
    const draw=()=>{
      const path=buildDisciplinePath(discipline);
      host.innerHTML=renderTrailHtml(path,'',input?.value||''); bindTrail(host,path);
    };
    if(input && !input.dataset.v27Listener){ input.dataset.v27Listener='1'; input.addEventListener('input',draw); }
    draw();
  }

  function currentReaderUnit(){
    const s=window.OAB_V26?.readerSession;
    const payload=s?.payload||((typeof routePayload!=='undefined'&&routePayload)||{});
    const discipline=payload?.discipline; if(!discipline || !payload?.topicId || payload.topicId==='__integral__') return {path:null,unit:null};
    return findPathUnit(discipline,payload.topicId,payload.subtopicTitle||'');
  }

  function gateDescription(unit){
    if(unit.state==='completed') return unit.questionIds.length
      ? `Leitura concluída e ${unit.answeredQuestions}/${unit.requiredQuestions} tentativas mínimas registradas. O próximo conteúdo está liberado.`
      : 'Leitura concluída. Como não há questão específica validada para esta unidade, nenhuma prática artificial é exigida para avançar.';
    if(!unit.learned) return 'Conclua esta leitura antes da prática obrigatória. As questões servem para recuperar o que acabou de estudar, não para apresentar o tema pela primeira vez.';
    return `A leitura já foi concluída. Responda mais ${Math.max(0,unit.requiredQuestions-unit.answeredQuestions)} questão${unit.requiredQuestions-unit.answeredQuestions===1?'':'ões'} específica${unit.requiredQuestions-unit.answeredQuestions===1?'':'s'} para liberar a próxima unidade.`;
  }

  function markLearningDirect(unit){
    progress.learningPath=progress.learningPath||{completed:{},version:18}; progress.learningPath.completed=progress.learningPath.completed||{};
    progress.learningPath.completed[learningBaseKey(unit)]={at:Date.now(),discipline:unit.discipline,chapterId:unit.chapterId,chapterTitle:unit.chapterTitle,subtopic:unit.subtopicTitle||'',source:'v27-reader',taxonomyVersion:window.OAB_V35_TAXONOMY?.VERSION||null};
    progress.topics=progress.topics||{}; progress.topics[unit.chapterId]=progress.topics[unit.chapterId]||{}; progress.topics[unit.chapterId].lastAt=Date.now();
    if(!unit.subtopicTitle) progress.topics[unit.chapterId].completedAt=Date.now();
    try{markDirty();saveProgress?.(true)?.catch?.(()=>{});}catch{}
  }

  function renderReaderGate(){
    if(typeof route!=='undefined' && route!=='reader') return;
    const article=window.OAB_V26?.readerSession?.article||document.getElementById('readerArticle'); if(!article) return;
    const {path,unit}=currentReaderUnit();
    if(!path||!unit){article.querySelector('.v27-progress-gate')?.remove();article.classList.remove('v27-reader-progressed');return;} // capítulo inteiro com subunidades = consulta, não etapa.
    const fresh=path.units.find(u=>u.key===unit.key)||unit; const next=path.units[fresh.index+1]||null;
    const signature=[fresh.key,fresh.state,fresh.learned?1:0,fresh.answeredQuestions,fresh.requiredQuestions,fresh.complete?1:0,next?.key||'',next?.state||''].join('|');
    const existing=article.querySelector('.v27-progress-gate');
    if(existing?.dataset.v27Signature===signature){article.classList.add('v27-reader-progressed');return;}
    existing?.remove(); article.classList.add('v27-reader-progressed');
    const gate=document.createElement('section'); gate.className='v27-progress-gate'; gate.dataset.v27Signature=signature;
    gate.innerHTML=`<div class="v27-progress-gate-head"><div><span class="eyebrow">PROGRESSÃO DA TRILHA · ${fresh.index+1}/${path.total}</span><h3>${esc27(STATE_LABELS[fresh.state])}</h3><p>${esc27(gateDescription(fresh))}</p></div><span class="v27-state ${fresh.state}">${STATE_LABELS[fresh.state]}</span></div>
      <div class="v27-gate-steps"><div class="v27-gate-step ${fresh.learned?'done':''}"><small>1 · EXPOSIÇÃO</small><b>${fresh.learned?'✓ leitura concluída':'Concluir a leitura desta unidade'}</b></div><div class="v27-gate-step ${fresh.practiceDone?'done':''}"><small>2 · RECUPERAÇÃO ATIVA</small><b>${fresh.requiredQuestions?`${fresh.answeredQuestions}/${fresh.requiredQuestions} questões mínimas respondidas`:'✓ sem questão específica obrigatória'}</b></div></div>
      <div class="v27-gate-actions">${!fresh.learned?'<button class="primary" data-v27-mark-learning>Concluir leitura</button>':''}${fresh.learned&&!fresh.practiceDone?`<button class="primary" data-v27-gate-questions>Praticar para avançar (${fresh.answeredQuestions}/${fresh.requiredQuestions})</button>`:''}${next?`<button class="${fresh.complete?'primary':'ghost'}" data-v27-next-unit ${fresh.complete&&next.state!=='locked'?'':'disabled'}>Próxima unidade →</button>`:''}${fresh.complete&&!next?'<button class="ghost" data-v27-open-review>Abrir Revisão inteligente</button>':''}<button class="ghost" data-v27-open-trail>Ver trilha completa</button></div>
      <small class="v27-gate-note">O desbloqueio considera tentativa, não percentual de acerto. Respostas erradas permanecem como sinal de fragilidade para a Revisão inteligente.</small>`;
    article.appendChild(gate);
    gate.querySelector('[data-v27-mark-learning]')?.addEventListener('click',()=>{
      const legacy=article.querySelector('#v18CompleteUnit')||article.querySelector('#v16CompleteUnit');
      if(legacy) legacy.click(); else markLearningDirect(fresh);
      setTimeout(()=>{renderReaderGate();enhanceToolbar();},30);
    });
    gate.querySelector('[data-v27-gate-questions]')?.addEventListener('click',()=>openVerifiedQuestions(fresh));
    gate.querySelector('[data-v27-next-unit]')?.addEventListener('click',()=>openUnit(next));
    gate.querySelector('[data-v27-open-review]')?.addEventListener('click',()=>{if(typeof safeRoute==='function')safeRoute('review');});
    gate.querySelector('[data-v27-open-trail]')?.addEventListener('click',()=>window.OAB_V26?.setView?.('index'));
  }

  function enhanceToolbar(){
    if(typeof route!=='undefined' && route!=='reader') return;
    const btn=document.querySelector('.v26-reader-toolbar [data-v26-view="index"]'); if(btn && btn.textContent!=='Trilha') btn.textContent='Trilha';
  }

  function enhanceInternalTrail(){
    const node=document.querySelector('.v26-internal-view[data-view="index"]'); if(!node || node.classList.contains('v27-trail-view')) return;
    const discipline=window.OAB_V26?.readerSession?.context?.discipline || window.OAB_V26?.readerSession?.payload?.discipline; if(!discipline) return;
    const {unit}=currentReaderUnit(); const path=buildDisciplinePath(discipline);
    node.classList.add('v27-trail-view');
    const eyebrow=node.querySelector('.v26-internal-hero .eyebrow'); if(eyebrow) eyebrow.textContent='TRILHA DE ESTUDO';
    const title=node.querySelector('.v26-internal-hero h2'); if(title) title.textContent=`Trilha de ${discipline}`;
    const p=node.querySelector('.v26-internal-hero p'); if(p) p.textContent='A trilha organiza o avanço sem voltar a comprimir o material. Conclua cada ciclo mínimo para liberar a etapa seguinte.';
    const list=node.querySelector('.v26-index-list'); if(list){
      const wrap=document.createElement('div'); wrap.innerHTML=renderTrailHtml(path,unit?.key||''); const shell=wrap.firstElementChild; list.replaceWith(shell); bindTrail(shell,path);
    }
  }

  function studyProgressCard(unit,path){
    const next=path.units[unit.index+1]||null;
    return `<section class="v27-study-progress-card"><div class="head"><div><span class="eyebrow">CICLO DESTA UNIDADE</span><h3>${STATE_LABELS[unit.state]}</h3><p>${esc27(gateDescription(unit))}</p></div><span class="v27-state ${unit.state}">${STATE_LABELS[unit.state]}</span></div><div class="v27-gate-steps"><div class="v27-gate-step ${unit.learned?'done':''}"><small>LEITURA</small><b>${unit.learned?'✓ concluída':'pendente'}</b></div><div class="v27-gate-step ${unit.practiceDone?'done':''}"><small>QUESTÕES MÍNIMAS</small><b>${unit.requiredQuestions?`${unit.answeredQuestions}/${unit.requiredQuestions}`:'não exigidas'}</b></div></div><div class="v27-gate-actions">${unit.learned&&!unit.practiceDone?'<button class="primary" data-v27-study-questions>Fazer prática validada</button>':''}${unit.complete&&next?'<button class="primary" data-v27-study-next>Próxima unidade →</button>':''}<button class="ghost" data-v27-study-trail>Ver trilha</button></div><small class="v27-gate-note">Erros não impedem avanço: eles são mantidos no histórico para revisão adaptativa.</small></section>`;
  }

  function enhanceInternalStudy(){
    const node=document.querySelector('.v26-internal-view[data-view="study"]'); if(!node || node.querySelector('.v27-study-progress-card')) return;
    const {path,unit}=currentReaderUnit(); if(!path||!unit) return;
    const fresh=path.units.find(u=>u.key===unit.key)||unit; const grid=node.querySelector('.v26-study-grid'); if(!grid) return;
    const wrap=document.createElement('div'); wrap.innerHTML=studyProgressCard(fresh,path); const card=wrap.firstElementChild; grid.before(card);
    card.querySelector('[data-v27-study-questions]')?.addEventListener('click',()=>openVerifiedQuestions(fresh));
    card.querySelector('[data-v27-study-next]')?.addEventListener('click',()=>openUnit(path.units[fresh.index+1]));
    card.querySelector('[data-v27-study-trail]')?.addEventListener('click',()=>window.OAB_V26?.setView?.('index'));
    const qbtn=node.querySelector('[data-v26-unit-questions]');
    if(qbtn){
      if(fresh.questionIds.length){qbtn.disabled=false;qbtn.textContent=`Prática validada (${fresh.answeredQuestions}/${fresh.requiredQuestions})`;qbtn.dataset.v27Verified='1';qbtn.dataset.v27UnitKey=fresh.key;}
      else if(!qbtn.disabled){qbtn.textContent='Reforço opcional';}
    }
    const stateCard=[...node.querySelectorAll('.v26-study-card')].find(c=>/ESTADO DA UNIDADE/i.test(c.textContent||''));
    if(stateCard){const pill=stateCard.querySelector('.v26-state-pill');if(pill){pill.textContent=STATE_LABELS[fresh.state];pill.classList.toggle('done',fresh.state==='completed');}}
  }

  function enhanceNow(){
    state.scheduled=false;
    installStyles();
    try{
      if(typeof route!=='undefined' && route==='study' && routePayload?.discipline) enhanceDisciplinePage();
      if(typeof route!=='undefined' && route==='reader'){
        enhanceToolbar();
        if(window.OAB_V26?.readerSession?.view==='reading') renderReaderGate();
        enhanceInternalTrail(); enhanceInternalStudy();
      }
    }catch(e){ console.warn('OAB v27 enhancement parcial',e); }
  }

  function scheduleEnhance(){
    if(state.scheduled) return; state.scheduled=true;
    requestAnimationFrame(()=>setTimeout(enhanceNow,0));
  }

  function installObserver(){
    if(state.observer) return;
    const host=document.getElementById('content')||document.body;
    state.observer=new MutationObserver(scheduleEnhance);
    state.observer.observe(host,{childList:true,subtree:true});
  }

  // Intercepta somente a prática obrigatória da view “Seu estudo”. Reforço autoral opcional segue a lógica da v20.
  document.addEventListener('click',e=>{
    const qbtn=e.target.closest?.('[data-v26-unit-questions][data-v27-verified="1"]');
    if(qbtn){
      const {path}=currentReaderUnit(); const unit=path?.units.find(u=>u.key===qbtn.dataset.v27UnitKey);
      if(unit){e.preventDefault();e.stopImmediatePropagation();openVerifiedQuestions(unit);return;}
    }
    if(e.target.closest?.('#v18CompleteUnit,#v16CompleteUnit,[data-v26-complete]')) setTimeout(scheduleEnhance,35);
    if(e.target.closest?.('[data-v26-view="index"],[data-v26-view="study"],[data-v26-back-reading]')) setTimeout(scheduleEnhance,0);
  },true);

  const baseRenderStudy27=window.renderStudy;
  if(typeof baseRenderStudy27==='function'){
    window.renderStudy=function(payload){const out=baseRenderStudy27(payload);setTimeout(scheduleEnhance,0);setTimeout(scheduleEnhance,130);return out;};
  }

  const baseRenderReader27=window.renderReader;
  if(typeof baseRenderReader27==='function'){
    window.renderReader=function(payload){const out=baseRenderReader27(payload);setTimeout(scheduleEnhance,0);setTimeout(scheduleEnhance,240);return out;};
  }

  const baseRenderRoute27=window.renderRoute;
  if(typeof baseRenderRoute27==='function'){
    window.renderRoute=function(){const out=baseRenderRoute27();setTimeout(scheduleEnhance,0);setTimeout(scheduleEnhance,150);return out;};
  }

  window.OAB_V27={
    version:VERSION,STATE_LABELS,strictQuestionIds,requiredQuestionCount,learningDone,unitState,
    buildDisciplinePath,findPathUnit,openUnit,openVerifiedQuestions,renderTrailHtml,
    enhanceDisciplinePage,renderReaderGate,enhanceInternalTrail,enhanceInternalStudy,scheduleEnhance
  };
  installStyles(); installObserver(); scheduleEnhance();
  document.documentElement.dataset.oabVersion=VERSION;
  console.info('OAB Focus SUPER v27 ativo');
})();
