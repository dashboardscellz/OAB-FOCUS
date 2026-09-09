(function(root){
  'use strict';
  const VERSION='36.0';
  const FALLBACK_EXAM_WEIGHTS=Object.freeze({
    'Ética':8,'Filosofia':2,'Constitucional':6,'Direitos Humanos':2,'Eleitoral':2,'Internacional':2,'Financeiro':2,'Tributário':5,
    'Administrativo':5,'Ambiental':2,'Civil':6,'ECA':2,'Consumidor':2,'Empresarial':4,'Processo Civil':6,'Penal':6,'Processo Penal':6,
    'Previdenciário':2,'Trabalho':5,'Processo do Trabalho':5
  });
  const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,Number(n)||0));
  const norm=(s='')=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const hash=(s='')=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};

  function normalizedQuota(weights,total=80){
    const entries=Object.entries(weights||{}).filter(([,v])=>Number(v)>0),target=Math.max(0,Math.floor(Number(total)||0));
    if(!entries.length||!target)return Object.fromEntries(entries.map(([k])=>[k,0]));
    const sum=entries.reduce((n,[,v])=>n+Number(v),0),rows=entries.map(([k,v])=>{const raw=Number(v)/sum*target;return {k,raw,n:Math.floor(raw),frac:raw-Math.floor(raw)};});
    let left=target-rows.reduce((n,x)=>n+x.n,0);
    rows.sort((a,b)=>b.frac-a.frac||String(a.k).localeCompare(String(b.k),'pt-BR'));
    for(let i=0;i<left;i++)rows[i%rows.length].n++;
    return Object.fromEntries(rows.sort((a,b)=>entries.findIndex(x=>x[0]===a.k)-entries.findIndex(x=>x[0]===b.k)).map(x=>[x.k,x.n]));
  }

  function priorityScore(x={}){
    const exam=clamp((Number(x.disciplineWeight)||0)/8),historical=clamp(x.historical),weakness=clamp(x.weakness),overdue=clamp(x.overdue),gap=clamp(x.coverageGap),difficulty=clamp(x.difficulty);
    const proximity=1-clamp((Number(x.daysToExam)||180)/180);
    const base=exam*.25+historical*.19+weakness*.24+overdue*.16+gap*.11+difficulty*.05;
    const urgency=proximity*(weakness*.45+overdue*.35+gap*.20)*.12;
    return Math.round(clamp(base+urgency)*100);
  }

  function isValidQuestion(q){return !!q&&typeof q.discipline==='string'&&Array.isArray(q.options)&&q.options.length===4&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4&&!q.annulled;}
  function isAuthorial(q){return !!(q?.authorial||/^autoral/i.test(String(q?.exam||''))||/authorial|autoral/i.test(String(q?.sourceType||''))||/quest[aã]o autoral/i.test(String(q?.source||'')));}
  function officialRank(q){if(isAuthorial(q))return 3;if(/official|fgv|prova_oficial/i.test(String(q?.sourceType||q?.kind||'')))return 0;if(/EOU|Exame de Ordem|FGV/i.test(`${q?.exam||''} ${q?.source||''}`))return 0;return 1;}
  function deterministicOrder(rows,answers,preferUnanswered){return [...rows].sort((a,b)=>{
    if(preferUnanswered){const aa=answers?.[a.id]?1:0,bb=answers?.[b.id]?1:0;if(aa!==bb)return aa-bb;}
    const ar=officialRank(a),br=officialRank(b);if(ar!==br)return ar-br;
    return hash(a.id)-hash(b.id);
  });}
  function buildWeightedQueue(questions,weights,total=80,opts={}){
    const valid=(questions||[]).filter(isValidQuestion),answers=opts.answers||{},preferUnanswered=opts.preferUnanswered!==false,quota=normalizedQuota(weights,total),out=[],used=new Set();
    for(const [discipline,need] of Object.entries(quota)){
      const rows=deterministicOrder(valid.filter(q=>q.discipline===discipline),answers,preferUnanswered);
      const official=rows.filter(q=>!isAuthorial(q)),chosen=(official.length>=need?official:rows).slice(0,need);
      for(const q of chosen){if(!used.has(q.id)){out.push(q);used.add(q.id);}}
    }
    if(out.length<total){
      const rest=deterministicOrder(valid.filter(q=>!used.has(q.id)),answers,preferUnanswered);
      for(const q of rest){if(out.length>=total)break;out.push(q);used.add(q.id);}
    }
    return out.slice(0,total);
  }

  function buildDiagnosticQueue(questions,opts={}){return buildWeightedQueue(questions,FALLBACK_EXAM_WEIGHTS,40,{answers:opts.answers||{},preferUnanswered:true});}
  function normalizeAuthorialProvenance(q){
    if(!q||!String(q.id||'').startsWith('v34-auto-'))return q;
    q.sourceType='authorial-drill';q.kind='questao_autoral_reforco';q.authorial=true;q.excludeFromHistoricalStats=true;
    q.exam='Autoral — reforço de regra';q.source='OAB Focus — reforço de regra extraído da unidade; não é questão oficial da FGV/OAB e não entra na incidência histórica.';
    return q;
  }
  function normalizeGeneratedPool(){for(const q of currentQuestions())normalizeAuthorialProvenance(q);}

  function latestExamWeights(){
    const recent=Array.isArray(root.OAB47_QUESTIONS)?root.OAB47_QUESTIONS.filter(q=>q&&!isAuthorial(q)):[];
    if(recent.length===80){const w={};for(const q of recent)w[q.discipline]=(w[q.discipline]||0)+1;if(Object.keys(w).length>=18)return w;}
    return {...FALLBACK_EXAM_WEIGHTS};
  }
  function currentProgress(){try{return typeof progress!=='undefined'&&progress?progress:(root.progress||{});}catch{return root.progress||{};}}
  function currentQuestions(){try{return typeof QUESTIONS!=='undefined'&&Array.isArray(QUESTIONS)?QUESTIONS:(Array.isArray(root.OAB_QUESTIONS)?root.OAB_QUESTIONS:[]);}catch{return Array.isArray(root.OAB_QUESTIONS)?root.OAB_QUESTIONS:[];}}
  function daysUntil(date){if(!date)return 90;const end=new Date(`${date}T12:00:00`);if(Number.isNaN(end.getTime()))return 90;return Math.max(0,Math.ceil((end-Date.now())/86400000));}
  function historicalRate(item){const exams=Number(item?.examCount)||0;const denom=Array.isArray(root.V13_COMPLETE_EXAMS)?Math.max(root.V13_COMPLETE_EXAMS.length,1):15;return clamp(exams/denom);}
  function topicState(item){
    const p=currentProgress(),answers=p.answers||{},ids=[];
    if(root.OAB_V16_QUESTION_MAP)for(const q of currentQuestions()){const m=root.OAB_V16_QUESTION_MAP[q.id];if(m?.strict&&m.discipline===item.discipline&&m.chapterId===item.target?.id)ids.push(q.id);}
    const attempted=ids.map(id=>answers[id]).filter(Boolean),correct=attempted.filter(a=>a.correct).length,acc=attempted.length?correct/attempted.length:.55;
    const study=Number(p.topics?.[item.target?.id]?.studySec)||0,coverageGap=study>=600?0:study>=300?.35:1;
    let overdue=0;const now=Date.now();
    const due=Array.isArray(p.reviewQueue)?p.reviewQueue:[];if(due.some(x=>x&&x.dueAt&&x.dueAt<=now&&(x.discipline===item.discipline||x.chapterId===item.target?.id)))overdue=1;
    return {weakness:1-acc,coverageGap,overdue,difficulty:attempted.length?clamp(1-acc):.35,attempted:attempted.length,accuracy:Math.round(acc*100)};
  }
  function reasonFor(item,score,state,weight){
    const parts=[];if(weight>=6)parts.push(`alto peso na prova (${weight}/80)`);else if(weight>=4)parts.push(`peso relevante (${weight}/80)`);
    if(state.weakness>=.45)parts.push('aproveitamento abaixo do alvo');
    if(state.overdue>=.8)parts.push('revisão vencida');
    if(state.coverageGap>=.8)parts.push('cobertura ainda insuficiente');
    if(historicalRate(item)>=.5)parts.push('recorrência histórica alta');
    if(!parts.length)parts.push('consolidação preventiva');return `Prioridade ${score}/100: ${parts.join(' + ')}.`;
  }

  function readinessSnapshot(){
    const weights=latestExamWeights(),p=currentProgress(),answers=p.answers||{},qs=currentQuestions().filter(isValidQuestion);
    let weightedAccuracy=0,weightSeen=0,weightedCoverage=0,totalW=Object.values(weights).reduce((a,b)=>a+b,0)||80;
    for(const [d,w] of Object.entries(weights)){
      const rows=qs.filter(q=>q.discipline===d),att=rows.filter(q=>answers[q.id]),correct=att.filter(q=>answers[q.id]?.correct).length;
      const acc=att.length?correct/att.length:0,coverage=rows.length?Math.min(1,att.length/Math.min(rows.length,Math.max(12,w*4))):0;
      weightedAccuracy+=acc*w;weightedCoverage+=coverage*w;if(att.length)weightSeen+=w;
    }
    const accuracy=weightSeen?Math.round(weightedAccuracy/weightSeen*100):0,coverage=Math.round(weightedCoverage/totalW*100);
    const readiness=Math.round(coverage*.45+accuracy*.55);
    return {readiness,accuracy,coverage,answered:Object.keys(answers).length,note:'Indicador interno de cobertura e desempenho; não é probabilidade de aprovação.'};
  }

  function installRuntime(){
    if(typeof document==='undefined')return;
    const W=latestExamWeights();
    if(typeof preparePriorityItems==='function'){
      const base=preparePriorityItems;
      preparePriorityItems=function(){
        const p=currentProgress(),rows=base()||[],days=daysUntil(p?.preparePlan?.examDate);
        return rows.map(item=>{const state=topicState(item),weight=W[item.discipline]||2,score=priorityScore({disciplineWeight:weight,historical:historicalRate(item),weakness:state.weakness,overdue:state.overdue,coverageGap:state.coverageGap,difficulty:state.difficulty,daysToExam:days});return {...item,v36Priority:score,v36Reason:reasonFor(item,score,state,weight),v36State:state};}).sort((a,b)=>b.v36Priority-a.v36Priority||Number(b.score||0)-Number(a.score||0));
      };
    }
    normalizeGeneratedPool();
    if(typeof disciplineChapters==='function'){
      const baseChaptersV36=disciplineChapters;
      disciplineChapters=function(){const out=baseChaptersV36.apply(this,arguments);normalizeGeneratedPool();return out;};
    }
    if(typeof startSimulation==='function'){
      startSimulation=function(){
        try{
          if(typeof qFilters!=='undefined')qFilters={discipline:'',topic:'',exam:'',status:'all',search:'',questionId:''};
          const p=currentProgress(),queue=buildWeightedQueue(currentQuestions(),latestExamWeights(),80,{answers:p?.answers||{},preferUnanswered:true});
          if(typeof qQueue!=='undefined')qQueue=queue;if(typeof qIndex!=='undefined')qIndex=0;
          if(p){p.lastSimulation={kind:'v36-weighted-80',startedAt:Date.now(),weights:latestExamWeights()};if(typeof markDirty==='function')markDirty();}
          if(typeof toast==='function')toast('Simulado OAB v36: 80 questões na distribuição atual da prova.');
          if(typeof renderQuestionHost==='function')renderQuestionHost(true);else if(typeof safeRoute==='function')safeRoute('questions');
        }catch(e){console.error('v36 simulation',e);}
      };
    }
    if(typeof renderPrepare==='function'){
      const basePrepare=renderPrepare;
      renderPrepare=function(){const out=basePrepare.apply(this,arguments);setTimeout(injectPreparePanel,0);return out;};
    }
  }
  function startDiagnostic(){
    try{
      const p=currentProgress(),queue=buildDiagnosticQueue(currentQuestions(),{answers:p?.answers||{}});
      if(typeof qFilters!=='undefined')qFilters={discipline:'',topic:'',exam:'',status:'all',search:'',questionId:''};
      if(typeof qQueue!=='undefined')qQueue=queue;if(typeof qIndex!=='undefined')qIndex=0;
      if(p){p.lastDiagnostic={kind:'v36-diagnostic-40',startedAt:Date.now(),count:queue.length};if(typeof markDirty==='function')markDirty();}
      if(typeof toast==='function')toast('Diagnóstico v36 iniciado: 40 questões ponderadas pela prova.');
      if(typeof renderQuestionHost==='function')renderQuestionHost(true);else if(typeof safeRoute==='function')safeRoute('questions');
      return queue;
    }catch(e){console.error('v36 diagnostic',e);return [];}
  }
  function injectPreparePanel(){
    const content=document.getElementById('content');if(!content||content.querySelector('.v36-readiness'))return;
    const snap=readinessSnapshot(),prior=typeof preparePriorityItems==='function'?(preparePriorityItems()||[]).slice(0,3):[];
    const panel=document.createElement('section');panel.className='section v36-readiness';
    panel.innerHTML=`<div class="v36-readiness-head"><div><span class="eyebrow">DIREÇÃO V36</span><h3>Prontidão de estudo: ${snap.readiness}/100</h3><p>${snap.note}</p></div><div class="v36-readiness-score"><strong>${snap.coverage}%</strong><small>cobertura ponderada</small><strong>${snap.accuracy}%</strong><small>aproveitamento observado</small></div></div><div class="v36-mission-grid">${prior.map((x,i)=>`<article><span>${i+1}</span><div><b>${escapeHtml(x.discipline)} · ${escapeHtml(x.topic||x.target?.title||'prioridade')}</b><p class="v36-priority-reason">${escapeHtml(x.v36Reason||'Prioridade calculada por incidência, domínio, revisão e cobertura.')}</p></div></article>`).join('')||'<article><span>1</span><div><b>Faça o diagnóstico inicial</b><p class="v36-priority-reason">O sistema precisa de respostas para calibrar fraquezas e cobertura.</p></div></article>'}</div><div class="v36-source-row"><span class="v36-source-badge">FGV/OAB</span><span class="v36-source-badge">peso da prova</span><span class="v36-source-badge">erros</span><span class="v36-source-badge">revisão</span><span class="v36-source-badge">cobertura</span></div>${snap.answered<80?'<div class="v36-diagnostic-action"><button class="btn primary small" id="v36Diagnostic">Fazer diagnóstico de 40 questões</button><small>Use no início para calibrar a ordem do estudo. Questões oficiais têm prioridade.</small></div>':''}`;
    const hero=content.querySelector('.prepare-hero');hero?.insertAdjacentElement('afterend',panel);document.getElementById('v36Diagnostic')?.addEventListener('click',startDiagnostic);
  }
  function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  const API={VERSION,FALLBACK_EXAM_WEIGHTS,normalizedQuota,priorityScore,isValidQuestion,isAuthorial,buildWeightedQueue,buildDiagnosticQueue,normalizeAuthorialProvenance,latestExamWeights,readinessSnapshot,startDiagnostic};
  root.OAB_V36_ENGINE=API;
  installRuntime();
})(typeof window!=='undefined'?window:globalThis);
