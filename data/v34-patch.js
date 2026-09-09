/* OAB Focus SUPER v34 — auditoria pesada de trilha, feedback, grifos e tempo */
(function(){
  'use strict';
  const VERSION='34';
  const MIN_UNIT_QUESTIONS=3;
  const ACTIVE_IDLE_MS=90000;
  const LETTERS='ABCDE';
  const RESEARCH=window.OAB47_RESEARCH||{};
  const QUALITY=window.OAB_V35_QUESTION_QUALITY||null;
  const generatedIds=new Set();
  const coverageDone=new Set();
  const chapterCache=new Map();
  let actionRaf=0;
  let v34ActiveSession=null;
  let timerTicker=null;

  const esc34=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean34=(s='')=>String(s).replace(/^\d+(?:\.\d+){0,5}[\.)]?\s+/,'').replace(/\s+/g,' ').trim();
  const norm34=(s='')=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const slug34=(s='')=>norm34(s).replace(/\s+/g,'-').slice(0,110)||'unidade';
  const hash34=(s='')=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
  const fmt34=(sec=0)=>{sec=Math.max(0,Math.floor(Number(sec)||0));const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return h?`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;};

  /* ===================== 47ª OAB: pesquisa + feedback real ===================== */
  function hydrate47Research(){
    const qs=Array.isArray(window.OAB47_QUESTIONS)?window.OAB47_QUESTIONS:[];
    for(const q of qs){
      const r=RESEARCH[q.id]; if(!r) continue;
      q.research=r;
      q.officialStatus='preliminar-revisado-2026-09-07';
      q.researchVersion='v34-2026-09-07';
      q.comment=`${r.whyCorrect} Fundamento: ${r.basis}`;
    }
  }
  hydrate47Research();

  const baseFeedback=typeof feedbackHtml==='function'?feedbackHtml:null;
  window.feedbackHtml=feedbackHtml=function(q,a){
    const r=q?.research||RESEARCH[q?.id];
    if(!r){return baseFeedback?baseFeedback(q,a):'';}
    const selected=Number(a?.selected),selLetter=LETTERS[selected]||'—',correctLetter=LETTERS[q.answer]||r.officialAnswer||'—';
    const selectedText=q.options?.[selected]||'';
    const selectedAnalysis=r.alternatives?.[selLetter]||'';
    const status=a?.correct
      ? `<div class="v34-answer-verdict good"><strong>✓ Você marcou ${selLetter} — correta.</strong><span>Gabarito oficial: ${correctLetter}</span></div>`
      : `<div class="v34-answer-verdict bad"><strong>✕ Você marcou ${selLetter} — incorreta.</strong><span>Gabarito oficial: ${correctLetter}</span></div>`;
    const wrong=a?.correct?'':`<section class="v34-explain-block wrong"><h4>Por que sua alternativa está errada</h4><p><b>Alternativa ${selLetter}:</b> ${esc34(selectedText)}</p><p>${esc34(selectedAnalysis)}</p></section>`;
    const alternatives=Object.entries(r.alternatives||{}).map(([letter,text])=>`<article class="v34-alt-analysis ${letter===correctLetter?'correct':''} ${letter===selLetter?'chosen':''}"><b>${letter}${letter===correctLetter?' · correta':''}${letter===selLetter?' · sua marcação':''}</b><p>${esc34(text)}</p></article>`).join('');
    const trust=QUALITY?.commentTrust?.(q)||'reviewed';const trustLabel=trust==='generated-reviewed'?'Comentário autoral revisado':'Comentário revisado';
    return `<div class="feedback v34-feedback">${status}<div class="v34-trust-row"><span class="comment-trust-badge ${trust}">${trustLabel}</span></div>${wrong}
      <section class="v34-explain-block"><h4>Por que a correta está certa</h4><p>${esc34(r.whyCorrect)}</p></section>
      <section class="v34-explain-block legal"><h4>Fundamento jurídico</h4><p>${esc34(r.basis)}</p><small>${esc34(r.sourceNote||'')}</small></section>
      <section class="v34-explain-block trap"><h4>Armadilha da questão</h4><p>${esc34(r.trap||'')}</p></section>
      ${r.reviewRule?`<section class="v34-explain-block review"><h4>Regra para não errar novamente</h4><p>${esc34(r.reviewRule)}</p></section>`:''}
      <details class="v34-all-alternatives"><summary>Análise das alternativas</summary><div>${alternatives}</div></details>
    </div>`;
  };

  const baseSubmit=typeof submitAnswer==='function'?submitAnswer:null;
  if(baseSubmit){
    window.submitAnswer=submitAnswer=function(q){
      if(typeof selectedAnswer==='undefined'||selectedAnswer===null)return baseSubmit(q);
      const selected=Number(selectedAnswer),correct=selected===q.answer,r=q?.research||RESEARCH[q?.id]||null,now=Date.now();
      progress.errorLog=Array.isArray(progress.errorLog)?progress.errorLog:[];
      if(!correct){
        const letter=LETTERS[selected]||String(selected+1);
        progress.errorLog.push({
          id:`err-${q.id}-${now}`,qid:q.id,exam:q.exam||'',discipline:q.discipline||'',topic:q.topic||'',
          selectedOption:letter,selectedText:q.options?.[selected]||'',correctOption:LETTERS[q.answer]||'',correctText:q.options?.[q.answer]||'',
          conceptConfused:q.microtopic||q.topic||q.discipline||'Tema da questão',legalBasis:r?.basis||q.comment||'',
          whyWrong:r?.alternatives?.[letter]||'',whyCorrect:r?.whyCorrect||q.comment||'',at:now,recoveredAt:null
        });
        if(progress.errorLog.length>700)progress.errorLog=progress.errorLog.slice(-700);
      }else{
        for(let i=progress.errorLog.length-1;i>=0;i--){const x=progress.errorLog[i];if(x.qid===q.id&&!x.recoveredAt){x.recoveredAt=now;break;}}
      }
      return baseSubmit(q);
    };
  }

  /* ===================== TRILHA: hierarquia limpa, sem repetição ===================== */
  const baseChapters=typeof disciplineChapters==='function'?disciplineChapters:null;
  const baseSlice=typeof sliceTextBySubtopic==='function'?sliceTextBySubtopic:null;
  function headingNumber(s=''){const m=String(s).trim().match(/^(\d+(?:\.\d+){0,5})[\.)]?\s+/);return m?m[1]:'';}
  function headingDepth(s=''){const n=headingNumber(s);return n?n.split('.').length:99;}
  function hasDescendant(parent,all){const p=headingNumber(parent);if(!p)return false;return all.some(x=>{const n=headingNumber(x);return n&&n.startsWith(p+'.');});}
  function isTrailNoise(s=''){
    const raw=String(s).trim(),n=norm34(raw);
    if(!n||raw.length<3||raw.length>180)return true;
    if(/^(SUMÁRIO|SUMARIO|ÍNDICE|INDICE|BIBLIOGRAFIA|REFERÊNCIAS|REFERENCIAS)$/i.test(raw))return true;
    if(/STATUS DE EMENDA|STATUS DE NORMA SUPRALEGAL/i.test(raw))return true;
    if(/\.{4,}\s*\d+\s*$/.test(raw)||/^p[aá]gina\s+\d+$/i.test(raw))return true;
    if(/^(tabela|quadro|figura|imagem|esquema|mapa mental)\b/i.test(raw))return true;
    if(/^(caiu na oab|resumindo|preste aten[cç][aã]o|aten[cç][aã]o|exce[cç][oõ]es?)\s*[:.!-]*$/i.test(raw))return true;
    return false;
  }
  function lineHeadingMatch(line,subtopic){
    const a=norm34(clean34(line)),b=norm34(clean34(subtopic));return !!a&&!!b&&(a===b||a.replace(/\b(capitulo|secao)\b/g,'').trim()===b);
  }
  function directIntroForSubtopic(text='',subtopic=''){
    if(!subtopic)return String(text||'');
    const lines=String(text||'').split(/\r?\n/),targetDepth=headingDepth(subtopic);let start=-1,end=lines.length;
    for(let i=0;i<lines.length;i++){if(lineHeadingMatch(lines[i],subtopic)){start=i;break;}}
    if(start<0)return baseSlice?baseSlice(text,subtopic):'';
    for(let i=start+1;i<lines.length;i++){
      const line=lines[i].trim();if(!line)continue;
      let info=null;try{info=typeof v14HeadingInfo==='function'?v14HeadingInfo(line):null;}catch{}
      const d=info?.level||headingDepth(line),numbered=headingNumber(line);
      if(info||numbered){
        if(targetDepth===99||d>=targetDepth||d<=targetDepth){end=i;break;}
      }
    }
    return lines.slice(start,end).join('\n').trim();
  }
  function cleanTrailSubtopics(chapter){
    const raw=[...(chapter?.subtopics||[])].filter(x=>!isTrailNoise(x)),seen=new Set(),dedup=[];
    for(const st of raw){const k=norm34(clean34(st));if(!k||seen.has(k)||k===norm34(clean34(chapter.title)))continue;seen.add(k);dedup.push(st);}
    return dedup.filter(st=>{
      if(!hasDescendant(st,dedup))return true;
      const direct=(chapter.theory||[]).map(sec=>directIntroForSubtopic(sec.text||'',st)).filter(Boolean).join('\n');
      const body=direct.split(/\r?\n/).slice(1).join(' ').replace(/\s+/g,' ').trim();
      const words=(body.match(/\S+/g)||[]).length;
      return words>=18 && body.length>=120;
    });
  }
  window.sliceTextBySubtopic=sliceTextBySubtopic=function(text='',subtopic=''){
    const direct=directIntroForSubtopic(text,subtopic);
    return direct||'';
  };

  /* ===================== QUESTÕES ESPECÍFICAS EM TODA UNIDADE ===================== */
  function meaningfulRule(text='',unitLabel=''){
    const found=QUALITY?.extractRule?.(text,unitLabel);
    if(found?.rule)return found;
    const lines=String(text).split(/\r?\n/).map(x=>x.replace(/^[-•▪◦]\s*/, '').replace(/\s+/g,' ').trim()).filter(Boolean);
    for(let i=0;i<lines.length;i++){
      const joined=[lines[i],lines[i+1]||'',lines[i+2]||''].join(' ').replace(/\s+/g,' ').trim();
      if(QUALITY?.isCompleteLegalStatement?.(joined))return {rule:joined,basis:QUALITY?.extractLegalBasis?.(text)||''};
    }
    return {rule:'',basis:QUALITY?.extractLegalBasis?.(text)||''};
  }
  function distractorsFor(rule,label){
    const built=QUALITY?.buildDistractors?.(rule,label);
    if(Array.isArray(built)&&built.length>=3)return built.slice(0,3);
    const clean=clean34(label);
    return [
      `Em ${clean}, a regra aplica-se de modo absoluto, sem requisitos, limites, exceções ou distinções relevantes.`,
      `Em ${clean}, a consequência jurídica depende de requisito adicional que não consta do material estudado.`,
      `Em ${clean}, a solução independe das condições e exceções expressamente apresentadas na unidade.`
    ];
  }
  function unitText(chapter,subtopic){
    if(!subtopic)return (chapter.theory||[]).map(x=>x.text||'').join('\n');
    return (chapter.theory||[]).map(x=>directIntroForSubtopic(x.text||'',subtopic)).filter(Boolean).join('\n');
  }
  function authorialQuestion(discipline,chapter,subtopic,seq){
    const label=clean34(subtopic||chapter.title),text=unitText(chapter,subtopic),extracted=meaningfulRule(text,label),rule=extracted?.rule||'';
    if(!rule||!QUALITY?.isCompleteLegalStatement?.(rule))return null;
    const distr=distractorsFor(rule,label),correctIndex=hash34(`${discipline}|${chapter.id}|${label}|${seq}`)%4;
    const variants=[
      `Considerando exclusivamente o conteúdo estudado na unidade “${label}”, assinale a alternativa que reproduz corretamente a regra jurídica apresentada no material.`,
      `Em uma questão prática sobre “${label}”, qual premissa deve orientar a solução de acordo com a unidade que você acabou de estudar?`,
      `Para diferenciar “${label}” de conclusões excessivas ou requisitos inexistentes, assinale a afirmação compatível com o material da unidade.`
    ];
    const options=distr.slice();options.splice(correctIndex,0,rule);options.length=4;
    if(options.some(x=>!QUALITY?.isCompleteLegalStatement?.(x)))return null;
    const id=`v34-auto-${slug34(discipline)}-${slug34(chapter.id)}-${slug34(label)}-${seq}`;
    const lawContext=(chapter.law||[]).map(x=>x.text||'').join('\n');
    const researchContext=[text,lawContext].filter(Boolean).join('\n');
    const research=QUALITY?.buildResearch?.(rule,options,correctIndex,label,researchContext)||null;
    const comment=research?`${research.whyCorrect} Fundamento jurídico: ${research.basis}`:`A alternativa ${LETTERS[correctIndex]} reproduz a regra jurídica completa estudada na unidade “${label}”.`;
    return {id,number:0,displayNumber:0,discipline,exam:'Autoral — OAB Focus',statement:variants[(seq-1)%variants.length],options,answer:correctIndex,
      comment,research:research||undefined,researchVersion:research?'v35.7-authorial':undefined,
      topic:label,microtopic:label,source:'OAB Focus — criada exclusivamente a partir do material da unidade',sourceType:'authorial',authorial:true,excludeFromHistoricalStats:true,chapterId:chapter.id};
  }
  function strictIdsFor(discipline,chapterId,subtopic){
    try{return window.OAB_V27?.strictQuestionIds?.(discipline,chapterId,subtopic)||[];}catch{return [];}
  }
  function ensureCoverageForChapters(discipline,chapters){
    if(!Array.isArray(chapters)||!chapters.length)return;
    const pool=window.OAB_QUESTIONS||[];window.OAB_V16_QUESTION_MAP=window.OAB_V16_QUESTION_MAP||{};
    for(const chapter of chapters){
      const units=(chapter.subtopics||[]).length?chapter.subtopics:[''];
      for(const subtopic of units){
        const key=`${discipline}|${chapter.id}|${subtopic?slug34(clean34(subtopic)):'__chapter__'}`;
        if(coverageDone.has(key))continue;
        let ids=strictIdsFor(discipline,chapter.id,subtopic);
        for(let seq=1;ids.length<MIN_UNIT_QUESTIONS&&seq<=MIN_UNIT_QUESTIONS;seq++){
          const q=authorialQuestion(discipline,chapter,subtopic,seq);
          if(!q)break;
          if(!pool.some(x=>x.id===q.id)){pool.push(q);generatedIds.add(q.id);}
          window.OAB_V16_QUESTION_MAP[q.id]={discipline,chapterId:chapter.id,chapterTitle:chapter.title,strict:true,subtopicStrict:!!subtopic,subtopicTitle:subtopic||'',source:'v34-authorial-unit'};
          ids=strictIdsFor(discipline,chapter.id,subtopic);
        }
        coverageDone.add(key);
      }
    }
  }
  if(baseChapters){
    window.disciplineChapters=disciplineChapters=function(name){
      if(chapterCache.has(name))return chapterCache.get(name);
      const raw=baseChapters(name)||[];
      const cleaned=raw.map(ch=>({...ch,subtopics:cleanTrailSubtopics(ch)}));
      chapterCache.set(name,cleaned);ensureCoverageForChapters(name,cleaned);return cleaned;
    };
  }
  function auditAllTrailCoverage(){
    const material=(typeof MATERIAL!=='undefined'?MATERIAL:window.MATERIAL);const names=(material?.disciplines||[]).map(d=>d.name);let i=0;
    const step=deadline=>{let n=0;while(i<names.length&&n<1&&(!deadline||deadline.timeRemaining()>4)){try{disciplineChapters(names[i]);}catch(e){console.warn('v34 cobertura parcial',names[i],e);}i++;n++;}if(i<names.length){if('requestIdleCallback'in window)requestIdleCallback(step,{timeout:1600});else setTimeout(()=>step(null),140);}};
    if('requestIdleCallback'in window)requestIdleCallback(step,{timeout:2200});else setTimeout(()=>step(null),1800);
  }

  /* ===================== GRIFOS: teoria + legislação/súmulas + 6 cores ===================== */
  const HCOLORS=['yellow','green','blue','pink','purple','orange'];
  function highlightScopeBody(node){
    const el=node?.nodeType===3?node.parentElement:node;
    const body=el?.closest?.('.primary-material .integral-body, #zoneLaw .integral-body');
    if(!body)return null;return {body,scope:body.closest('#zoneLaw')?'law':'theory'};
  }
  window.captureReaderSelection=captureReaderSelection=function(){
    if(typeof route!=='undefined'&&route!=='reader')return;const sel=window.getSelection();if(!sel||sel.rangeCount!==1||sel.isCollapsed){v13ReaderSelection=null;return;}
    const range=sel.getRangeAt(0),a=highlightScopeBody(range.startContainer),b=highlightScopeBody(range.endContainer);if(!a||!b||a.body!==b.body||a.scope!==b.scope){v13ReaderSelection=null;return;}
    const pre=document.createRange();pre.selectNodeContents(a.body);pre.setEnd(range.startContainer,range.startOffset);const start=pre.toString().length,quote=sel.toString();if(!quote.trim()){v13ReaderSelection=null;return;}
    v13ReaderSelection={sectionKey:a.body.closest('.integral-section')?.dataset.sectionKey||'',scope:a.scope,start,end:start+quote.length,quote};
  };
  window.applyReaderHighlights=applyReaderHighlights=function(key){
    const roots=[document.querySelector('.primary-material'),document.querySelector('#zoneLaw')].filter(Boolean);if(!roots.length)return;roots.forEach(root=>unwrapHighlights(root));
    const items=[...getReaderHighlights(key)].sort((a,b)=>Number(b.start||b.segments?.[0]?.start||0)-Number(a.start||a.segments?.[0]?.start||0));
    for(const h of items){const scope=h.scope||h.segments?.[0]?.scope||'theory',root=scope==='law'?document.querySelector('#zoneLaw'):document.querySelector('.primary-material');if(!root)continue;const sec=[...root.querySelectorAll('[data-section-key].integral-section')].find(x=>x.dataset.sectionKey===h.sectionKey),body=sec?.querySelector('.integral-body');if(body)wrapTextOffset(body,h.start,h.end,h.color,h.id);}
    roots.forEach(root=>root.querySelectorAll('mark.oab-highlight').forEach(m=>m.onclick=()=>{const id=m.dataset.highlightId;if(!confirm('Remover este grifo?'))return;progress.highlights[key]=(progress.highlights[key]||[]).filter(x=>x.id!==id);markDirty();applyReaderHighlights(key);updateHighlightCount(key);}));
  };
  window.addReaderHighlight=addReaderHighlight=function(key,color){
    const s=v13ReaderSelection;if(!s){toast('Selecione um trecho do material explicado, da legislação ou das súmulas.','bad');return;}if(!HCOLORS.includes(color))color='yellow';progress.highlights[key]=progress.highlights[key]||[];progress.highlights[key].push({id:`h34-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,sectionKey:s.sectionKey,scope:s.scope||'theory',start:s.start,end:s.end,quote:s.quote,color,createdAt:Date.now(),anchorVersion:34});v13ReaderSelection=null;window.getSelection()?.removeAllRanges();markDirty();applyReaderHighlights(key);updateHighlightCount(key);toast(s.scope==='law'?'Legislação/súmula grifada.':'Trecho grifado.','good');
  };
  function augmentHighlightPalettes(){
    const targets=[['.v18-highlight-palette','data-v18-color'],['.v18-highlight-dock','data-v18-dock'],['.v17-selection-palette','data-v17-color'],['.v17-highlight-dock','data-v17-dock']];
    for(const [sel,attr] of targets){const root=document.querySelector(sel);if(!root)continue;for(const color of ['pink','purple','orange']){if(root.querySelector(`[${attr}="${color}"]`))continue;const b=document.createElement('button');b.className=(sel.includes('v18')?'v18-color':'v17-color')+' '+color;b.setAttribute(attr,color);b.setAttribute('aria-label',`Grifar em ${color}`);const close=root.querySelector('.close,.tool,#v18OpenHighlights,#v17OpenHighlights');root.insertBefore(b,close||null);}}
  }

  /* ===================== FEEDBACK VISUAL CENTRALIZADO ===================== */
  function enhanceQuestionUI(){
    const fav=document.getElementById('favBtn');if(fav){const on=/★|Favorita/.test(fav.textContent||'');fav.setAttribute('aria-pressed',String(on));fav.classList.toggle('v34-active-state',on);fav.title=on?'Questão marcada para revisão':'Marcar questão para revisão';}
    document.querySelectorAll('.answer.selected').forEach(x=>x.setAttribute('aria-pressed','true'));
  }
  function enhanceActionStates(){
    enhanceQuestionUI();augmentHighlightPalettes();enhanceStudyInternalView();mountStudyTimer();
    /* Estado visual derivado do estado real: remove resíduos de cliques anteriores antes de marcar o atual. */
    document.querySelectorAll('.seg,.nav-item,.v26-toolbar-btn').forEach(x=>x.classList.remove('v34-active-state'));
    document.querySelectorAll('[data-v27-view]').forEach(x=>x.classList.remove('v34-active-state'));
    document.querySelectorAll('.seg.active,.nav-item.active,.v26-toolbar-btn.active,[data-v27-view].active,[aria-current="page"]').forEach(x=>x.classList.add('v34-active-state'));
    document.querySelectorAll('button').forEach(b=>{if(!b.hasAttribute('type'))b.setAttribute('type','button');});
  }
  function scheduleEnhance(){if(actionRaf)return;actionRaf=requestAnimationFrame(()=>{actionRaf=0;enhanceActionStates();});}
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('#continueUnit,#continueTopic,#planStudyNow,[data-v27-open-unit],[data-chapter-open],#fullMaterialBtn');if(b){b.classList.add('v34-action-loading');b.setAttribute('aria-busy','true');if(b.id==='continueUnit'||b.id==='continueTopic')b.textContent='Abrindo seu estudo…';}
    const toggle=e.target.closest?.('[data-study-filter],.seg,.v26-toolbar-btn,[data-v27-view]');if(toggle)setTimeout(scheduleEnhance,0);
  },true);
  const baseRenderQuestion=typeof renderQuestionHost==='function'?renderQuestionHost:null;
  if(baseRenderQuestion){window.renderQuestionHost=renderQuestionHost=function(...args){const out=baseRenderQuestion(...args);scheduleEnhance();return out;};}
  const baseRenderRoute=typeof renderRoute==='function'?renderRoute:null;
  if(baseRenderRoute){window.renderRoute=renderRoute=function(...args){const out=baseRenderRoute(...args);scheduleEnhance();return out;};}
  const observer=new MutationObserver(()=>scheduleEnhance());observer.observe(document.documentElement,{childList:true,subtree:true});

  /* ===================== TEMPORIZADOR ATIVO E HISTÓRICO DE SESSÕES ===================== */
  function activeSessionSeconds(){return v34ActiveSession?Math.max(0,(progress?.studySec||0)-v34ActiveSession.baseTotal):0;}
  function todayStudySeconds(){try{return Number(progress?.days?.[todayKey()]?.studySec||0);}catch{return 0;}}
  function currentUnitSeconds(){const id=currentStudy?.topic?.id||progress?.currentStudy?.topicId||'';return Number(progress?.topics?.[id]?.studySec||0);}
  function finalizeSession(){
    if(!v34ActiveSession||!progress)return;const active=activeSessionSeconds();if(active>0){progress.studySessions=Array.isArray(progress.studySessions)?progress.studySessions:[];progress.studySessions.push({...v34ActiveSession,activeSec:active,endedAt:Date.now()});if(progress.studySessions.length>240)progress.studySessions=progress.studySessions.slice(-240);}v34ActiveSession=null;
  }
  const baseStartStudy=typeof startStudySession==='function'?startStudySession:null,baseStopStudy=typeof stopStudySession==='function'?stopStudySession:null;
  if(baseStartStudy&&baseStopStudy){
    window.startStudySession=startStudySession=function(discipline,topic){const out=baseStartStudy(discipline,topic);v34ActiveSession={id:`study-${Date.now()}`,discipline,topicId:topic?.id||'',topicTitle:topic?.title||'',startedAt:Date.now(),baseTotal:Number(progress?.studySec||0)};startVisibleTimer();return out;};
    window.stopStudySession=stopStudySession=function(){finalizeSession();const out=baseStopStudy();stopVisibleTimer();return out;};
  }
  function timerMetricsHtml(){return `<div class="v34-time-card"><span><small>Sessão</small><b data-v34-time="session">${fmt34(activeSessionSeconds())}</b></span><span><small>Nesta unidade</small><b data-v34-time="unit">${fmt34(currentUnitSeconds())}</b></span><span><small>Hoje</small><b data-v34-time="today">${fmt34(todayStudySeconds())}</b></span><span><small>Total acumulado</small><b data-v34-time="total">${fmt34(progress?.studySec||0)}</b></span></div>`;}
  function mountStudyTimer(){
    if(typeof route==='undefined'||route!=='reader'||!progress)return;const host=document.querySelector('.v18-doc-header,.reader-toolbar,.v26-reading-host,.reader-article');if(!host)return;
    let card=document.getElementById('v34StudyTimer');if(!card){card=document.createElement('section');card.id='v34StudyTimer';card.className='v34-study-timer';card.innerHTML=timerMetricsHtml();if(host.classList.contains('v18-doc-header'))host.appendChild(card);else host.parentNode?.insertBefore(card,host);}
    updateVisibleTimer();
  }
  function enhanceStudyInternalView(){
    const frame=document.querySelector('.v26-internal-view[data-view="study"]');if(!frame||frame.querySelector('.v34-study-internal-times'))return;const box=document.createElement('section');box.className='v34-study-internal-times';box.innerHTML=`<h3>Tempo de estudo ativo</h3>${timerMetricsHtml()}<p>O contador só avança com a aba visível e atividade recente; após 90 segundos sem interação, o tempo vazio deixa de ser contabilizado.</p>`;const grid=frame.querySelector('.v26-study-grid');(grid||frame).insertAdjacentElement(grid?'beforebegin':'beforeend',box);
  }
  function updateVisibleTimer(){
    const vals={session:activeSessionSeconds(),unit:currentUnitSeconds(),today:todayStudySeconds(),total:Number(progress?.studySec||0)};for(const [k,v] of Object.entries(vals))document.querySelectorAll(`[data-v34-time="${k}"]`).forEach(x=>x.textContent=fmt34(v));
    const compact=document.getElementById('v34FocusTimer');if(compact)compact.textContent=`Sessão ${fmt34(vals.session)}`;
    if(document.body.classList.contains('focus-mode')&&!compact){const c=document.createElement('div');c.id='v34FocusTimer';c.className='v34-focus-timer';c.textContent=`Sessão ${fmt34(vals.session)}`;document.body.appendChild(c);}else if(!document.body.classList.contains('focus-mode'))compact?.remove();
  }
  function startVisibleTimer(){if(timerTicker)return;timerTicker=setInterval(()=>{if(document.hidden||Date.now()-(typeof lastInteraction!=='undefined'?lastInteraction:Date.now())>ACTIVE_IDLE_MS){updateVisibleTimer();return;}updateVisibleTimer();},1000);}
  function stopVisibleTimer(){if(timerTicker){clearInterval(timerTicker);timerTicker=null;}updateVisibleTimer();}
  document.addEventListener('visibilitychange',()=>updateVisibleTimer());

  /* ===================== CSS DA AUDITORIA ===================== */
  const style=document.createElement('style');style.id='v34Styles';style.textContent=`
    button,.btn,.seg,.nav-item,.v26-toolbar-btn{transition:transform .12s ease,box-shadow .16s ease,background .16s ease,border-color .16s ease,color .16s ease,opacity .16s ease}
    button:not(:disabled):active,.btn:not(:disabled):active{transform:translateY(1px) scale(.985)}
    .v34-active-state,#favBtn[aria-pressed="true"]{border-color:#2f6e55!important;background:#eaf6ef!important;color:#174d39!important;box-shadow:0 0 0 3px rgba(47,110,85,.10)!important}
    #favBtn[aria-pressed="true"]::after{content:'  ✓';font-weight:900}
    .v34-action-loading{position:relative;opacity:.82;box-shadow:0 0 0 3px rgba(47,87,126,.10)!important}.v34-action-loading::after{content:'';display:inline-block;width:12px;height:12px;margin-left:8px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:v34spin .7s linear infinite;vertical-align:-2px}@keyframes v34spin{to{transform:rotate(360deg)}}
    .answer.selected:not(.correct):not(.wrong){border-color:#315d87!important;background:#edf5fc!important;box-shadow:0 0 0 3px rgba(49,93,135,.10)!important}
    .v34-feedback{display:grid;gap:12px;margin-top:18px}.v34-answer-verdict{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:14px 16px;border-radius:14px;border:1px solid}.v34-answer-verdict.good{background:#edf8f0;border-color:#b7dfc2;color:#1e6339}.v34-answer-verdict.bad{background:#fff1ef;border-color:#efc0ba;color:#8b2f25}.v34-answer-verdict span{font-size:.78rem;font-weight:800}
    .v34-explain-block{border:1px solid var(--line);background:var(--surface,#fff);border-radius:14px;padding:15px 16px}.v34-explain-block h4{margin:0 0 8px;font-size:.86rem}.v34-explain-block p{margin:0;line-height:1.7;font-size:.86rem}.v34-explain-block small{display:block;margin-top:8px;line-height:1.55;color:var(--muted)}.v34-explain-block.wrong{border-left:4px solid #c84b3f}.v34-explain-block.legal{border-left:4px solid #315d87}.v34-explain-block.trap{border-left:4px solid #b07a2a;background:#fffaf0}
    .v34-all-alternatives{border:1px solid var(--line);border-radius:14px;overflow:hidden}.v34-all-alternatives summary{cursor:pointer;padding:13px 15px;font-weight:850}.v34-all-alternatives>div{display:grid;gap:8px;padding:0 12px 12px}.v34-alt-analysis{border:1px solid var(--line);border-radius:12px;padding:11px 12px;background:var(--surface-2,#f7f9fc)}.v34-alt-analysis p{margin:5px 0 0;line-height:1.6;font-size:.8rem}.v34-alt-analysis.correct{border-color:#a9d7b7;background:#eff9f2}.v34-alt-analysis.chosen:not(.correct){border-color:#e5aca5;background:#fff5f3}
    .v18-color.pink,.v17-color.pink,.hl-color.pink{background:#f8c7d9!important}.v18-color.purple,.v17-color.purple,.hl-color.purple{background:#dbcaf6!important}.v18-color.orange,.v17-color.orange,.hl-color.orange{background:#ffd0a3!important}
    .oab-highlight.pink{background:#f8c7d9!important}.oab-highlight.purple{background:#dbcaf6!important}.oab-highlight.orange{background:#ffd0a3!important}
    .v34-study-timer{margin-top:16px}.v34-time-card{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.v34-time-card>span{min-width:0;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--surface-2,#f7f9fc)}.v34-time-card small{display:block;color:var(--muted);font-size:.64rem;font-weight:850;text-transform:uppercase;letter-spacing:.05em}.v34-time-card b{display:block;margin-top:4px;font-variant-numeric:tabular-nums;font-size:.94rem}.v34-study-internal-times{margin-bottom:18px;padding:16px;border:1px solid var(--line);border-radius:16px;background:var(--surface,#fff)}.v34-study-internal-times h3{margin:0 0 12px}.v34-study-internal-times>p{margin:10px 0 0;color:var(--muted);font-size:.75rem;line-height:1.55}
    .v34-focus-timer{position:fixed;top:max(12px,env(safe-area-inset-top));right:74px;z-index:260;padding:8px 11px;border-radius:999px;background:rgba(20,31,45,.88);color:#fff;font-size:.72rem;font-weight:850;font-variant-numeric:tabular-nums;backdrop-filter:blur(10px)}
    @media(max-width:820px){.v34-time-card{grid-template-columns:repeat(2,minmax(0,1fr))}.v34-answer-verdict{align-items:flex-start;flex-direction:column}.v34-focus-timer{right:58px}}
    @media(max-width:430px){.v34-time-card{grid-template-columns:1fr 1fr;gap:6px}.v34-time-card>span{padding:9px}.v34-explain-block{padding:13px}.v34-all-alternatives>div{padding:0 8px 8px}}
  `;document.head.appendChild(style);

  auditAllTrailCoverage();startVisibleTimer();scheduleEnhance();
  window.OAB_V34={version:VERSION,MIN_UNIT_QUESTIONS,cleanTrailSubtopics,directIntroForSubtopic,hasDescendant,ensureCoverageForChapters,auditAllTrailCoverage,enhanceActionStates,generatedIds,coverageDone};
})();
