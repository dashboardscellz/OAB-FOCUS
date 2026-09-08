/* OAB Focus v35.5 — taxonomia pedagógica global
   Reorganiza headings em unidades juridicamente coerentes sem alterar o texto-fonte. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root&&root.document) api.install(root);
})(typeof window!=='undefined'?window:null,function(){
  'use strict';

  const VERSION='35.5';
  const TARGET_MIN_WORDS=520;
  const TARGET_MAX_WORDS=1650;
  const MAX_LABEL=92;
  const unitMeta=new Map();
  const chapterMeta=new Map();
  const sectionRanges=new WeakMap();
  let installed=false;

  const stripMarks=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const norm=s=>stripMarks(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
  const slug=s=>norm(s).replace(/\s+/g,'-');
  const words=s=>(String(s||'').match(/\S+/g)||[]).length;
  const cleanNumber=s=>String(s||'').replace(/^\s*\d+(?:\.\d+){0,4}[\.)]?\s+/,'').replace(/\s+/g,' ').trim().replace(/[;:]$/,'').trim();
  const key=(d,c,s='')=>`${d}|${c}|${s?slug(cleanNumber(s)):'__chapter__'}`;

  const WHOLE_CHAPTERS=new Set([
    'administrativo|principios da administracao publica',
    'administrativo|poderes administrativos',
    'administrativo|organizacao da administracao publica',
    'administrativo|atos administrativos',
    'constitucional|nacionalidade',
    'constitucional|organizacao do estado e entes federativos',
    'constitucional|reparticao de competencia',
    'constitucional|intervencao',
    'eca|direitos fundamentais da crianca e do adolescente',
    'eca|familia substituta guarda tutela e adocao',
    'penal|ilicitude',
    'penal|culpabilidade',
    'penal|concurso de pessoas',
    'penal|concurso de crimes',
    'penal|crimes contra a honra',
    'previdenciario|beneficiarios do rgps e qualidade de segurado',
    'processo do trabalho|competencia',
    'processo do trabalho|despesas processuais',
    'processo do trabalho|acao trabalhista',
    'processo do trabalho|defesa do reu',
    'processo do trabalho|audiencia trabalhista',
    'trabalho|empregado',
    'trabalho|empregador',
    'trabalho|interrupcao e suspensao do contrato de trabalho',
    'trabalho|alteracao do contrato de trabalho',
    'tributario|principios tributarios',
    'tributario|competencia tributaria',
    'tributario|imunidades tributarias',
    'tributario|conceito de tributos e especies tributarias',
    'etica|atividades da advocacia e mandato judicial',
    'etica|inscricao na oab',
    'etica|direitos e prerrogativas dos advogados',
    'etica|sociedade de advogados e advogado empregado',
    'etica|honorarios advocaticios',
    'etica|incompatibilidades e impedimentos',
    'etica|infracoes e sancoes disciplinares'
  ]);
  const TOP_CHAPTERS=new Set([
    'constitucional|remedios constitucionais',
    'penal|crimes contra a vida',
    'processo civil|intervencao de terceiros e litisconsorcio'
  ]);
  const CUSTOM_CHAPTERS=new Set([
    'constitucional|teoria da constituicao',
    'constitucional|direitos e garantias fundamentais',
    'civil|contratos contratos em especie',
    'administrativo|improbidade administrativa conteudo completo',
    'administrativo|licitacoes e contratos conteudo completo',
    'etica|etica e estatuto da oab revisao completa'
  ]);

  const GENERIC=/^(conceito|conceitos|caracteristicas|requisitos|elementos|natureza|fundamento|fundamentos|titularidade|classificacao|classificacoes|especies|modalidades|hipoteses|efeitos|limites|limitacoes|regra geral|regras gerais|outros pontos|observacoes?)\b/i;

  function validHeading(raw){
    /* Remove somente marcadores editoriais; o texto jurídico fonte permanece intocado. */
    const line=String(raw||'').replace(/\s+/g,' ').replace(/\s*\*?CAIU\s+NA\s+OAB\s+\d+\*?.*$/i,'').trim();
    if(!line||line.length>150) return null;
    /* Aceita "3.Título" (comum nos PDFs), mas exige início maiúsculo quando não há espaço. */
    const m=line.match(/^(\d+(?:\.\d+){0,4})([\.)]?)(?:\s+|(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ]))(.+)$/);
    if(!m) return null;
    const number=m[1],marker=m[2]||'',originalLabel=m[3].trim();
    const label=cleanNumber(`${number}${marker} ${originalLabel}`);
    const n=norm(label),wc=words(label);
    if(!n||label.length<3||label.length>112||wc>16) return null;
    if(/\bna\s+oab\s+\d|https?\s|www\s|cronograma|simulado/i.test(n)) return null;
    if(/^(art|artigo|paragrafo|inciso|sumula|lei|decreto|dias?|anos?|meses?)\b/.test(n) && !/^artigo\s+5.*constituicao/.test(n)) return null;
    /* Enumerações "1) ..." são listas explicativas, não unidades pedagógicas. */
    if(marker===')') return null;
    if(/[,.]$/.test(originalLabel)&&wc>8) return null;
    if(/^[a-záéíóúâêôãõç]/.test(originalLabel)) return null;
    if(/\b(requisitos?\s+sao\s+necessarios?|supondo se|quando praticados mediante)\b/i.test(n)) return null;
    /* PDF/OCR: sumários, notas de rodapé, citações e linhas quebradas não são títulos didáticos. */
    if(/\.{3,}\s*\d*\s*$/.test(originalLabel)) return null;
    if(/(?:curso de|editora|op\.?\s*cit|p[aá]g\.?\s*\d|https?\b|www\.)/i.test(originalLabel)) return null;
    if(/^[–—\-"'“”‘’(]/.test(originalLabel)) return null;
    if(/^(confira-se|assim j[aá] decidiu|a lei geral de prote[cç][aã]o de dados)\b/i.test(originalLabel)) return null;
    if(/^(cp|cf|cpc|cpp|clt|cc|eca)\)?\b/i.test(originalLabel)) return null;
    if(/[-–—]$/.test(originalLabel)) return null;
    if(/\s(?:e|da|de|do|das|dos|a|o|à)\s*$/i.test(originalLabel) && wc>5) return null;
    return {raw:line,number,marker,label,level:number.split('.').length};
  }

  function parseHeadings(text=''){
    const lines=String(text).replace(/\r/g,'').split('\n'),out=[];
    lines.forEach((raw,lineIndex)=>{const h=validHeading(raw);if(h)out.push({...h,lineIndex});});
    return out;
  }

  function chapterKey(discipline,chapterTitle){return `${norm(discipline)}|${norm(chapterTitle)}`;}

  function strategyForChapter(discipline,chapterTitle,wordCount=0,headings=[]){
    const ck=chapterKey(discipline,chapterTitle);
    if(CUSTOM_CHAPTERS.has(ck)) return 'custom';
    if(TOP_CHAPTERS.has(ck)) return 'top';
    if(WHOLE_CHAPTERS.has(ck)) return 'whole';
    if(Number(wordCount||0)<=1400) return 'whole';
    const base=headings.length?Math.min(...headings.map(h=>h.level)):1;
    const top=headings.filter(h=>h.level===base);
    if(top.length<=1) return 'whole';
    return 'cluster';
  }

  function headingSegments(text,headings){
    const lines=String(text).replace(/\r/g,'').split('\n');
    if(!headings.length)return [];
    const base=Math.min(...headings.map(h=>h.level));
    const top=headings.filter(h=>h.level===base);
    return top.map((h,i)=>{
      const end=i+1<top.length?top[i+1].lineIndex:lines.length;
      const source=headings.filter(x=>x.lineIndex>=h.lineIndex&&x.lineIndex<end).map(x=>x.raw);
      const segment=lines.slice(h.lineIndex,end).join('\n').trim();
      return {heading:h,startLine:h.lineIndex,endLine:end,words:words(segment),sourceSubtopics:source};
    });
  }

  function sharedTopic(a,b){
    const stop=new Set(['de','da','do','das','dos','e','em','na','no','nas','nos','para','por','um','uma','a','o','as','os','constitucional','constitucionais','direito','direitos']);
    const A=new Set(norm(a).split(' ').filter(x=>x.length>3&&!stop.has(x)));
    const B=new Set(norm(b).split(' ').filter(x=>x.length>3&&!stop.has(x)));
    return [...A].some(x=>B.has(x));
  }

  function groupLabel(chapterTitle,atoms,index,total){
    const labels=atoms.map(x=>x.heading.label);
    if(labels.length===1)return labels[0];
    if(GENERIC.test(norm(labels[0])))return `${chapterTitle} — fundamentos e desdobramentos`;
    if(labels.length===2){
      const candidate=`${labels[0]} e ${labels[1]}`;
      if(candidate.length<=MAX_LABEL)return candidate;
    }
    const first=labels[0],last=labels[labels.length-1];
    let candidate=`${chapterTitle} — ${first} a ${last}`;
    if(candidate.length<=MAX_LABEL)return candidate;
    candidate=`${chapterTitle} — ${first}`;
    if(candidate.length<=MAX_LABEL)return candidate;
    const room=Math.max(24,MAX_LABEL-chapterTitle.length-3);
    const short=first.slice(0,room).replace(/\s+\S*$/,'').trim();
    return `${chapterTitle} — ${short||first.slice(0,room)}`;
  }

  function makeUnit(chapterTitle,atoms,index,total,labelOverride=''){
    const first=atoms[0],last=atoms[atoms.length-1];
    return {
      anchor:first.heading.raw,
      label:labelOverride||groupLabel(chapterTitle,atoms,index,total),
      startLine:first.startLine,
      endLine:last.endLine,
      words:atoms.reduce((n,x)=>n+x.words,0),
      sourceSubtopics:[...new Set(atoms.flatMap(x=>x.sourceSubtopics))]
    };
  }

  function boundaryUnits(text,specs){
    const lines=String(text||'').replace(/\r/g,'').split('\n'),found=[];
    let cursor=0;
    for(const spec of specs){
      const min=Math.max(cursor,Number(spec.minLine||0));let idx=-1;
      for(let i=min;i<lines.length;i++){
        if(spec.match.test(lines[i].trim())){idx=i;break;}
      }
      if(idx<0)return null;
      found.push({idx,label:spec.label,anchor:lines[idx].trim()});cursor=idx+1;
    }
    return found.map((f,i)=>{
      const end=i+1<found.length?found[i+1].idx:lines.length;
      const segment=lines.slice(f.idx,end).join('\n').trim();
      const source=parseHeadings(segment).map(h=>h.raw);
      return {anchor:f.anchor,label:f.label,startLine:f.idx,endLine:end,words:words(segment),sourceSubtopics:source.length?[...new Set(source)]:[f.anchor]};
    });
  }

  function customUnits(discipline,chapterTitle,text,headings,segments){
    const ck=chapterKey(discipline,chapterTitle);
    if(ck==='administrativo|improbidade administrativa conteudo completo'){
      return boundaryUnits(text,[
        {match:/^1\.1\s+Improbidade Administrativa x Ilegalidade/i,minLine:170,label:'Fundamentos e regime jurídico da improbidade administrativa'},
        {match:/^ASPECTOS MATERIAIS DA\s*$/i,minLine:2000,label:'Aspectos materiais da improbidade administrativa'},
        {match:/^ASPECTOS INVESTIGATIVOS\s*$/i,minLine:3500,label:'Investigação e acordo de não persecução cível'},
        {match:/^ASPECTOS PROCESSUAIS DA\s*$/i,minLine:4200,label:'Processo de improbidade administrativa'}
      ]);
    }
    if(ck==='administrativo|licitacoes e contratos conteudo completo'){
      return boundaryUnits(text,[
        {match:/^RELEMBRANDO CONCEITOS E TÓPICOS$/i,minLine:160,label:'Fundamentos, modalidades e contratação direta'},
        {match:/^LICITAÇÕES \(LEI Nº 14\.133\/21\)$/i,minLine:900,label:'Nova Lei de Licitações: estrutura e modalidades'},
        {match:/^DEMAIS PECULIARIDADES QUE DIZEM$/i,minLine:1400,label:'Agentes públicos, planejamento, execução e julgamento'},
        {match:/^CONTRATAÇÃO DIRETA$/i,minLine:1800,label:'Contratação direta e transição legislativa'},
        {match:/^LEI 14\.133\/21 - LEI DE LICITAÇÕES E$/i,minLine:2100,label:'Processo licitatório e habilitação na Lei 14.133/2021'},
        {match:/^Da Contratação Direta$/i,minLine:5000,label:'Dispensa e inexigibilidade'},
        {match:/^Dos Contratos Administrativos$/i,minLine:6300,label:'Contratos administrativos'},
        {match:/^Das Infrações e Sanções Administrativas$/i,minLine:7900,label:'Infrações, sanções e controle'},
        {match:/^DOS CRIMES EM LICITAÇÕES E CONTRATOS ADMINISTRATIVOS$/i,minLine:8500,label:'Crimes em licitações e contratos administrativos'}
      ]);
    }
    if(ck==='etica|etica e estatuto da oab revisao completa'){
      return boundaryUnits(text,[
        {match:/^1 PRINCÍPIOS FUNDAMENTAIS DA ADVOCACIA$/i,minLine:190,label:'Princípios fundamentais da advocacia'},
        {match:/^DA ATIVIDADE DA ADVOCACIA$/i,minLine:700,label:'Atividade da advocacia e mandato'},
        {match:/^DOS DIREITOS DO ADVOGADO$/i,minLine:1000,label:'Direitos e prerrogativas do advogado'},
        {match:/^DA INSCRIÇÃO NA ORDEM DOS$/i,minLine:1300,label:'Inscrição na OAB'},
        {match:/^DA SOCIEDADE DE ADVOGADOS E$/i,minLine:1500,label:'Sociedade de advocacia'},
        {match:/^DO ADVOGADO EMPREGADO$/i,minLine:1680,label:'Advogado empregado'},
        {match:/^DOS HONORÁRIOS ADVOCATÍCIOS$/i,minLine:1720,label:'Honorários advocatícios'},
        {match:/^PUBLICIDADE PROFISSIONAL$/i,minLine:1940,label:'Publicidade profissional'},
        {match:/^IMPEDIMENTOS E INCOMPATIBILIDADES$/i,minLine:2030,label:'Impedimentos e incompatibilidades'},
        {match:/^INFRAÇÕES E SANÇÕES DISCIPLINARES$/i,minLine:2170,label:'Infrações e sanções disciplinares'},
        {match:/^PROCESSO DISCIPLINAR$/i,minLine:2320,label:'Processo disciplinar'},
        {match:/^DA ORGANIZAÇÃO DA OAB$/i,minLine:2470,label:'Organização da OAB'},
        {match:/^PRINCIPAL SÚMULA DO TST SOBRE ÉTICA E ESTATUTO DA OAB$/i,minLine:2640,label:'Súmulas e revisão final'}
      ]);
    }
    if(ck==='constitucional|teoria da constituicao'){
      const groups=[];let current=[];
      const push=(label)=>{if(current.length){groups.push({atoms:current,label});current=[];}};
      for(const atom of segments){
        const n=norm(atom.heading.label);
        if(/^(revogacao|recepcao|teoria da inconstitucionalidade superveniente|mutacao constitucional)/.test(n)){
          if(current.length&&norm(current[0].heading.label).includes('poder constituinte'))push('Poder Constituinte: conceito, espécies e limites');
          current.push(atom);continue;
        }
        if(n.startsWith('eficacia das normas constitucionais')){
          if(current.length)push('Revogação, recepção e mutação constitucional');
          groups.push({atoms:[atom],label:'Eficácia das Normas Constitucionais'});continue;
        }
        current.push(atom);
      }
      if(current.length){
        const first=norm(current[0].heading.label);
        push(first.includes('poder constituinte')?'Poder Constituinte: conceito, espécies e limites':'Teoria da Constituição');
      }
      return groups.map((g,i)=>makeUnit(chapterTitle,g.atoms,i,groups.length,g.label));
    }
    if(ck==='constitucional|direitos e garantias fundamentais'){
      const artIndex=segments.findIndex(x=>norm(x.heading.label).startsWith('artigo 5'));
      if(artIndex>0){
        const groups=[
          {atoms:segments.slice(0,artIndex),label:'Teoria Geral dos Direitos Fundamentais'},
          {atoms:segments.slice(artIndex),label:'Direitos e Garantias Individuais — Art. 5º'}
        ];
        return groups.map((g,i)=>makeUnit(chapterTitle,g.atoms,i,groups.length,g.label));
      }
    }
    if(ck==='civil|contratos contratos em especie'){
      const groups=[];
      const take=(predicate,label)=>{
        const atoms=segments.filter(x=>predicate(norm(x.heading.label)));
        if(atoms.length)groups.push({atoms,label});
      };
      take(n=>n.includes('compra e venda'),'Contrato de Compra e Venda');
      take(n=>n.includes('doacao'),'Contrato de Doação');
      take(n=>n==='mutuo'||n==='comodato','Empréstimos: Mútuo e Comodato');
      take(n=>n==='fianca','Fiança');
      take(n=>n==='locacao','Locação');
      take(n=>n.startsWith('prestacao de servico')||n==='empreitada','Prestação de Serviço e Empreitada');
      const used=new Set(groups.flatMap(g=>g.atoms));
      const rest=segments.filter(x=>!used.has(x));
      if(rest.length)groups.push({atoms:rest,label:'Outros Contratos em Espécie'});
      return groups.map((g,i)=>makeUnit(chapterTitle,g.atoms,i,groups.length,g.label));
    }
    return null;
  }

  function clusterUnits(chapterTitle,segments){
    const groups=[];let current=[];let currentWords=0;
    const flush=()=>{if(current.length){groups.push(current);current=[];currentWords=0;}};
    for(const atom of segments){
      if(!current.length){current=[atom];currentWords=atom.words;continue;}
      const nextDependent=GENERIC.test(norm(atom.heading.label));
      const related=sharedTopic(current[current.length-1].heading.label,atom.heading.label);
      const combined=currentWords+atom.words;
      if(currentWords>=TARGET_MIN_WORDS && !nextDependent && !related){flush();current=[atom];currentWords=atom.words;continue;}
      if(combined>TARGET_MAX_WORDS && currentWords>=360 && !nextDependent){flush();current=[atom];currentWords=atom.words;continue;}
      current.push(atom);currentWords=combined;
    }
    flush();
    /* Evita deixar um último microbloco dependente isolado. */
    if(groups.length>1){
      const last=groups[groups.length-1],lw=last.reduce((n,x)=>n+x.words,0);
      const prev=groups[groups.length-2],pw=prev.reduce((n,x)=>n+x.words,0);
      if(lw<220&&(GENERIC.test(norm(last[0].heading.label))||pw+lw<=TARGET_MAX_WORDS)){
        groups.splice(groups.length-2,2,[...prev,...last]);
      }
    }
    return groups.map((g,i)=>makeUnit(chapterTitle,g,i,groups.length));
  }

  function buildPedagogicalUnits(discipline,chapterTitle,text=''){
    const headings=parseHeadings(text),segments=headingSegments(text,headings),wc=words(text);
    if(!headings.length||!segments.length)return [];
    const strategy=strategyForChapter(discipline,chapterTitle,wc,headings);
    if(strategy==='whole'){
      return [makeUnit(chapterTitle,segments,0,1,chapterTitle)];
    }
    if(strategy==='top')return segments.map((x,i)=>makeUnit(chapterTitle,[x],i,segments.length,x.heading.label));
    if(strategy==='custom'){
      const custom=customUnits(discipline,chapterTitle,text,headings,segments);
      if(custom&&custom.length)return custom;
    }
    return clusterUnits(chapterTitle,segments);
  }

  function sourceSubtopicsFor(discipline,chapterId,subtopic=''){
    const meta=unitMeta.get(key(discipline,chapterId,subtopic));
    if(meta)return [...meta.sourceSubtopics];
    const ch=chapterMeta.get(`${discipline}|${chapterId}`);
    if(!subtopic&&ch)return [...(ch.originalSubtopics||[])];
    return subtopic?[String(subtopic)]:[];
  }

  function labelFor(discipline,chapterId,subtopic=''){
    const meta=unitMeta.get(key(discipline,chapterId,subtopic));
    return meta?.label||cleanNumber(subtopic||'');
  }

  function fragmentDone(completed,base){
    if(completed?.[base]?.taxonomyVersion===VERSION)return true;
    const direct=completed?.[base];
    if(direct&&direct.taxonomyVersion===VERSION)return true;
    const prefix=`${base}|part-`,keys=Object.keys(completed||{}).filter(k=>k.startsWith(prefix));
    if(!keys.length)return false;
    let expected=0;const parts=new Set();
    for(const k of keys){const m=k.match(/\|part-(\d+)-of-(\d+)$/);if(m){parts.add(Number(m[1]));expected=Math.max(expected,Number(m[2]));}}
    return expected>0&&parts.size>=expected;
  }

  function isLearningKeyDone(baseKey,progress){
    const completed=progress?.learningPath?.completed||{};
    if(completed[baseKey]?.taxonomyVersion===VERSION)return true;
    const meta=unitMeta.get(baseKey)||chapterMeta.get(baseKey.replace(/\|__chapter__$/,''));
    if(!meta)return !!completed[baseKey]||fragmentDone(completed,baseKey);
    const sources=meta.sourceSubtopics||meta.originalSubtopics||[];
    if(!sources.length)return !!completed[baseKey]||fragmentDone(completed,baseKey);
    const prefix=baseKey.split('|').slice(0,2).join('|');
    return sources.every(st=>{
      const old=`${prefix}|${slug(cleanNumber(st))}`;
      return !!completed[old]||fragmentDone(completed,old);
    });
  }

  function registerChapter(discipline,chapter){
    if(!chapter||chapter._v35TaxonomyVersion===VERSION)return chapter;
    const original=[...(chapter.subtopics||[])];
    const chKey=`${discipline}|${chapter.id}`;
    const chMeta={discipline,chapterId:chapter.id,title:chapter.title,originalSubtopics:original,sourceSubtopics:original,strategy:'whole'};
    chapterMeta.set(chKey,chMeta);
    if(!chapter.hasTheory||!(chapter.theory||[]).length){
      chapter.subtopics=[];chapter.v35PedagogicalUnits=[];chapter._v35TaxonomyVersion=VERSION;return chapter;
    }
    const sec=chapter.theory[0];
    const units=buildPedagogicalUnits(discipline,chapter.title,sec.text||'');
    const strategy=strategyForChapter(discipline,chapter.title,words(sec.text||''),parseHeadings(sec.text||''));
    chMeta.strategy=strategy;chMeta.units=units;
    if(strategy==='whole'||units.length<=1){
      chapter.subtopics=[];chapter.v35PedagogicalUnits=units;
      chapter._v35TaxonomyVersion=VERSION;return chapter;
    }
    chapter.subtopics=units.map(u=>u.anchor);
    chapter.v35PedagogicalUnits=units;
    const ranges=new Map();
    units.forEach(u=>{
      const meta={...u,discipline,chapterId:chapter.id,chapterTitle:chapter.title};
      unitMeta.set(key(discipline,chapter.id,u.anchor),meta);
      ranges.set(slug(cleanNumber(u.anchor)),meta);
    });
    sectionRanges.set(sec,ranges);
    chapter._v35TaxonomyVersion=VERSION;
    return chapter;
  }

  function install(root){
    if(installed)return;installed=true;
    const baseChapters=typeof root.disciplineChapters==='function'?root.disciplineChapters:null;
    const baseIsolate=typeof root.isolateSubtopicSections==='function'?root.isolateSubtopicSections:null;
    if(baseChapters){
      root.disciplineChapters=function(discipline){
        const chapters=baseChapters(discipline)||[];
        return chapters.map(ch=>registerChapter(discipline,ch));
      };
    }
    if(baseIsolate){
      root.isolateSubtopicSections=function(sections,subtopic){
        if(!subtopic)return sections;
        const out=[];let used=false;
        for(const sec of sections||[]){
          const ranges=sectionRanges.get(sec),meta=ranges?.get(slug(cleanNumber(subtopic)));
          if(meta){
            const lines=String(sec.text||'').replace(/\r/g,'').split('\n');
            const text=lines.slice(meta.startLine,meta.endLine).join('\n').trim();
            if(text){out.push({...sec,title:`${sec.title} › ${meta.label}`,text,_v35PedagogicalSlice:true});used=true;}
          }else{
            const fallback=baseIsolate([sec],subtopic);if(fallback?.length)out.push(...fallback);
          }
        }
        return used?out:baseIsolate(sections,subtopic);
      };
    }
    root.OAB_V35_TAXONOMY=api;
    try{root.document.documentElement.dataset.oabTaxonomy=VERSION;}catch{}
  }

  const api={VERSION,parseHeadings,strategyForChapter,buildPedagogicalUnits,sourceSubtopicsFor,labelFor,isLearningKeyDone,install,_unitMeta:unitMeta,_chapterMeta:chapterMeta};
  return api;
});
