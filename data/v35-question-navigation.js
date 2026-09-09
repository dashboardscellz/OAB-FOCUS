/* OAB Focus v35.12 — separação entre Banco de Questões e prática contextual do Prepare-se/leitor */
(function(){
  'use strict';
  const VERSION='35.12';
  const api=window.OAB_QUESTION_NAV=window.OAB_QUESTION_NAV||{};
  const state=window.OAB_STATE;
  if(!state)return;

  const BASE={discipline:'',topic:'',exam:'',status:'all',search:'',questionId:''};
  const CONTEXT_KEYS=new Set(['questionIds','studyContext','adaptiveMode','replay','replayIds','justAnsweredId']);
  let mode='bank';
  let ownerToken='';

  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch{return v;}}
  function cleanBankFilters(source={}){
    const out={...BASE};
    for(const [k,v] of Object.entries(source||{})){
      if(CONTEXT_KEYS.has(k))continue;
      out[k]=clone(v);
    }
    return out;
  }

  let bankFilters=cleanBankFilters(state.getQuestionFilters?.()||{});

  function currentOwner(){try{return String(progressOwnerUid||user?.uid||'');}catch{return ''}}
  function ensureOwner(){
    const now=currentOwner();
    if(now&&ownerToken&&now!==ownerToken){bankFilters={...BASE};mode='bank';}
    if(now)ownerToken=now;
  }
  function currentFilters(){return state.getQuestionFilters?.()||{};}
  function hasContext(filters=currentFilters()){
    return !!(filters?.studyContext || (Array.isArray(filters?.questionIds)&&filters.questionIds.length));
  }
  function captureBankFilters(){
    ensureOwner();
    if(mode!=='bank')return clone(bankFilters);
    bankFilters=cleanBankFilters(currentFilters());
    return clone(bankFilters);
  }
  function setBankFilters(next={},apply=true){
    ensureOwner();
    bankFilters=cleanBankFilters({...bankFilters,...clone(next)});
    mode='bank';
    if(apply)state.setQuestionFilters(bankFilters);
    try{qIndex=0;}catch{}
    return clone(bankFilters);
  }
  function enterBank({render=false}={}){
    ensureOwner();
    mode='bank';
    state.setQuestionFilters(bankFilters);
    try{qIndex=0;}catch{}
    if(render && typeof route!=='undefined' && route==='questions' && typeof renderQuestions==='function')renderQuestions();
    return clone(bankFilters);
  }
  function leaveContextForManualFilter(){
    ensureOwner();
    if(mode!=='context'&&!hasContext())return;
    const visible=cleanBankFilters(currentFilters());
    mode='bank';
    state.setQuestionFilters(visible);
    bankFilters=clone(visible);
    try{qIndex=0;}catch{}
  }

  /* Toda prática de trilha/unidade é transitória. O banco independente fica guardado à parte. */
  const baseOpenContext=state.openQuestionContext?.bind(state);
  if(baseOpenContext){
    state.openQuestionContext=function(ctx={}){
      ensureOwner();
      if(mode==='bank')captureBankFilters();
      const opened=baseOpenContext(ctx);
      if(opened)mode='context';
      return opened;
    };
  }

  const baseClearContext=state.clearQuestionContext?.bind(state);
  if(baseClearContext){
    state.clearQuestionContext=function(){
      const out=baseClearContext();
      mode='bank';bankFilters=cleanBankFilters(out||currentFilters());
      return out;
    };
  }

  /* Entradas programáticas no banco (Revisão, busca global, disciplina inteira) também atualizam o banco,
     desde que não carreguem questionIds/studyContext de uma unidade guiada. */
  const baseSetRoute=typeof window.setRoute==='function'?window.setRoute:null;
  if(baseSetRoute){
    window.setRoute=setRoute=function(r,payload=null){
      if(r==='questions'){
        if(hasContext())mode='context';
        else {mode='bank';bankFilters=cleanBankFilters(currentFilters());}
      }
      return baseSetRoute(r,payload);
    };
  }

  const baseRenderQuestions=typeof window.renderQuestions==='function'?window.renderQuestions:null;
  if(baseRenderQuestions){
    window.renderQuestions=renderQuestions=function(...args){
      const out=baseRenderQuestions(...args);
      if(mode==='bank'&&!hasContext())bankFilters=cleanBankFilters(currentFilters());
      return out;
    };
  }

  /* A ABA Questões é sempre banco independente. Capture no window para rodar antes do roteador legado
     instalado no document e impedir que um contexto do Prepare-se contamine a navegação principal. */
  window.addEventListener('click',function(e){
    const target=e.target?.closest?.('[data-route="questions"],[data-mobile-route="questions"]');
    if(!target)return;
    e.preventDefault();e.stopImmediatePropagation();
    enterBank();
    if(typeof safeRoute==='function')safeRoute('questions');
    else if(typeof setRoute==='function')setRoute('questions');
  },true);

  /* "Ver banco completo" passa a restaurar o banco independente em vez de zerar/mesclar o caderno guiado. */
  window.addEventListener('click',function(e){
    const btn=e.target?.closest?.('#v15ClearQuestionContext');if(!btn)return;
    e.preventDefault();e.stopImmediatePropagation();enterBank({render:true});
  },true);

  /* Alterar qualquer filtro manualmente significa que o aluno saiu do caderno guiado e assumiu o banco. */
  window.addEventListener('change',function(e){
    if(!e.target?.matches?.('#fDisc,#fTopic,#fExam,#fStatus'))return;
    leaveContextForManualFilter();
    setTimeout(()=>{if(mode==='bank')captureBankFilters();},0);
  },true);
  window.addEventListener('input',function(e){
    if(!e.target?.matches?.('#fSearch'))return;
    leaveContextForManualFilter();
    setTimeout(()=>{if(mode==='bank')captureBankFilters();},0);
  },true);

  function snapshot(){ensureOwner();return {version:VERSION,mode,bankFilters:clone(bankFilters),activeFilters:clone(currentFilters())};}
  Object.assign(api,{VERSION,setBankFilters,enterBank,captureBankFilters,cleanBankFilters,leaveContextForManualFilter,snapshot});
  document.documentElement.dataset.oabQuestionNavigationVersion=VERSION;
})();
