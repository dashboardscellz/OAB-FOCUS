/* OAB Focus v35.8 — estado compartilhado explícito entre patches */
(function(){
  'use strict';
  const VERSION='35.8';
  const state=window.OAB_STATE=window.OAB_STATE||{};
  function clone(value){try{return JSON.parse(JSON.stringify(value));}catch{return value;}}
  function getQuestionFilters(){return qFilters;}
  function setQuestionFilters(next={}){
    const base={discipline:'',topic:'',exam:'',status:'all',search:'',questionId:''};
    qFilters={...base,...clone(next)};
    return qFilters;
  }
  function patchQuestionFilters(patch={}){qFilters={...(qFilters||{}),...clone(patch)};return qFilters;}
  function questionHasValidKey(q){
    if(typeof hasValidAnswerKey==='function')return hasValidAnswerKey(q);
    return !!q&&Array.isArray(q.options)&&q.options.length>=2&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length;
  }
  function validQuestionIds(ids=[],discipline=''){
    const requested=new Set((ids||[]).map(String));
    return QUESTIONS.filter(q=>requested.has(String(q.id))&&(!discipline||q.discipline===discipline)&&questionHasValidKey(q)).map(q=>q.id);
  }
  function openQuestionContext(ctx={}){
    const discipline=String(ctx.discipline||ctx.studyContext?.discipline||'').trim();
    const ids=validQuestionIds(ctx.questionIds||[],discipline);
    if(!ids.length)return false;
    const studyContext={...(ctx.studyContext||{}),discipline,count:ids.length};
    setQuestionFilters({discipline,topic:'',exam:'',status:'all',search:'',questionId:'',...(ctx.filters||{}),questionIds:ids,studyContext});
    try{qIndex=0;}catch{}
    return qFilters;
  }
  function clearQuestionContext(){
    const next={...(qFilters||{})};
    delete next.questionIds;delete next.studyContext;delete next.adaptiveMode;delete next.replay;delete next.replayIds;delete next.justAnsweredId;
    return setQuestionFilters(next);
  }
  function snapshot(){return {version:VERSION,questionFilters:clone(qFilters||{}),route:typeof route==='undefined'?null:route};}
  Object.assign(state,{VERSION,getQuestionFilters,setQuestionFilters,patchQuestionFilters,openQuestionContext,clearQuestionContext,snapshot});
  document.documentElement.dataset.oabStateVersion=VERSION;
})();
