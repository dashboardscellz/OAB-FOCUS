/* OAB Focus v35.15 — Motor autoral FGV/OAB com diversidade semântica e memória antirrepetição.
   O corpus real orienta estrutura e ritmo; nenhum enunciado oficial é reproduzido. */
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.OAB_V35_AUTHORIAL_FGV=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const VERSION='35.15';
  const LETTERS='ABCD';
  // Gate inclui a frase morta “considerando o material” e equivalentes.
  const DEAD_PROMPTS=[/considerando (?:exclusivamente )?o material/i,/conte[uú]do estudado/i,/unidade que voc[eê] acabou de estudar/i,/regra apresentada no material/i,/compat[ií]vel com o material/i,/texto apresentado/i,/de acordo com a unidade/i];
  const clean=(s='')=>String(s??'').replace(/\s+/g,' ').trim();
  const norm=(s='')=>clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const punct=s=>/[.!?]$/.test(clean(s))?clean(s):clean(s)+'.';
  const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
  const pick=(arr,key,offset=0)=>arr[(hash(key)+offset)%arr.length];
  const names=['Marina','Rafael','Camila','Eduardo','Larissa','Bruno','Renata','Felipe','Isabela','André','Helena','Caio','Joana','Gustavo','Beatriz','Vinícius','Clara','Marcelo','Paula','Diego'];
  const cities=['Recife','Salvador','Goiânia','Curitiba','Fortaleza','Belo Horizonte','João Pessoa','Campinas','Natal','Florianópolis'];
  const companies=['Aurora Ltda.','Horizonte S.A.','Ponte Norte Ltda.','Estação Comércio Digital','Via Clara Serviços','Serra Azul Participações'];
  const publicBodies=['Município de Vale Verde','Estado de Serra Clara','Agência Estadual de Regulação','Secretaria Municipal de Administração','Autarquia de Desenvolvimento Regional'];
  const recentOpenings=new Map();

  function vars(discipline,topic,seq,key){
    return {
      p:pick(names,key+'|p',seq),p2:pick(names,key+'|p2',seq+3),city:pick(cities,key+'|c',seq),
      company:pick(companies,key+'|co',seq),body:pick(publicBodies,key+'|b',seq),
      year:2024+(seq%3),day:1+(seq%27),month:1+(seq%12),topic:clean(topic)||clean(discipline),discipline:clean(discipline)
    };
  }
  function fill(t,v){return t.replace(/\{(\w+)\}/g,(_,k)=>v[k]??'');}

  // 20 famílias x 6 estruturas = 120 formas narrativas de base. Cada estrutura recebe variáveis próprias.
  const scenarioCatalog={
    ethics:[
      '{p}, advogada regularmente inscrita, recebeu proposta de {company} para divulgar serviços jurídicos em campanha patrocinada nas redes sociais. A contratação previa linguagem promocional e promessa de resultado.',
      'O escritório de {p} foi procurado por {company} para assumir causa que vinha sendo conduzida por outro profissional, sem notícia de renúncia ou substabelecimento.',
      '{p}, recém-inscrito na OAB, foi convidado a integrar sociedade de advocacia que pretende admitir sócio não advogado para ampliar a área comercial.',
      'Durante atendimento em {city}, {p} recebeu de cliente documentos sigilosos e, dias depois, foi intimado a depor sobre fatos conhecidos no exercício profissional.',
      '{p} celebrou contrato de honorários com cláusula de êxito e, após o encerramento da causa, surgiu divergência sobre a forma de cobrança e retenção de valores.',
      'Uma sociedade empresária que não possui advogado em seus quadros passou a oferecer consultoria e orientação jurídica remunerada aos próprios clientes, sustentando que a atividade seria livre por não envolver representação judicial.'
    ],
    international:[
      '{p}, com domicílio no Brasil, celebrou em Lisboa contrato com empresa francesa para obrigação a ser executada em {city}. As partes não escolheram expressamente a lei aplicável.',
      '{p}, brasileiro residente no exterior, faleceu deixando imóvel no Brasil e aplicações financeiras em outro país. Os herdeiros divergem sobre a lei que regerá a sucessão.',
      '{company}, sediada no Brasil, comprou equipamentos de sociedade estrangeira. O contrato foi assinado fora do país e o pagamento deveria ocorrer em território brasileiro.',
      '{p} e {p2}, de nacionalidades distintas, casaram-se no exterior e depois fixaram domicílio no Brasil. Na dissolução do vínculo surgiu controvérsia sobre o regime patrimonial.',
      'Uma sentença estrangeira condenou {company} ao pagamento de indenização. O credor pretende produzir efeitos no Brasil e busca saber quais providências são necessárias.',
      '{p}, residente em {city}, recebeu procuração outorgada no exterior para praticar ato jurídico no Brasil. A validade formal e a lei incidente passaram a ser discutidas.'
    ],
    criminal:[
      'Durante uma festa em {city}, {p} praticou conduta descrita no enunciado acreditando, por erro sobre circunstância essencial, que sua atuação era lícita.',
      '{p} iniciou a execução de um delito, mas o resultado não ocorreu por circunstância alheia à sua vontade. A defesa sustenta tese sobre a forma de responsabilização penal.',
      'Em discussão ocorrida em {city}, {p} agiu para repelir agressão atual dirigida a terceiro. A intensidade da reação passou a ser questionada no processo penal.',
      '{p} e {p2} combinaram a prática de delito, mas apenas um deles executou o núcleo do tipo. A acusação pretende definir a responsabilidade de cada participante.',
      '{p} praticou fato típico sob ameaça grave e inevitável exercida por terceiro. O processo discute a incidência de causa capaz de afastar ou modificar a culpabilidade.',
      'Ao receber objeto de origem ilícita, {p} alegou desconhecer sua procedência. As circunstâncias da aquisição e o elemento subjetivo tornaram-se centrais para a tipificação.'
    ],
    criminalProcedure:[
      'A polícia instaurou investigação sobre fato ocorrido em {city} e realizou diligências antes do oferecimento da denúncia. A defesa questionou a natureza e os limites do procedimento.',
      '{p} foi preso em flagrante às {day} horas e apresentado à autoridade competente. A defesa pretende examinar as providências cabíveis e os prazos subsequentes.',
      'Durante audiência de instrução, o juízo indeferiu requerimento formulado pela defesa de {p}. O advogado precisa identificar a medida processual adequada.',
      'O Ministério Público ofereceu denúncia contra {p}, mas a defesa sustenta ausência de requisito necessário ao prosseguimento da ação penal.',
      'Em investigação conduzida em {city}, a autoridade determinou medida invasiva sem decisão judicial. A validade da prova obtida passou a ser discutida.',
      'Condenado em primeira instância, {p} pretende impugnar a decisão. O defensor deve escolher o recurso adequado e observar seus efeitos e prazo.'
    ],
    civilContracts:[
      '{p} e {company} celebraram contrato de compra e venda de bem móvel, com pagamento parcelado e cláusula específica sobre inadimplemento.',
      '{company} contratou {p} para executar serviço em prazo determinado. A prestação foi concluída parcialmente e as partes divergem sobre os efeitos do descumprimento.',
      '{p} recebeu de {p2} bem emprestado para uso gratuito e, durante a posse, ocorreu fato que gerou discussão sobre restituição e responsabilidade.',
      '{company} ofereceu garantia em contrato celebrado com {p}. Posteriormente, a obrigação principal foi modificada sem participação do garantidor.',
      '{p} celebrou contrato preliminar para aquisição de imóvel em {city}. Antes da assinatura definitiva, a outra parte recusou-se a concluir o negócio.',
      'Duas sociedades empresárias pactuaram obrigação recíproca e uma delas deixou de cumprir prestação essencial. A parte adimplente avalia as consequências previstas no Código Civil.'
    ],
    civilFamily:[
      '{p} e {p2} pretendem dissolver união estável após anos de convivência e discutem efeitos patrimoniais sobre bens adquiridos durante a relação.',
      '{p} faleceu deixando descendentes, cônjuge e patrimônio composto por bens particulares e comuns. Os sucessores divergem sobre a partilha.',
      'Os pais de uma criança discordam sobre exercício do poder familiar e mudança de residência para outra cidade. A controvérsia chegou ao Judiciário.',
      '{p} pretende realizar doação relevante a um dos descendentes, e os demais familiares questionam os limites jurídicos do ato.',
      'Em inventário aberto em {city}, apareceu testamento que atribui parcela expressiva do patrimônio a terceiro. Os herdeiros necessários impugnaram a disposição.',
      '{p} busca reconhecimento de vínculo familiar com efeitos pessoais e patrimoniais. O caso exige definir requisitos e consequências previstos na legislação civil.'
    ],
    consumer:[
      '{p} comprou aparelho eletrônico de {company} e, poucos dias depois, surgiu defeito que impediu o uso normal do produto.',
      '{company} anunciou serviço por preço promocional, mas incluiu cobrança adicional apenas na etapa final da contratação de {p}.',
      '{p} teve seus dados utilizados em contratação que afirma não ter realizado. O fornecedor sustenta que seus sistemas internos registram operação regular.',
      'Durante viagem, {p} utilizou serviço contratado de {company}, que foi interrompido por falha operacional. O consumidor busca reparação pelos prejuízos sofridos.',
      '{company} recusou atendimento a {p} com fundamento em cláusula contratual pouco destacada. A validade da limitação passou a ser questionada.',
      '{p} recebeu cobrança de dívida já paga e, mesmo após reclamação, seu nome foi inserido em cadastro restritivo.'
    ],
    administrative:[
      '{body} editou ato restringindo determinada atividade privada em {city}. Um administrado questiona a competência e os limites da medida.',
      '{p}, servidor público, recebeu ordem de superior hierárquico para praticar ato cuja legalidade lhe parece duvidosa.',
      '{body} anulou benefício anteriormente concedido a {p}. O interessado sustenta que a Administração ultrapassou os limites de autotutela.',
      'Em procedimento licitatório, {company} foi desclassificada após mudança de critério durante o julgamento. A empresa impugnou a decisão administrativa.',
      '{body} aplicou sanção a {company} por descumprimento contratual. A discussão envolve processo administrativo, motivação e proporcionalidade.',
      'O Município pretende delegar a particular a prestação de serviço público local. Antes de formalizar o ajuste, surgiram dúvidas sobre o regime jurídico aplicável.'
    ],
    constitutional:[
      'A Assembleia Legislativa aprovou norma estadual que interfere em matéria cuja competência constitucional é contestada pela União.',
      'Uma proposta de emenda à Constituição pretende alterar regra sensível do texto constitucional. Parlamentares discutem limites materiais e procedimento de aprovação.',
      '{p} teve direito fundamental restringido por ato de autoridade pública e procura medida constitucional capaz de proteger sua situação jurídica.',
      'Lei recém-publicada passou a produzir efeitos sobre situação de {p}. A controvérsia exige definir eficácia da norma constitucional relacionada ao caso.',
      'Partido político pretende questionar, diretamente perante o Supremo Tribunal Federal, a compatibilidade de uma lei com a Constituição.',
      'O poder público condicionou o exercício de liberdade individual ao cumprimento de exigência prevista em lei. {p} contesta a validade da restrição.'
    ],
    tax:[
      'O Município de {city} instituiu cobrança sobre situação econômica envolvendo {company}. O contribuinte questiona competência, fato gerador e limites constitucionais.',
      '{company} recebeu auto de infração por tributo não recolhido e pretende discutir lançamento, crédito tributário e possíveis causas de suspensão.',
      'Lei publicada no fim do exercício aumentou carga tributária incidente sobre atividade de {company}. A empresa questiona quando a nova exigência pode produzir efeitos.',
      '{p} requereu reconhecimento de imunidade tributária, mas o ente arrecadador negou o pedido por interpretar restritivamente a hipótese constitucional.',
      'Após pagamento indevido de tributo, {company} pretende recuperar os valores e precisa definir o instrumento e os requisitos aplicáveis.',
      'O Estado concedeu benefício fiscal a determinado setor econômico. Concorrente de {company} sustenta violação às regras constitucionais de tributação.'
    ],
    labor:[
      '{p} trabalhou para {company} com jornada superior à contratada e recebeu parcelas salariais de forma variável ao longo do vínculo.',
      '{company} dispensou {p} e deixou de pagar parte das verbas rescisórias. O trabalhador pretende identificar os direitos decorrentes da ruptura.',
      '{p} presta serviços pessoais e contínuos a {company}, mas o contrato escrito o qualifica como autônomo. A natureza jurídica da relação foi questionada.',
      'Durante o contrato, {company} alterou unilateralmente condição de trabalho de {p}. O empregado sustenta prejuízo e invalidade da mudança.',
      '{p} sofreu acidente durante atividade executada em favor de {company}. O caso envolve deveres do empregador e efeitos trabalhistas da ocorrência.',
      'Após retornar de afastamento, {p} foi dispensado por {company}. A discussão se concentra na existência de garantia provisória de emprego.'
    ],
    laborProcedure:[
      '{p} ajuizou reclamação trabalhista contra {company} e a audiência foi designada para data próxima. A defesa precisa observar regras específicas do procedimento.',
      'A sentença trabalhista foi desfavorável a {company}, que pretende recorrer. O advogado deve identificar o recurso cabível e o prazo correspondente.',
      'Durante execução trabalhista, foi localizado bem de terceiro ligado ao devedor. A constrição provocou discussão sobre o meio processual adequado.',
      '{p} faltou à audiência trabalhista sem apresentar justificativa prévia. O juízo deve definir os efeitos processuais dessa ausência.',
      'O juízo do trabalho proferiu decisão interlocutória no curso do processo de {p}. A parte pretende impugná-la imediatamente.',
      'Em reclamação com vários pedidos, houve acordo parcial e prosseguimento quanto aos demais. As partes divergem sobre os efeitos processuais da composição.'
    ],
    business:[
      '{company} pretende admitir novo sócio e alterar a administração da sociedade. Os integrantes discutem quórum, registro e efeitos perante terceiros.',
      '{company} deixou de pagar obrigação vencida e um credor cogita requerer falência. A situação exige examinar pressupostos legais do pedido.',
      'Os administradores de {company} praticaram ato fora dos limites previstos no contrato social. Um terceiro afetado busca definir responsabilidades.',
      '{p} emitiu título de crédito em favor de {company}, que posteriormente o transferiu a terceiro. Surgiu controvérsia sobre circulação e exceções oponíveis.',
      '{company} ingressou em recuperação judicial e apresentou plano aos credores. Uma classe discorda das condições e questiona os efeitos da deliberação.',
      'Dois empresários passaram a explorar atividade em conjunto sem formalizar registro societário. Após divergência, discutem responsabilidades pelas obrigações assumidas.'
    ],
    environment:[
      '{company} iniciou empreendimento próximo a área ambientalmente protegida antes de concluir todas as etapas de licenciamento.',
      'O órgão ambiental aplicou sanção a {company} por dano constatado em fiscalização. A empresa sustenta ausência de culpa e questiona a responsabilidade.',
      'O Município autorizou intervenção em área sensível para obra de infraestrutura. Moradores contestam a medida com base em normas de proteção ambiental.',
      '{p} adquiriu imóvel rural onde já existia degradação ambiental causada pelo antigo proprietário. A obrigação de recuperação passou a ser discutida.',
      '{company} pretende explorar recurso natural sujeito a controle administrativo. O órgão competente exige estudo ambiental antes da autorização.',
      'Um acidente operacional causou poluição em curso d\'água próximo a {city}. Diferentes esferas de responsabilização foram acionadas.'
    ],
    eca:[
      'Uma criança foi encaminhada a família extensa após situação de risco. O juízo avalia medidas de proteção e preservação de vínculos familiares.',
      '{p} e {p2} pretendem adotar adolescente que já conhecem. O procedimento exige análise dos requisitos previstos no ECA.',
      'Um adolescente praticou ato infracional e foi apresentado à autoridade competente. A defesa discute a medida socioeducativa juridicamente adequada.',
      'A escola de um adolescente adotou providência disciplinar que seus responsáveis consideram incompatível com direitos assegurados pelo ECA.',
      'O Conselho Tutelar recebeu notícia de violação de direitos de criança em {city} e precisa definir quais medidas estão dentro de suas atribuições.',
      'Em processo de colocação em família substituta, surgiram divergências sobre consentimento, estágio de convivência e interesse do adotando.'
    ],
    humanRights:[
      '{p} alega ter sofrido violação grave de direito protegido internacionalmente e pretende acionar mecanismos além da jurisdição interna.',
      'Uma organização da sociedade civil documentou práticas estatais incompatíveis com tratado internacional de direitos humanos ratificado pelo Brasil.',
      'Após decisão interna definitiva, {p} busca compreender requisitos para apresentar petição ao sistema interamericano de proteção.',
      'Lei nacional estabeleceu tratamento diferenciado para determinado grupo. A medida foi questionada à luz de igualdade e não discriminação.',
      'Autoridade pública restringiu manifestação de grupo minoritário em {city}. O caso envolve liberdade de expressão e proteção internacional dos direitos humanos.',
      'O Estado brasileiro foi responsabilizado internacionalmente e precisa adotar medidas de reparação determinadas por órgão do sistema regional.'
    ],
    financial:[
      'O Poder Executivo pretende abrir crédito adicional para despesa não prevista originalmente no orçamento. A equipe técnica discute requisitos e autorização necessária.',
      'Durante a execução orçamentária, a arrecadação ficou abaixo do previsto. O ente público precisa ajustar despesas e observar as regras fiscais aplicáveis.',
      'Lei orçamentária incluiu dispositivo sem relação direta com previsão de receita ou fixação de despesa. Parlamentares questionam a compatibilidade constitucional.',
      'O Município de {city} pretende assumir nova obrigação financeira de longo prazo. A operação exige análise dos limites de endividamento e responsabilidade fiscal.',
      'Órgão público pretende remanejar dotações entre programas sem autorização legislativa específica. A controladoria questiona a medida.',
      'No encerramento do exercício, despesas foram empenhadas, mas não pagas. A equipe de finanças precisa definir o tratamento jurídico correspondente.'
    ],
    electoral:[
      '{p} pretende registrar candidatura e possui situação pessoal que pode repercutir nas condições de elegibilidade e inelegibilidades.',
      'Partido político escolheu {p} em convenção, mas surgiu dúvida sobre filiação, domicílio eleitoral e prazo para registro.',
      'Durante campanha em {city}, candidato utilizou meio de propaganda cuja regularidade foi questionada pela Justiça Eleitoral.',
      'Após o resultado das eleições, coligação adversária apontou abuso praticado durante a campanha e pretende escolher a medida judicial adequada.',
      '{p}, ocupante de cargo público, pretende concorrer a outro mandato. A assessoria examina eventual necessidade de desincompatibilização.',
      'Prestação de contas de campanha apresentou inconsistência relevante. O candidato busca compreender efeitos e providências no âmbito eleitoral.'
    ],
    philosophy:[
      'Ao discutir positivismo jurídico, dois professores divergem sobre a relação entre validade da norma e seu conteúdo moral.',
      'Em seminário sobre teoria do direito, {p} defende que a interpretação jurídica não se reduz à leitura literal do texto normativo.',
      'Uma decisão judicial é criticada por aplicar regra válida apesar de forte objeção moral. O debate remete à distinção entre direito e moral.',
      'Durante aula sobre justiça, estudantes comparam concepções distintas de igualdade, liberdade e legitimidade da ordem jurídica.',
      'Em debate acadêmico, {p} sustenta tese sobre a natureza das regras e princípios e suas diferentes formas de aplicação.',
      'Dois autores são contrapostos em questão teórica sobre fundamento de validade, interpretação e autoridade do direito.'
    ],
    genericDoctrine:[
      'Em parecer solicitado a {p}, surgiram duas interpretações juridicamente plausíveis sobre os requisitos e efeitos do instituto examinado.',
      '{p} recebeu consulta profissional em que a solução depende de distinguir regra geral, exceção e consequência jurídica prevista em lei.',
      'Durante análise de caso concreto, a equipe jurídica de {company} identificou dúvida sobre a correta incidência de requisito legal decisivo.',
      'Uma decisão administrativa e a orientação apresentada por {p} chegaram a conclusões opostas sobre o mesmo instituto jurídico.',
      'Em processo envolvendo {p} e {company}, a solução exige definir com precisão o alcance da regra aplicável, sem ampliar seus requisitos.',
      'A assessoria jurídica de {company} precisa escolher entre interpretações divergentes quanto aos efeitos produzidos pelo instituto em exame.'
    ]
  };

  const commands=[
    'À luz do regime jurídico aplicável, assinale a afirmativa correta.',
    'Diante dos fatos narrados, assinale a opção juridicamente adequada.',
    'Com base na legislação pertinente, assinale a afirmativa correta.',
    'A respeito da solução jurídica do caso, assinale a alternativa correta.',
    'Assinale a opção que apresenta a consequência jurídica correta.',
    'Considerando os fatos juridicamente relevantes, assinale a afirmativa correta.',
    'Segundo o regime aplicável ao instituto, assinale a alternativa correta.',
    'Em relação à situação descrita, assinale a opção correta.',
    'Assinale a afirmativa que se harmoniza com o ordenamento jurídico.',
    'Sobre os efeitos jurídicos do caso, assinale a alternativa correta.',
    'À vista das circunstâncias apresentadas, assinale a afirmativa correta.',
    'Assinale a opção que oferece a solução compatível com a disciplina legal do tema.'
  ];

  function familyFor(discipline='',topic='',rule=''){
    const d=norm(discipline),t=norm(topic),r=norm(rule),all=`${d} ${t} ${r}`;
    if(/etica|estatuto da oab|advoc/.test(all))return 'ethics';
    if(/internacional|conflito de leis|lindb|estrangeir|homologacao/.test(all))return 'international';
    if(/processo penal|inquerito|denuncia|prisao|habeas corpus/.test(all))return 'criminalProcedure';
    if(/penal/.test(d))return 'criminal';
    if(/processo do trabalho|reclamacao trabalhista|recurso ordinario/.test(all))return 'laborProcedure';
    if(/trabalho/.test(d))return 'labor';
    if(/processo civil|agravo|apelacao|execucao|tutela|competencia processual/.test(all))return 'genericDoctrine';
    if(/consumidor|cdc|fornecedor|produto|servico/.test(all))return 'consumer';
    if(/administrativo|licit|servidor|poder de policia|servico publico|autotutela/.test(all))return 'administrative';
    if(/constitucional|controle de constitucionalidade|direito fundamental|poder constituinte/.test(all))return 'constitutional';
    if(/tribut/.test(all))return 'tax';
    if(/empresarial|sociedade|falencia|recuperacao|titulo de credito/.test(all))return 'business';
    if(/ambiental|licenciamento|meio ambiente/.test(all))return 'environment';
    if(/eca|crianca|adolescente|adocao|ato infracional/.test(all))return 'eca';
    if(/direitos humanos|interamericano|convencao americana/.test(all))return 'humanRights';
    if(/financeiro|orcament|credito adicional|responsabilidade fiscal/.test(all))return 'financial';
    if(/eleitoral|inelegib|candidatura|campanha/.test(all))return 'electoral';
    if(/filosofia|positivismo|jusnatural|hart|dworkin|kelsen/.test(all))return 'philosophy';
    if(/familia|sucess|heranc|casamento|uniao estavel|testamento/.test(all))return 'civilFamily';
    if(/civil|contrato|compra e venda|locacao|doacao|mutuo|comodato|fianca/.test(all))return 'civilContracts';
    return 'genericDoctrine';
  }

  function tokenSet(s){return new Set(norm(s).replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(x=>x.length>2));}
  function similarity(a,b){
    const A=tokenSet(a),B=tokenSet(b);if(!A.size||!B.size)return 0;let inter=0;for(const x of A)if(B.has(x))inter++;
    return inter/(A.size+B.size-inter);
  }
  function openingKey(s){return norm(s).split(/\s+/).slice(0,8).join(' ');}
  function isTooSimilar(statement,discipline){
    const hist=recentOpenings.get(norm(discipline))||[];
    return hist.some(old=>openingKey(old)===openingKey(statement)||similarity(old,statement)>0.92);
  }
  function remember(statement,discipline){
    const k=norm(discipline),hist=recentOpenings.get(k)||[];hist.push(statement);if(hist.length>50)hist.splice(0,hist.length-50);recentOpenings.set(k,hist);
  }
  function resetHistory(){recentOpenings.clear();}

  function leadFor(family,v,index){
    const common=['',`Em ${v.year}, `,`Na cidade de ${v.city}, `,`Em ${v.city}, no segundo semestre de ${v.year}, `,`Em análise concluída em ${v.city} no ano de ${v.year}, `];
    const procedural=['',`No processo de ${v.p} em ${v.city}, `,`Na fase atual do procedimento, `,`Antes da próxima decisão judicial, `,`Durante a atuação de ${v.p} em ${v.city}, `];
    const academic=['',`Em aula realizada em ${v.city}, `,`Durante seminário jurídico em ${v.year}, `,`Ao comparar duas correntes teóricas, `,`No debate acadêmico de ${v.p} em ${v.city}, `];
    const arr=/Procedure$/.test(family)?procedural:family==='philosophy'?academic:common;
    return arr[index%arr.length];
  }

  function joinLead(lead,base){
    if(!lead)return base;
    const proper=[...names,...companies,...publicBodies,'STF','OAB','Ministério Público'];
    if(proper.some(x=>base.startsWith(x)))return lead+base;
    return lead+base.charAt(0).toLowerCase()+base.slice(1);
  }

  function scenario(discipline,topic,rule,seq,id=''){
    const family=familyFor(discipline,topic,rule),catalog=scenarioCatalog[family]||scenarioCatalog.genericDoctrine,key=`${discipline}|${topic}|${rule}|${id}|${seq}`;
    for(let attempt=0;attempt<36;attempt++){
      const v=vars(discipline,topic,seq+attempt,key),baseIndex=(hash(key)+seq+attempt)%catalog.length,base=fill(catalog[baseIndex],v);
      const lead=leadFor(family,v,Math.floor((seq+attempt)/catalog.length)+(hash(key+'|lead')%5));
      const command=commands[(hash(key+'|cmd')+seq+attempt*3)%commands.length];
      const statement=`${punct(joinLead(lead,base))} ${command}`;
      if(!isTooSimilar(statement,discipline)){remember(statement,discipline);return {statement,family,variant:baseIndex};}
    }
    // fallback direto e específico: melhor pergunta doutrinária do que um caso artificial reciclado.
    const statement=`A respeito de ${clean(topic)||clean(discipline)}, examine a aplicação da seguinte regra jurídica ao instituto: ${punct(rule)} Assinale a afirmativa correta.`;
    remember(statement,discipline);return {statement,family:'genericDoctrine',variant:-1};
  }

  function corpusProfile(bank=[]){
    const real=(bank||[]).filter(q=>q&&!q.authorial&&q.sourceType!=='authorial');
    const lens=real.map(q=>(clean(q.statement).match(/\S+/g)||[]).length).sort((a,b)=>a-b);
    const median=lens.length?lens[Math.floor(lens.length/2)]:0;
    const caseLike=real.filter(q=>/\b(?:foi|ajuizou|contratou|pretende|recebeu|celebrou|sociedade|munic[ií]pio|estado|uni[aã]o|advogad[oa]|empregad[oa]|acusad[oa]|consumidor)\b/i.test(q.statement||'')).length;
    return {realQuestions:real.length,medianStatementWords:median,caseLikeRatio:real.length?caseLike/real.length:0};
  }

  function replaceFirst(rule,re,repl){if(!re.test(rule))return '';const x=punct(rule.replace(re,repl));return norm(x)!==norm(rule)?x:'';}
  function numericMutation(rule){const m=rule.match(/\b(\d{1,3})\b/);if(!m)return '';const n=Number(m[1]);if(!Number.isFinite(n)||n===0)return '';return punct(rule.replace(m[0],String(n<10?n+1:n<=30?n+5:n+10)));}
  function conditionMutation(rule){
    const pairs=[[/\bdesde que\b/i,'mesmo sem'],[/\bsalvo\b/i,'inclusive'],[/\bsomente\b/i,'também'],[/\bapenas\b/i,'inclusive'],[/\bindependentemente de\b/i,'desde que haja']];
    for(const [re,r] of pairs){if(re.test(rule))return punct(rule.replace(re,r));}return '';
  }
  function buildDistractors(rule,topic,discipline=''){
    const candidates=[],nr=norm(rule),label=clean(topic)||clean(discipline)||'o instituto';
    if(/atividades? privativas? da advocacia/.test(nr))return [
      'Somente a postulação perante o Poder Judiciário constitui atividade privativa da advocacia, de modo que a consultoria jurídica pode ser prestada livremente por não advogados.',
      'A consultoria jurídica por não advogado é admitida quando não houver assinatura de parecer nem representação judicial do cliente.',
      'A orientação jurídica pode ser prestada por empresa não inscrita na OAB quando destinada apenas a pessoas jurídicas.'
    ];
    const pairs=[[/\bnão pode\b/i,'pode'],[/\bpode\b/i,'deve'],[/\bnão deve\b/i,'deve'],[/\bdeve\b/i,'pode'],[/\bnão é\b/i,'é'],[/\bé\b/i,'não é'],[/\bnão são\b/i,'são'],[/\bsão\b/i,'não são'],[/\bcompete\b/i,'não compete'],[/\bcabe\b/i,'não cabe'],[/\bé vedad[oa]\b/i,'é permitido'],[/\bé permitid[oa]\b/i,'é vedado'],[/\bexclui\b/i,'mantém'],[/\blimita\b/i,'amplia']];
    for(const [re,repl] of pairs){const x=replaceFirst(rule,re,repl);if(x)candidates.push(x);}
    const cm=conditionMutation(rule);if(cm)candidates.push(cm);const nm=numericMutation(rule);if(nm)candidates.push(nm);
    // Distratores-reserva variam o tipo de erro jurídico sem repetir muletas universais.
    const reserves=[
      `A regra aplicável a ${label} somente incide quando todos os efeitos do instituto já estiverem consumados, não alcançando situações em curso.`,
      `Em ${label}, a competência ou legitimidade prevista para o caso pode ser livremente transferida por acordo entre os interessados.`,
      `A disciplina de ${label} permite afastar requisito legal por convenção das partes sempre que não houver prejuízo econômico imediato.`,
      `No âmbito de ${label}, eventual irregularidade de requisito essencial produz apenas efeito interno e não interfere na validade jurídica do ato.`,
      `A incidência da regra em ${label} exige interpretação extensiva mesmo quando o texto legal estabelece hipótese específica.`
    ];
    for(const r of reserves)candidates.push(r);
    const out=[];for(const c of candidates){const x=punct(c);if(norm(x)!==norm(rule)&&!out.some(y=>norm(y)===norm(x)))out.push(x);}return out.slice(0,3);
  }

  function explainWrong(rule,opt,basis){
    return `Incorreta. A alternativa modifica requisito, competência, prazo, exceção, alcance ou efeito relevante do instituto e, por isso, conduz a solução diferente da regra aplicável. Regra de controle: ${punct(rule)} ${basis?`Fundamento identificado: ${basis}.`:''}`;
  }
  function buildResearch(rule,options,answer,topic,context){
    const QUALITY=root?.OAB_V35_QUESTION_QUALITY,basis=QUALITY?.extractLegalBasis?.(context)||'',letter=LETTERS[answer]||String(answer+1),alternatives={};
    options.forEach((o,i)=>alternatives[LETTERS[i]]=i===answer
      ?`Correta. Esta alternativa preserva os elementos jurídicos determinantes da situação e aplica a regra sem criar requisito, exceção ou efeito inexistente: ${punct(rule)} ${basis?`Fundamento identificado: ${basis}.`:''}`
      :explainWrong(rule,o,basis));
    return {officialAnswer:letter,whyCorrect:`A alternativa ${letter} está correta porque resolve o problema jurídico narrado de acordo com a regra determinante: ${punct(rule)}`,basis:basis||'O fundamento normativo específico não foi identificado automaticamente; o item permanece sinalizado para validação jurídica individual antes de ser tratado como revisado.',trap:'Pegadinha FGV/OAB: os distratores alteram um elemento juridicamente decisivo — requisito, competência, prazo, exceção, alcance ou efeito.',reviewRule:`Regra de revisão: ${punct(rule)}`,alternatives,sourceNote:'Questão autoral OAB Focus construída com diversidade semântica e cenário adequado ao instituto, inspirada na estrutura das questões reais FGV/OAB, sem reprodução de enunciado oficial.'};
  }

  function qualityGate(q){
    const reasons=[];if(!q||DEAD_PROMPTS.some(re=>re.test(q.statement||'')))reasons.push('dead_prompt');
    if((clean(q.statement).match(/\S+/g)||[]).length<18)reasons.push('statement_too_short');
    if(!Array.isArray(q.options)||q.options.length!==4)reasons.push('option_count');
    if(q.options?.some(o=>!clean(o)||DEAD_PROMPTS.some(re=>re.test(o))))reasons.push('bad_option');
    if(new Set((q.options||[]).map(norm)).size!==4)reasons.push('duplicate_options');
    if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)reasons.push('answer');
    return {ok:reasons.length===0,reasons};
  }

  function buildQuestion({id,discipline,topic,chapterId='',seq=1,rule,context='',exam='Autoral — OAB Focus'}){
    rule=punct(rule);topic=clean(topic)||clean(discipline);
    const sc=scenario(discipline,topic,rule,seq,id),wrong=buildDistractors(rule,topic,discipline);if(wrong.length<3)return null;
    const answer=hash(`${id}|${seq}`)%4,options=wrong.slice();options.splice(answer,0,rule);options.length=4;
    const research=buildResearch(rule,options,answer,topic,context);
    const q={id,number:seq,displayNumber:seq,discipline,exam,statement:sc.statement,options,answer,comment:`${research.whyCorrect} Fundamento jurídico: ${research.basis}`,research,researchVersion:'v35.15-fgv-diversity',topic,microtopic:topic,source:'OAB Focus — questão autoral em padrão FGV/OAB com diversidade semântica',sourceType:'authorial',authorial:true,excludeFromHistoricalStats:true,chapterId,styleArchetype:sc.family,styleVariant:sc.variant};
    const gate=qualityGate(q);return gate.ok?q:null;
  }

  return {VERSION,corpusProfile,familyFor,scenarioCatalog,recentOpenings,similarity,resetHistory,buildDistractors,buildResearch,buildQuestion,qualityGate,DEAD_PROMPTS};
});
