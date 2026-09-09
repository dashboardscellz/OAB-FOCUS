/* OAB Focus v35.14 — Motor autoral inspirado na estrutura de cobrança das questões reais FGV/OAB.
   Usa o banco real apenas como corpus de estilo; não copia enunciados nem casos. */
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.OAB_V35_AUTHORIAL_FGV=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const VERSION='35.14';
  const LETTERS='ABCD';
  // Gate explícito: bloquear frases como 'considerando o material' e equivalentes mortos.
  const DEAD_PROMPTS=[/considerando (?:exclusivamente )?o material/i,/conte[uú]do estudado/i,/unidade que voc[eê] acabou de estudar/i,/regra apresentada no material/i,/compat[ií]vel com o material/i];
  const clean=(s='')=>String(s??'').replace(/\s+/g,' ').trim();
  const norm=(s='')=>clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const punct=s=>/[.!?]$/.test(clean(s))?clean(s):clean(s)+'.';
  const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
  const names=['Marina','Rafael','Camila','Eduardo','Larissa','Bruno','Renata','Felipe','Isabela','André'];
  function pick(arr,key){return arr[hash(key)%arr.length];}

  function corpusProfile(bank=[]){
    const real=(bank||[]).filter(q=>q&&!q.authorial&&q.sourceType!=='authorial');
    const lens=real.map(q=>(clean(q.statement).match(/\S+/g)||[]).length).sort((a,b)=>a-b);
    const median=lens.length?lens[Math.floor(lens.length/2)]:0;
    const caseLike=real.filter(q=>/\b(?:foi|ajuizou|contratou|pretende|recebeu|celebrou|determinad[oa]|sociedade empres[aá]ria|munic[ií]pio|estado|uni[aã]o|advogad[oa]|empregad[oa]|acusad[oa]|consumidor)\b/i.test(q.statement||'')).length;
    return {realQuestions:real.length,medianStatementWords:median,caseLikeRatio:real.length?caseLike/real.length:0};
  }

  function archetypeFor(discipline='',topic='',rule='',seq=1){
    const d=norm(discipline),t=norm(topic),r=norm(rule);
    if(/penal/.test(d)&&!/processo/.test(d))return 'criminal';
    if(/processo|trabalho/.test(d)||/prazo|recurso|compet[eê]ncia|procedimento|execu[cç][aã]o|inquerito/.test(t+' '+r))return 'chronology';
    if(/constitucional|administrativo|eleitoral|tribut[aá]rio/.test(d)||/compet[eê]ncia|autoridade|poder|administra[cç][aã]o/.test(t+' '+r))return 'authority';
    return seq%2?'consultation':'conflict';
  }

  function scenario(archetype,discipline,topic,rule,seq){
    const person=pick(names,discipline+'|'+topic+'|'+seq),topicLabel=clean(topic)||clean(discipline),r=norm(rule);
    let facts='';
    if(/atividades? privativas? da advocacia/.test(r)){
      facts=`Uma sociedade empresária que não possui advogado em seus quadros passou a oferecer, mediante remuneração, consultoria e orientação jurídica aos próprios clientes. Ao ser questionada, sustentou que a atividade seria livre porque não atua em processos judiciais.`;
    }else if(/\bcompete\b|compet[eê]ncia/.test(r)){
      facts=`Diante de um caso envolvendo ${topicLabel}, duas autoridades públicas reivindicam competência para praticar o mesmo ato. ${person}, responsável pela análise jurídica, precisa indicar qual atuação respeita a repartição legal de competências.`;
    }else if(/\bprazo\b/.test(r)&&/\b\d{1,3}\b/.test(rule)){
      const m=rule.match(/\b(\d{1,3})\b/),n=m?Number(m[1]):0,used=n?n+1:10;
      facts=`Em procedimento relacionado a ${topicLabel}, ${person} praticou o ato ${used} dias após o marco inicial pertinente. A parte contrária questionou a tempestividade e os efeitos jurídicos dessa conduta.`;
    }else if(/\bn[aã]o pode\b|\bé vedad[oa]\b|\bpro[ií]be/.test(r)){
      facts=`Em situação envolvendo ${topicLabel}, ${person} praticou determinada conduta apesar de existir controvérsia sobre sua admissibilidade jurídica. A parte adversa impugnou o ato e pediu o reconhecimento da consequência prevista para o instituto.`;
    }else if(/\bpode\b|\bé permitid[oa]\b|\badmite/.test(r)){
      facts=`Em caso relacionado a ${topicLabel}, ${person} requereu a adoção de determinada medida. A autoridade responsável recusou o pedido sob o argumento de que o ordenamento não admitiria essa providência em nenhuma hipótese.`;
    }else if(/\bdeve\b|\bdever[aá]\b|\bobriga/.test(r)){
      facts=`No curso de uma situação relacionada a ${topicLabel}, a pessoa responsável deixou de adotar uma providência exigida para o regular desenvolvimento do caso. ${person} foi consultado para avaliar os efeitos dessa omissão.`;
    }else if(/\bn[aã]o [ée]\b|\bn[aã]o s[aã]o\b|\b[ée]\b|\bs[aã]o\b/.test(r)){
      facts=`Após um conflito relacionado a ${topicLabel}, as partes passaram a divergir sobre a correta qualificação jurídica do fato e os efeitos decorrentes dessa classificação. ${person} foi procurado para emitir orientação.`;
    }else{
      facts=`Em uma controvérsia concreta envolvendo ${topicLabel}, ${person} recebeu versões jurídicas incompatíveis apresentadas pelas partes e precisa definir qual delas corresponde ao regime aplicável ao caso.`;
    }
    const commands=[
      'À luz do regime jurídico aplicável, assinale a afirmativa correta.',
      'Diante da situação apresentada, assinale a opção que contém a solução juridicamente adequada.',
      'De acordo com a disciplina jurídica do instituto, assinale a afirmativa correta.',
      'Sobre a solução da controvérsia, assinale a afirmativa correta.'
    ];
    return `${facts} ${commands[(seq-1)%commands.length]}`;
  }

  function replaceFirst(rule,re,repl){if(!re.test(rule))return '';const x=punct(rule.replace(re,repl));return clean(x)!==clean(rule)?x:'';}
  function numericMutation(rule){
    const m=rule.match(/\b(\d{1,3})\b/);if(!m)return '';
    const n=Number(m[1]);if(!Number.isFinite(n)||n===0)return '';
    const alt=n<10?n+1:n<=30?n+5:n+10;
    return punct(rule.replace(m[0],String(alt)));
  }
  function conditionMutation(rule){
    if(/\bdesde que\b/i.test(rule))return punct(rule.replace(/\bdesde que\b/i,'independentemente de'));
    if(/\bsalvo\b/i.test(rule))return punct(rule.replace(/\bsalvo\b/i,'inclusive'));
    if(/\bsomente\b/i.test(rule))return punct(rule.replace(/\bsomente\b/i,'também'));
    if(/\bapenas\b/i.test(rule))return punct(rule.replace(/\bapenas\b/i,'inclusive'));
    return '';
  }
  function buildDistractors(rule,topic){
    const candidates=[];
    const nr=norm(rule),nt=norm(topic);
    if(/atividades? privativas? da advocacia/.test(nr)){
      return [
        'Somente a postulação perante o Poder Judiciário constitui atividade privativa da advocacia, razão pela qual a consultoria jurídica pode ser prestada livremente por não advogados.',
        'A consultoria jurídica por não advogado é admitida quando prestada sem assinatura de parecer e sem representação judicial do cliente.',
        'A prestação de orientação jurídica é livre quando destinada exclusivamente a pessoas jurídicas e não envolver comparecimento perante órgãos públicos.'
      ];
    }
    const pairs=[[/\bnão pode\b/i,'pode'],[/\bpode\b/i,'deve'],[/\bnão deve\b/i,'deve'],[/\bdeve\b/i,'pode'],[/\bnão é\b/i,'é'],[/\bé\b/i,'não é'],[/\bnão são\b/i,'são'],[/\bsão\b/i,'não são'],[/\bcompete\b/i,'não compete'],[/\bcabe\b/i,'não cabe'],[/\bé vedad[oa]\b/i,'é permitido'],[/\bé permitid[oa]\b/i,'é vedado']];
    for(const [re,repl] of pairs){const x=replaceFirst(rule,re,repl);if(x)candidates.push(x);}
    const cm=conditionMutation(rule);if(cm)candidates.push(cm);
    const nm=numericMutation(rule);if(nm)candidates.push(nm);
    const tail=`No caso de ${clean(topic)}, a incidência da regra depende sempre de autorização judicial prévia, ainda que a legislação não estabeleça essa exigência.`;
    const tail2=`Em ${clean(topic)}, a consequência jurídica é automática em qualquer hipótese, independentemente dos requisitos previstos para o instituto.`;
    candidates.push(tail,tail2);
    const out=[];
    for(const c of candidates){const x=punct(c);if(norm(x)!==norm(rule)&&!out.some(y=>norm(y)===norm(x)))out.push(x);}
    return out.slice(0,3);
  }

  function explainWrong(rule,opt,basis){
    const nr=norm(rule),no=norm(opt);
    if(/autoriza[cç][aã]o judicial pr[eé]via/i.test(opt))return `Incorreta. A alternativa acrescenta requisito que não integra a regra jurídica aplicável. A exigência de autorização judicial só pode ser afirmada quando houver fundamento normativo específico. ${basis?`Fundamento identificado: ${basis}.`:''}`;
    if(/autom[aá]tica em qualquer hip[oó]tese|independentemente dos requisitos/i.test(opt))return `Incorreta. A opção transforma o instituto em regra absoluta e elimina requisitos ou exceções juridicamente relevantes. ${basis?`Fundamento identificado: ${basis}.`:''}`;
    return `Incorreta. A alternativa altera elemento decisivo da regra jurídica — como verbo normativo, requisito, exceção, competência, prazo ou efeito — e conduz a resultado diferente do regime aplicável. Regra de controle: ${punct(rule)} ${basis?`Fundamento identificado: ${basis}.`:''}`;
  }
  function buildResearch(rule,options,answer,topic,context){
    const QUALITY=root?.OAB_V35_QUESTION_QUALITY;
    const basis=QUALITY?.extractLegalBasis?.(context)||'';
    const letter=LETTERS[answer]||String(answer+1),alternatives={};
    options.forEach((o,i)=>alternatives[LETTERS[i]]=i===answer
      ?`Correta. Aplicando os fatos do enunciado ao regime jurídico de ${clean(topic)}, esta opção preserva a regra relevante: ${punct(rule)} ${basis?`Fundamento identificado: ${basis}.`:''}`
      :explainWrong(rule,o,basis));
    return {
      officialAnswer:letter,
      whyCorrect:`A alternativa ${letter} está correta porque resolve a situação apresentada sem alterar os requisitos, limites ou efeitos jurídicos do instituto. Regra determinante: ${punct(rule)}`,
      basis:basis||'O fundamento normativo específico não foi identificado automaticamente; o item permanece sinalizado para validação jurídica individual antes de ser tratado como revisado.',
      trap:'Pegadinha FGV/OAB: a alternativa errada costuma parecer juridicamente familiar, mas troca um requisito, competência, prazo, exceção ou efeito decisivo.',
      reviewRule:`Regra de revisão: ${punct(rule)}`,
      alternatives,
      sourceNote:'Questão autoral OAB Focus construída em formato de caso ou controvérsia jurídica, inspirada na estrutura das questões reais FGV/OAB, sem reprodução de enunciado real.'
    };
  }

  function qualityGate(q){
    const reasons=[];
    if(!q||DEAD_PROMPTS.some(re=>re.test(q.statement||'')))reasons.push('dead_prompt');
    if((clean(q.statement).match(/\S+/g)||[]).length<22)reasons.push('statement_too_short');
    if(!Array.isArray(q.options)||q.options.length!==4)reasons.push('option_count');
    if(q.options?.some(o=>!clean(o)||DEAD_PROMPTS.some(re=>re.test(o))))reasons.push('bad_option');
    if(new Set((q.options||[]).map(norm)).size!==4)reasons.push('duplicate_options');
    if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)reasons.push('answer');
    if((q.options||[]).some(o=>/material|unidade que voc[eê]|conte[uú]do estudado/i.test(o)))reasons.push('mechanical_material_reference');
    return {ok:reasons.length===0,reasons};
  }

  function buildQuestion({id,discipline,topic,chapterId='',seq=1,rule,context='',exam='Autoral — OAB Focus'}){
    rule=punct(rule);topic=clean(topic)||clean(discipline);
    const archetype=archetypeFor(discipline,topic,rule,seq);
    const statement=scenario(archetype,discipline,topic,rule,seq);
    const wrong=buildDistractors(rule,topic);if(wrong.length<3)return null;
    const answer=hash(`${id}|${seq}`)%4,options=wrong.slice();options.splice(answer,0,rule);options.length=4;
    const research=buildResearch(rule,options,answer,topic,context);
    const q={id,number:seq,displayNumber:seq,discipline,exam,statement,options,answer,comment:`${research.whyCorrect} Fundamento jurídico: ${research.basis}`,research,researchVersion:'v35.14-fgv-authorial',topic,microtopic:topic,source:'OAB Focus — questão autoral em padrão FGV/OAB',sourceType:'authorial',authorial:true,excludeFromHistoricalStats:true,chapterId,styleArchetype:archetype};
    const gate=qualityGate(q);return gate.ok?q:null;
  }

  return {VERSION,corpusProfile,archetypeFor,buildDistractors,buildResearch,buildQuestion,qualityGate,DEAD_PROMPTS};
});
