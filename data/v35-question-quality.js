/* OAB Focus v35.7 — motor de qualidade para questões autorais e auditoria de banco */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.OAB_V35_QUESTION_QUALITY=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION='35.7';
  const LETTERS='ABCDE';
  const GENERIC_PATTERNS=[
    /Questão autoral de fixação/i,
    /Questão autoral de reforço/i,
    /Regra diretamente extraída desta unidade/i,
    /Fundamento-base da unidade/i,
    /Revise o assunto correspondente/i
  ];
  const STRICT_DANGLING=new Set(['que','de','do','da','dos','das','em','para','por','com','sem','se','e','ou','nem','nao','sao','e','ser','estar','ter','deve','devem','pode','podem','como','quando','cujo','cuja','cujos','cujas','qual','quais']);
  const AUDIT_DANGLING_SET=new Set(['que','de','do','da','dos','das','em','para','por','com','sem','e','ou','nem','sao','e','deve','devem','pode','podem','como','quando','cujo','cuja','cujos','cujas','qual','quais']);
  const VERB_HINT=/\b(?:é|são|foi|será|serão|deve|devem|deverá|deverão|pode|podem|poderá|poderão|compete|cabe|exige|depend|veda|proíbe|permite|admite|assegura|garante|constitu|consiste|prevê|determina|responde|incumbe|aplica|afasta|impede|ocorre|possui|inclui|considera|autoriza|obriga|prescreve|decai|requer|pressupõe)\w*\b/i;

  const clean=(s='')=>String(s).replace(/\s+/g,' ').trim();
  const norm=(s='')=>clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const asciiWords=(s='')=>norm(s).replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean);
  const lastWord=(s='')=>{const a=asciiWords(s);return a[a.length-1]||'';};
  function looksHeading(s=''){
    const x=clean(s); if(!x)return false;
    if(/^\d+(?:\.\d+){0,5}[\.)]?\s+/.test(x) && x.length<150 && !/[.!?]$/.test(x)) return true;
    if(x===x.toUpperCase() && x.length<120 && /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(x) && !/[.!?]$/.test(x)) return true;
    return false;
  }
  function balanced(text,open,close){let n=0;for(const ch of text){if(ch===open)n++;else if(ch===close)n--;if(n<0)return false;}return n===0;}
  function isCompleteLegalStatement(s=''){
    const x=clean(s); if(x.length<40||x.length>700)return false;
    const core=x.replace(/[\s.;:!?]+$/,'');
    if(!core)return false;
    const lw=lastWord(core);
    if(!( /\bou não$/i.test(core) ) && STRICT_DANGLING.has(lw))return false;
    if(/[,:;\-–—]\s*$/.test(x))return false;
    if(!balanced(x,'(',')')||!balanced(x,'[',']'))return false;
    const words=x.match(/\S+/g)||[]; if(words.length<7)return false;
    if(!VERB_HINT.test(x))return false;
    if(/\b(?:etc|exemplo|observação|obs)\.?$/i.test(core))return false;
    return true;
  }
  function logicalParagraphs(text=''){
    const raw=String(text).replace(/\r/g,'').split('\n').map(x=>x.replace(/^[-•▪◦]\s*/,'').trim());
    const out=[]; let buf='';
    const flush=()=>{const x=clean(buf);if(x)out.push(x);buf='';};
    for(const line of raw){
      if(!line){flush();continue;}
      if(looksHeading(line)){flush();continue;}
      const n=norm(line);
      if(/^(?:fonte|refer[eê]ncia|bibliografia|sum[aá]rio|[ií]ndice|p[aá]gina)\b/.test(n))continue;
      buf=buf?`${buf} ${line}`:line;
      if(/[.!?]$/.test(line) || (buf.length>420 && isCompleteLegalStatement(buf)))flush();
    }
    flush();
    const sentences=[];
    for(const p of out){
      const parts=p.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9])/u);
      for(const part of parts){const x=clean(part);if(x)sentences.push(x);}
    }
    return sentences;
  }
  function scoreRule(s,label=''){
    let score=0; const n=norm(s),lab=norm(label);
    if(/\b(?:não|deve|pode|compete|cabe|exige|depende|prazo|direito|obrigação|vedad|permitid|privativ|exclusiv|prescrev|decai|nul|responsab)\w*\b/i.test(s))score+=7;
    if(/\b(?:art\.?|lei|constitui[cç][aã]o|cpc|cpp|clt|c[oó]digo|s[uú]mula|tema)\b/i.test(s))score+=5;
    if(lab){for(const w of lab.split(/\s+/).filter(w=>w.length>=5)){if(n.includes(w))score+=1;}}
    if(s.length>=80&&s.length<=360)score+=3;
    if(s.length>500)score-=3;
    return score;
  }
  function extractLegalBasis(text=''){
    const src=clean(text); const found=[];
    const patterns=[
      /\b(?:arts?\.?|artigos?)\s*\d+[ºoª]?(?:\s*,\s*(?:§\s*\d+[ºoª]?|inciso\s+[IVXLCDM]+|[IVXLCDM]+))*\b/gi,
      /\bLei\s+n?[ºo]?\s*\d{1,2}(?:\.\d{3})+(?:\/\d{2,4})?\b/gi,
      /\bLei\s+\d{1,2}\.\d{3}\/\d{2,4}\b/gi,
      /\b(?:Constitui[cç][aã]o Federal|CF\/?1988|CF\/88|CPC|CPP|CLT|CTN|CDC|ECA|EAOAB|C[oó]digo Civil|C[oó]digo Penal|Estatuto da OAB|Lei 8\.906\/1994)\b/gi,
      /\bS[uú]mula(?:\s+Vinculante)?\s+\d+\s+(?:STF|STJ|TST|TSE)?\b/gi,
      /\bTema\s+\d+\s+(?:STF|STJ|TST|TSE)?\b/gi
    ];
    for(const re of patterns){for(const m of src.matchAll(re)){const x=clean(m[0]);if(x&&!found.some(v=>norm(v)===norm(x)))found.push(x);if(found.length>=8)break;}if(found.length>=8)break;}
    return found.join('; ');
  }
  function extractRule(text='',label=''){
    const candidates=logicalParagraphs(text).filter(isCompleteLegalStatement);
    candidates.sort((a,b)=>scoreRule(b,label)-scoreRule(a,label));
    let rule=candidates[0]||'';
    if(!rule){
      const lines=String(text).replace(/\r/g,'').split('\n').map(clean).filter(x=>x&&!looksHeading(x));
      for(let i=0;i<lines.length;i++){
        const joined=clean([lines[i],lines[i+1]||'',lines[i+2]||''].join(' '));
        if(isCompleteLegalStatement(joined)){rule=joined;break;}
      }
    }
    return {rule,basis:extractLegalBasis(text),candidates:candidates.length};
  }
  function negateRule(rule=''){
    const transforms=[
      [/\bnão pode\b/i,'pode'],[/\bpode\b/i,'não pode'],[/\bnão deve\b/i,'deve'],[/\bdeve\b/i,'não deve'],
      [/\bnão é\b/i,'é'],[/\bé\b/i,'não é'],[/\bnão são\b/i,'são'],[/\bsão\b/i,'não são'],
      [/\bé vedad[oa]\b/i,'é permitido'],[/\bé permitid[oa]\b/i,'é vedado']
    ];
    for(const [re,repl] of transforms){if(re.test(rule)){const x=rule.replace(re,repl);if(isCompleteLegalStatement(x))return x;}}
    return '';
  }
  function ensurePunct(s=''){const x=clean(s);return /[.!?]$/.test(x)?x:`${x}.`;}
  function buildDistractors(rule,label=''){
    const topic=clean(label)||'esta unidade';
    const list=[]; const inv=negateRule(rule); if(inv)list.push(ensurePunct(inv));
    list.push(`Em ${topic}, a regra aplica-se de forma absoluta, sem requisitos, limites, exceções ou distinções relevantes.`);
    list.push(`Em ${topic}, a consequência jurídica somente ocorre após requisito adicional que não consta do material da unidade.`);
    list.push(`Em ${topic}, a solução correta independe das condições e exceções expressamente apresentadas no conteúdo estudado.`);
    const unique=[];for(const x of list){const y=ensurePunct(x);if(isCompleteLegalStatement(y)&&norm(y)!==norm(rule)&&!unique.some(z=>norm(z)===norm(y)))unique.push(y);}
    while(unique.length<3)unique.push(`A disciplina de ${topic} autoriza conclusão diferente da regra expressamente apresentada no material, ainda que os requisitos jurídicos sejam os mesmos.`);
    return unique.slice(0,3);
  }
  function explainWrongOption(rule,opt,basis){
    const x=clean(opt),n=norm(x),nr=norm(rule),inverse=negateRule(rule);
    if(inverse&&norm(inverse)===n)return `Incorreta. Esta alternativa inverte diretamente o comando jurídico da regra estudada: onde o material afirma “${ensurePunct(rule)}”, a opção apresenta a negação correspondente. Essa troca altera o conteúdo normativo e muda o resultado jurídico. Fundamento de controle: ${basis}`;
    if(/forma absoluta|sem requisitos, limites, exce[cç][oõ]es/i.test(x))return `Incorreta. A alternativa transforma a regra em absoluta e elimina requisitos, limites ou exceções que fazem parte do instituto. Em prova da OAB, expressões como “sempre”, “nunca” e “sem exceções” exigem conferência rigorosa. A regra de controle é: ${ensurePunct(rule)} Fundamento de controle: ${basis}`;
    if(/requisito adicional|condi[cç][aã]o adicional/i.test(x))return `Incorreta. A alternativa cria um requisito jurídico adicional que não integra a regra estudada. Não se pode acrescentar condição de validade, eficácia ou incidência sem apoio no texto normativo aplicável. Regra de controle: ${ensurePunct(rule)} Fundamento de controle: ${basis}`;
    if(/independe das condi[cç][oõ]es|independe.*exce[cç][oõ]es/i.test(x))return `Incorreta. A alternativa ignora condições e exceções relevantes e, com isso, generaliza indevidamente o instituto. A solução deve respeitar exatamente os pressupostos da regra: ${ensurePunct(rule)} Fundamento de controle: ${basis}`;
    return `Incorreta. A proposição “${x}” não reproduz a regra de controle da unidade. O erro precisa ser identificado comparando sujeito, verbo normativo, requisitos, exceções e efeitos com: ${ensurePunct(rule)} Fundamento de controle: ${basis}`;
  }
  function buildResearch(rule,options,answer,label,context=''){
    const basis=extractLegalBasis(context)||'Nenhum dispositivo legal ou precedente expresso foi identificado automaticamente no material desta unidade. O item não deve ser tratado como juridicamente validado até conferência em fonte oficial.';
    const letter=LETTERS[answer]||String(answer+1),hasOfficialBasis=!/^Nenhum dispositivo/.test(basis);
    const whyCorrect=`A alternativa ${letter} está correta porque reproduz a proposição jurídica completa estudada na unidade “${clean(label)}”: ${ensurePunct(rule)} O ponto decisivo é preservar sujeito, verbo normativo, requisitos, exceções e efeitos sem negar a regra, torná-la absoluta ou acrescentar condição inexistente.${hasOfficialBasis?` O material da unidade remete expressamente a: ${basis}.`:''}`;
    const alternatives={};
    (options||[]).forEach((opt,i)=>{
      const L=LETTERS[i]||String(i+1);
      alternatives[L]=i===answer
        ? `Correta. A opção mantém a regra integralmente: ${ensurePunct(rule)} Fundamento identificado no material: ${basis}`
        : explainWrongOption(rule,opt,basis);
    });
    return {
      officialAnswer:letter,
      whyCorrect,
      basis,
      trap:`Pegadinha típica de prova: reconhecer o tema não basta. Compare sujeito, verbo normativo, competência, prazo, requisitos, exceções e efeitos. Desconfie de negação do comando, absolutização da regra e criação de requisito sem base legal.`,
      reviewRule:`Regra para revisão: ${ensurePunct(rule)}`,
      alternatives,
      sourceNote:hasOfficialBasis?'Questão autoral OAB Focus construída a partir da unidade estudada e com fundamento normativo identificado no próprio material.':'Questão autoral OAB Focus construída a partir da unidade estudada. Como o material não trouxe fundamento oficial explícito detectável, esta questão deve permanecer marcada para validação jurídica individual antes de ser tratada como item validado.'
    };
  }
  function isObviouslyTruncated(s='',strict=false){
    const x=clean(s),core=x.replace(/[\s.;:!?]+$/,'');
    if(!x||core.length<2)return true;
    const lw=lastWord(core),rawLast=(core.match(/([A-Za-zÀ-ÿ]+)$/u)||[])[1]||'';
    if(!/\bou não$/i.test(core) && !/-se$/i.test(core) && !( /\bEstado E$/i.test(core) ) && !(rawLast&&rawLast[0]===rawLast[0].toUpperCase()&&rawLast[0]!==rawLast[0].toLowerCase()) && AUDIT_DANGLING_SET.has(lw))return true;
    if(/[,:\-–—]\s*$/.test(x))return true;
    if(!balanced(x,'(',')')||!balanced(x,'[',']'))return true;
    if(strict&&!isCompleteLegalStatement(x))return true;
    return false;
  }
  function auditQuestion(q){
    const issues=[]; const opts=Array.isArray(q?.options)?q.options:[];
    if(!clean(q?.statement))issues.push({code:'EMPTY_STATEMENT',severity:'critical'});
    if(opts.length<4)issues.push({code:'OPTION_COUNT',severity:'critical',detail:opts.length});
    const seen=new Set(); let dup=false,strict=!!(q?.authorial||q?.sourceType==='authorial'||/autoral/i.test(String(q?.exam||'')));
    opts.forEach((o,i)=>{const n=norm(o);if(isObviouslyTruncated(o,strict))issues.push({code:'TRUNCATED_OPTION',severity:'critical',option:i});if(n&&seen.has(n))dup=true;seen.add(n);});
    if(dup)issues.push({code:'DUPLICATE_OPTIONS',severity:'critical'});
    const annulled=!!q?.annulled||/^\(Anulada\)/i.test(String(q?.statement||''))||/quest[aã]o anulada/i.test(String(q?.comment||''));
    if(!annulled&&(!Number.isInteger(q?.answer)||q.answer<0||q.answer>=opts.length))issues.push({code:'INVALID_ANSWER',severity:'critical'});
    const comment=String(q?.comment||'');if(!annulled&&(!comment||GENERIC_PATTERNS.some(re=>re.test(comment))))issues.push({code:'GENERIC_COMMENT',severity:'high'});
    return issues;
  }
  function auditBank(qs=[]){
    const rows=[];for(const q of qs){const issues=auditQuestion(q);if(issues.length)rows.push({id:q.id||'',discipline:q.discipline||'',topic:q.topic||'',issues});}
    const counts={};for(const r of rows)for(const i of r.issues)counts[i.code]=(counts[i.code]||0)+1;
    return {version:VERSION,total:(qs||[]).length,flagged:rows.length,counts,rows};
  }
  return {VERSION,isCompleteLegalStatement,isObviouslyTruncated,logicalParagraphs,extractLegalBasis,extractRule,buildDistractors,buildResearch,auditQuestion,auditBank};
});
