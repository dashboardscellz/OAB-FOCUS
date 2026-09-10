/* OAB Focus v35.19 — Motor autoral FGV/OAB com autossuficiência factual, diversidade semântica e memória antirrepetição.
   O corpus real orienta estrutura e ritmo; nenhum enunciado oficial é reproduzido. */
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.OAB_V35_AUTHORIAL_FGV=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const VERSION='35.19';
  const LETTERS='ABCD';
  // Gate inclui a frase morta “considerando o material” e equivalentes.
  const DEAD_PROMPTS=[/considerando (?:exclusivamente )?o material/i,/conte[uú]do estudado/i,/unidade que voc[eê] acabou de estudar/i,/regra apresentada no material/i,/compat[ií]vel com o material/i,/texto apresentado/i,/de acordo com a unidade/i];
  const clean=(s='')=>String(s??'').replace(/\s+/g,' ').trim();
  function sanitizeRule(s=''){
    const external=root?.OAB_V35_QUESTION_QUALITY?.sanitizeRule;
    if(typeof external==='function')return external(s);
    let x=clean(s)
      .replace(/^\s*(?:OBS(?:ERVA[CÇ][AÃ]O)?|NOTA)\s*:\s*/i,'')
      .replace(/\*+\s*(?:CAIU\s+NA\s+OAB|NA\s+OAB)\s*[-–—:]?\s*\d{1,3}(?:[ºªo])?\s*\*+/gi,' ')
      .replace(/\(?\s*(?:CAIU\s+NA\s+OAB|NA\s+OAB)\s*[-–—:]?\s*\d{1,3}(?:[ºªo])?\s*\)?/gi,' ')
      .replace(/\s+([,.;:!?])/g,'$1').replace(/\.{2,}/g,'.').replace(/\s+/g,' ').trim();
    return x.replace(/^[-–—:;,.\s]+/,'').replace(/\s*\*+\s*$/,'').trim();
  }
  const norm=(s='')=>clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const punct=s=>/[.!?]$/.test(clean(s))?clean(s):clean(s)+'.';
  const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
  const pick=(arr,key,offset=0)=>arr[(hash(key)+offset)%arr.length];
  const names=['Marina','Rafael','Camila','Eduardo','Larissa','Bruno','Renata','Felipe','Isabela','André','Helena','Caio','Joana','Gustavo','Beatriz','Vinícius','Clara','Marcelo','Paula','Diego'];
  const cities=['Recife','Salvador','Goiânia','Curitiba','Fortaleza','Belo Horizonte','João Pessoa','Campinas','Natal','Florianópolis'];
  const companies=['Aurora Ltda.','Horizonte S.A.','Ponte Norte Ltda.','Estação Comércio Digital','Via Clara Serviços','Serra Azul Participações'];
  const publicBodies=['Município de Vale Verde','Estado de Serra Clara','Agência Estadual de Regulação','Secretaria Municipal de Administração','Autarquia de Desenvolvimento Regional'];
  const recentOpenings=new Map();
  const extraPersonNames=['Pedro','Matheus','João','Maria','Carlos','Ana','Paulo','Lucas','Marcos','Fernanda','Júlia','Luiz','José','Antônio','Miguel','Mariana','Gabriel','Daniel','Patrícia','Ricardo'];
  const entityLexicon=[...new Set([...names,...extraPersonNames,...cities])];
  const genericDistractorPatterns=[
    /conduz [aà] conclus[aã]o oposta/i,
    /efeito jur[ií]dico previsto pode ser afastado/i,
    /depende de requisito adicional que n[aã]o integra/i
  ];

  function entityWords(text=''){
    const hay=` ${norm(text).replace(/[^a-z0-9]+/g,' ')} `,out=[];
    for(const raw of entityLexicon){
      const key=norm(raw).replace(/[^a-z0-9]+/g,' ').trim();
      if(key&&hay.includes(` ${key} `))out.push(raw);
    }
    return [...new Set(out)];
  }
  function orphanEntities(q={}){
    const st=new Set(entityWords(q.statement||'').map(norm)),orph=[];
    for(const opt of (q.options||[]))for(const ent of entityWords(opt))if(!st.has(norm(ent)))orph.push(ent);
    return [...new Set(orph.map(norm))];
  }

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

  const safeScenarioCatalog=[
    '{p} procurou orientação jurídica em {city} sobre {topic}, após surgirem interpretações divergentes acerca dos requisitos e efeitos do instituto.',
    'No curso de um caso envolvendo {topic}, a equipe jurídica de {company} precisa definir qual interpretação respeita os pressupostos legais aplicáveis.',
    'Em parecer solicitado por {company}, quatro soluções foram apresentadas para uma controvérsia centrada em {topic}.',
    'Durante a análise de uma situação concreta em {city}, surgiu dúvida quanto ao alcance jurídico de {topic}.',
    '{p} e {p2} receberam orientações divergentes sobre {topic} e buscam identificar a consequência juridicamente adequada.',
    'Um advogado foi consultado em {city} para esclarecer os efeitos jurídicos de {topic} diante de interpretações conflitantes.',
    'A assessoria de {company} examina um problema relacionado a {topic} e precisa distinguir a regra aplicável de conclusões que alteram seus pressupostos.',
    'Em procedimento iniciado em {city}, a controvérsia principal recai sobre os requisitos e efeitos de {topic}.',
    'Ao revisar a solução proposta para um caso sobre {topic}, {p} identificou divergência quanto à consequência prevista pelo ordenamento.',
    'Uma consulta profissional apresentada a {p} exige definir corretamente o regime jurídico de {topic}, sem acrescentar requisitos não previstos.',
    'Em reunião jurídica de {company}, foram apresentadas quatro interpretações para uma hipótese de {topic}.',
    'A solução de um caso concreto depende de identificar, entre proposições concorrentes, qual traduz corretamente a disciplina de {topic}.',
    'Durante a preparação de uma medida jurídica, {p} precisa verificar o alcance e os limites de {topic}.',
    'Em {city}, uma controvérsia envolvendo {topic} levou as partes a defender consequências jurídicas distintas para a mesma hipótese.',
    'Ao examinar um processo, {p} percebeu que o ponto decisivo está na correta aplicação de {topic}.',
    'A equipe jurídica de {company} foi chamada a revisar uma orientação anterior sobre {topic}, pois havia dúvida sobre seus requisitos e efeitos.',
    'Em consulta formulada no ano de {year}, a questão central consiste em definir a solução compatível com o regime de {topic}.',
    'Antes de adotar uma providência, {p} busca esclarecer qual consequência decorre juridicamente de {topic}.',
    'Quatro teses foram apresentadas em um caso de {topic}; apenas uma preserva os pressupostos e efeitos previstos na disciplina aplicável.',
    'Na análise de {topic}, surgiu divergência entre uma interpretação que preserva a regra jurídica e outras que alteram requisito, alcance ou consequência.',
    'Em atuação profissional realizada em {city}, {p} precisa orientar o cliente sobre a solução correta para uma questão de {topic}.',
    'A controvérsia submetida à equipe de {company} envolve diretamente {topic} e exige identificar a proposição juridicamente correta.',
    'Durante estudo de um caso prático, a discussão se concentrou no efeito jurídico produzido por {topic}.',
    'Uma decisão a ser tomada em {city} depende da interpretação correta dos pressupostos de {topic}.'
  ];

  function specificScenario(discipline,topic,rule,seq,id=''){
    const n=norm(rule),nt=norm(topic),key=`${discipline}|${topic}|${id}|${seq}|specific`,v=vars(discipline,topic,seq,key);
    if(/tempo do crime/.test(nt)||(/momento da acao ou omissao/.test(n)&&/teoria da atividade/.test(n))){
      const victim=v.p2===v.p?pick(names,key+'|victim',seq+9):v.p2;
      const variants=[
        `${v.p} efetuou um disparo contra ${victim} em 10 de março. Em razão do ferimento, ${victim} permaneceu hospitalizado e faleceu cinco dias depois.`,
        `${v.p} desferiu um golpe contra ${victim} em 4 de abril. O resultado morte, decorrente da agressão, ocorreu somente em 9 de abril.`,
        `No dia 12 de maio, ${v.p} praticou a conduta destinada a causar a morte de ${victim}. A vítima faleceu em decorrência dessa conduta no dia 18 do mesmo mês.`,
        `${v.p} realizou a ação criminosa em 7 de junho. O resultado naturalístico diretamente ligado à conduta somente se produziu três dias depois.`,
        `Em 15 de agosto, ${v.p} praticou a ação que deu início ao fato criminoso. Por consequência direta dessa conduta, o resultado ocorreu em 20 de agosto.`,
        `${v.p} executou a conduta penalmente relevante em 2 de setembro. O resultado correspondente ocorreu apenas em 6 de setembro, sem nova ação do agente.`
      ];
      const i=(hash(key)+seq)%variants.length;
      return {base:variants[i],family:'penalTimeCrime',variant:i};
    }
    if(/sentenca.*transitad.*julgad/.test(n)&&/lei posterior/.test(n)&&( /favore.*reu/.test(n)||/mais (?:favoravel|benefic)/.test(n))&&(/execucao penal/.test(n)||/reducao da pena/.test(n))){
      const variants=[
        `${v.p} cumpre pena imposta por sentença já transitada em julgado. Depois da condenação definitiva, entrou em vigor lei penal posterior mais favorável ao réu, e a defesa avalia a repercussão dessa mudança na execução.`,
        `Após o trânsito em julgado da condenação de ${v.p}, uma lei posterior passou a estabelecer tratamento penal mais favorável. A defesa pretende saber qual providência é cabível quanto à pena em execução.`,
        `${v.p} foi condenado definitivamente e iniciou o cumprimento da pena. Durante a execução penal, sobreveio lei posterior que o favorece, surgindo controvérsia sobre a possibilidade de ajustar a sanção imposta.`,
        `Em processo já encerrado por decisão transitada em julgado, ${v.p} cumpre a pena fixada. Uma nova lei penal, posterior e mais favorável, entrou em vigor enquanto a execução estava em curso.`,
        `A condenação de ${v.p} tornou-se definitiva. Meses depois, lei penal superveniente passou a favorecer sua situação, e a defesa levou a questão ao âmbito da execução penal.`,
        `Durante o cumprimento de pena por ${v.p}, já após o trânsito em julgado, foi publicada lei posterior mais benéfica. O ponto controvertido é o efeito dessa lei sobre a pena imposta.`
      ];
      return {base:variants[(hash(key)+seq)%variants.length],family:'penalTime',variant:(hash(key)+seq)%variants.length};
    }
    if(/conflito de leis|elementos? de conexao|lei aplicavel.*obrigac|lindb/.test(`${norm(topic)} ${n}`)){
      const variants=[
        `${v.p}, domiciliado no Brasil, celebrou no exterior contrato com sociedade estrangeira para obrigação com efeitos em território brasileiro. Surgiu divergência sobre a lei aplicável ao vínculo.`,
        `${v.company} firmou contrato internacional com empresa sediada fora do Brasil. O negócio apresenta elementos ligados a mais de um país, e as partes discutem qual legislação deve reger a obrigação.`,
        `${v.p} e ${v.p2}, residentes em países distintos, celebraram obrigação com execução prevista no Brasil. A controvérsia exige identificar o elemento de conexão juridicamente relevante.`,
        `Um contrato foi celebrado no exterior e deve produzir efeitos patrimoniais no Brasil. As partes divergem sobre a determinação da lei aplicável à obrigação.`,
        `${v.company}, sediada no Brasil, assumiu obrigação perante sociedade estrangeira, com atos praticados em países diferentes. A solução depende das regras de conflito de leis no espaço.`,
        `Em operação internacional envolvendo bens e obrigações vinculados ao Brasil e ao exterior, surgiu controvérsia sobre qual ordenamento deve disciplinar a relação jurídica.`
      ];
      return {base:variants[(hash(key)+seq)%variants.length],family:'internationalConflict',variant:(hash(key)+seq)%variants.length};
    }
    return null;
  }

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
    rule=sanitizeRule(rule);topic=clean(topic)||clean(discipline);
    const family=familyFor(discipline,topic,rule),key=`${discipline}|${topic}|${rule}|${id}|${seq}`;
    const special=specificScenario(discipline,topic,rule,seq,id);
    for(let attempt=0;attempt<48;attempt++){
      const v=vars(discipline,topic,seq+attempt,key);
      const baseIndex=(hash(key)+seq+attempt)%safeScenarioCatalog.length;
      const base=special&&attempt<6?special.base:fill(safeScenarioCatalog[baseIndex],v);
      const lead=special&&attempt<6?'':leadFor(family,v,Math.floor((seq+attempt)/safeScenarioCatalog.length)+(hash(key+'|lead')%5));
      const command=commands[(hash(key+'|cmd')+seq+attempt*3)%commands.length];
      const statement=`${punct(joinLead(lead,base))} ${command}`;
      if(!isTooSimilar(statement,discipline)){remember(statement,discipline);return {statement,family:special?.family||family,variant:special?.variant??baseIndex};}
    }
    const v=vars(discipline,topic,seq,key+'|fallback');
    const statement=`${v.p} precisa definir a solução juridicamente adequada em uma controvérsia sobre ${topic}. Assinale a alternativa correta à luz do regime aplicável.`;
    remember(statement,discipline);return {statement,family:'genericDoctrine',variant:-1};
  }

  function corpusProfile(bank=[]){
    const real=(bank||[]).filter(q=>q&&!q.authorial&&q.sourceType!=='authorial');
    const lens=real.map(q=>(clean(q.statement).match(/\S+/g)||[]).length).sort((a,b)=>a-b);
    const median=lens.length?lens[Math.floor(lens.length/2)]:0;
    const caseLike=real.filter(q=>/\b(?:foi|ajuizou|contratou|pretende|recebeu|celebrou|sociedade|munic[ií]pio|estado|uni[aã]o|advogad[oa]|empregad[oa]|acusad[oa]|consumidor)\b/i.test(q.statement||'')).length;
    return {realQuestions:real.length,medianStatementWords:median,caseLikeRatio:real.length?caseLike/real.length:0};
  }

  function replaceLegalPhrase(rule,phrase,repl){
    const escaped=phrase.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const re=new RegExp(`(^|[\s,;:.!?()\[\]{}\"'“”])${escaped}(?=$|[\s,;:.!?()\[\]{}\"'“”])`,'i');
    if(!re.test(rule))return '';
    const x=punct(rule.replace(re,(_,prefix)=>prefix+repl));
    return norm(x)!==norm(rule)?x:'';
  }
  function numericMutation(rule){
    const m=rule.match(/\b(\d{1,3})\s*(dias?|meses?|anos?|%|por cento)\b/i);if(!m)return '';
    const n=Number(m[1]);if(!Number.isFinite(n)||n===0)return '';
    const changed=String(n<10?n+1:n<=30?n+5:n+10);
    return punct(rule.replace(m[0],`${changed} ${m[2]}`));
  }
  function conditionMutation(rule){
    const pairs=[['desde que','mesmo sem'],['salvo','inclusive'],['somente','também'],['apenas','inclusive'],['independentemente de','desde que haja'],['posterior','anterior'],['mais favorável','mais gravosa'],['mais benéfica','mais gravosa']];
    for(const [a,b] of pairs){const x=replaceLegalPhrase(rule,a,b);if(x)return x;}return '';
  }
  function optionContainment(a,b){
    const A=tokenSet(a),B=tokenSet(b);if(!A.size||!B.size)return 0;let inter=0;for(const x of A)if(B.has(x))inter++;
    return inter/Math.max(1,Math.min(A.size,B.size));
  }
  function semanticDistractors(rule,topic,discipline=''){
    const label=clean(topic)||clean(discipline)||'o instituto',nr=norm(rule),nt=norm(topic);
    if(/tempo do crime/.test(nt)||(/momento da acao ou omissao/.test(nr)&&/teoria da atividade/.test(nr)))return [
      'Considera-se praticado o crime no momento em que ocorre o resultado, ainda que a ação ou omissão tenha ocorrido anteriormente.',
      'O tempo do crime abrange simultaneamente o momento da conduta e o momento do resultado, aplicando-se entre eles a solução mais favorável ao agente.',
      'Quando o resultado é posterior à conduta, considera-se praticado o crime apenas no momento da consumação do resultado naturalístico.'
    ];
    if(/sentenca.*transitad.*julgad/.test(nr)&&/lei posterior/.test(nr)&&( /favore.*reu/.test(nr)||/mais (?:favoravel|benefic)/.test(nr))&&(/execucao penal/.test(nr)||/reducao da pena/.test(nr)))return [
      'O trânsito em julgado impede que lei penal posterior mais favorável produza efeito sobre a pena que já está em execução.',
      'Lei penal superveniente somente pode repercutir na condenação definitiva quando agravar a situação do réu, não quando lhe for mais benéfica.',
      'Depois do trânsito em julgado, a pena permanece imutável na execução, ainda que surja lei posterior que favoreça o condenado.'
    ];
    if(/\bcabe\b/.test(nr))return [
      `A providência discutida em ${label} é incabível mesmo quando presentes os pressupostos descritos na hipótese.`,
      `No âmbito de ${label}, a medida indicada deve ser tratada como obrigatória em toda situação, independentemente dos pressupostos legais.`,
      `A ocorrência dos pressupostos de ${label} não produz a consequência processual indicada pela regra aplicável.`
    ];
    if(/\bcompete\b/.test(nr))return [
      `A atribuição examinada em ${label} não pertence ao órgão definido pela regra aplicável.`,
      `Em ${label}, a competência pode ser deslocada livremente por acordo entre os interessados.`,
      `A matéria de ${label} deve ser tratada como competência indistinta entre os órgãos envolvidos, sem observar a atribuição legal específica.`
    ];
    if(/\bn[aã]o pode\b|\bvedad[oa]\b|\bproibid[oa]\b/.test(nr))return [
      `A conduta discutida em ${label} é permitida sem restrições mesmo na hipótese alcançada pela vedação legal.`,
      `No regime de ${label}, a prática vedada converte-se em dever jurídico quando presentes os mesmos pressupostos da regra.`,
      `A proibição aplicável a ${label} deixa de produzir efeito justamente quando configurada a situação descrita na norma.`
    ];
    if(/\bdeve\b|\bdever[aá]\b/.test(nr))return [
      `A conduta prevista em ${label} constitui mera faculdade, ainda que estejam presentes os pressupostos que fazem surgir o dever.`,
      `Em ${label}, o comportamento imposto pela regra é juridicamente vedado na própria hipótese em que a norma determina sua realização.`,
      `O dever relacionado a ${label} somente poderia surgir após requisito adicional não previsto na disciplina aplicável.`
    ];
    if(/\bpode\b|\bpoder[aá]\b/.test(nr))return [
      `A atuação admitida em ${label} é proibida mesmo quando presentes os pressupostos legais que autorizam sua prática.`,
      `Em ${label}, a faculdade prevista pela regra transforma-se em obrigação automática em qualquer hipótese.`,
      `A possibilidade reconhecida em ${label} desaparece justamente quando se verificam os pressupostos necessários à sua incidência.`
    ];
    return [
      `A disciplina de ${label} conduz à conclusão oposta mesmo quando permanecem inalterados os pressupostos da regra aplicável.`,
      `Em ${label}, o efeito jurídico previsto pode ser afastado sem mudança dos fatos ou dos requisitos relevantes.`,
      `A solução de ${label} depende de requisito adicional que não integra a hipótese jurídica considerada.`
    ];
  }
  function buildDistractors(rule,topic,discipline=''){
    rule=punct(sanitizeRule(rule));
    const candidates=[],nr=norm(rule),label=clean(topic)||clean(discipline)||'o instituto';
    if(/atividades? privativas? da advocacia/.test(nr))return [
      'Somente a postulação perante o Poder Judiciário constitui atividade privativa da advocacia, de modo que a consultoria jurídica pode ser prestada livremente por não advogados.',
      'A consultoria jurídica por não advogado é admitida quando não houver assinatura de parecer nem representação judicial do cliente.',
      'A orientação jurídica pode ser prestada por empresa não inscrita na OAB quando destinada apenas a pessoas jurídicas.'
    ];
    candidates.push(...semanticDistractors(rule,topic,discipline));
    const phrasePairs=[['não pode','pode'],['pode','deve'],['não deve','deve'],['deve','pode'],['não é','é'],['é','não é'],['não são','são'],['são','não são'],['compete','não compete'],['cabe','não cabe'],['é vedado','é permitido'],['é vedada','é permitida'],['é permitido','é vedado'],['é permitida','é vedada'],['exclui','mantém'],['limita','amplia']];
    for(const [a,b] of phrasePairs){const x=replaceLegalPhrase(rule,a,b);if(x)candidates.push(x);}
    const cm=conditionMutation(rule);if(cm)candidates.push(cm);const nm=numericMutation(rule);if(nm)candidates.push(nm);
    const reserves=[
      `A incidência de ${label} fica afastada mesmo quando presentes os pressupostos que normalmente acionam a regra jurídica correspondente.`,
      `Em ${label}, a consequência jurídica pode ser substituída por solução oposta sem alteração dos fatos juridicamente relevantes.`,
      `A aplicação de ${label} exige condição adicional estranha aos pressupostos descritos na hipótese.`
    ];
    candidates.push(...reserves);
    const out=[];
    for(const c of candidates){
      const x=punct(sanitizeRule(c));
      if(!x||norm(x)===norm(rule)||optionContainment(x,rule)>=0.90||out.some(y=>norm(y)===norm(x)||optionContainment(x,y)>=0.90))continue;
      out.push(x);if(out.length===3)break;
    }
    return out;
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
    const joined=[q?.statement,...(q?.options||[]),q?.comment].filter(Boolean).join(' ');
    if(/(?:CAIU\s+NA\s+OAB|NA\s+OAB)\s*\d+/i.test(joined)||/^\s*OBS\s*:/im.test(joined))reasons.push('exam_annotation');
    if((clean(q?.statement).match(/\S+/g)||[]).length<18)reasons.push('statement_too_short');
    if(!Array.isArray(q?.options)||q.options.length!==4)reasons.push('option_count');
    if(q?.options?.some(o=>!clean(o)||DEAD_PROMPTS.some(re=>re.test(o))))reasons.push('bad_option');
    if(new Set((q?.options||[]).map(norm)).size!==4)reasons.push('duplicate_options');
    if(!Number.isInteger(q?.answer)||q.answer<0||q.answer>3)reasons.push('answer');
    if(orphanEntities(q).length)reasons.push('orphan_entity');
    const topic=norm(q?.topic||q?.microtopic||''),st=norm(q?.statement||'');
    if(/tempo do crime/.test(topic)){
      const hasConduct=/(acao|omissao|conduta|dispar|golpe|ferimento)/.test(st);
      const hasLaterResult=/(resultado|faleceu|morreu|obito|depois|posterior|dias|mes)/.test(st);
      if(!hasConduct||!hasLaterResult)reasons.push('missing_operational_fact');
    }
    return {ok:reasons.length===0,reasons};
  }

  function buildQuestion({id,discipline,topic,chapterId='',seq=1,rule,context='',exam='Autoral — OAB Focus'}){
    rule=punct(sanitizeRule(rule));topic=clean(topic)||clean(discipline);
    const sc=scenario(discipline,topic,rule,seq,id),wrong=buildDistractors(rule,topic,discipline);if(wrong.length<3)return null;
    const answer=hash(`${id}|${seq}`)%4,options=wrong.slice();options.splice(answer,0,rule);options.length=4;
    const research=buildResearch(rule,options,answer,topic,context);
    const q={id,number:seq,displayNumber:seq,discipline,exam,statement:sc.statement,options,answer,comment:`${research.whyCorrect} Fundamento jurídico: ${research.basis}`,research,researchVersion:'v35.19-fgv-self-contained',topic,microtopic:topic,source:'OAB Focus — questão autoral em padrão FGV/OAB com diversidade semântica',sourceType:'authorial',authorial:true,excludeFromHistoricalStats:true,chapterId,styleArchetype:sc.family,styleVariant:sc.variant};
    const gate=qualityGate(q);return gate.ok?q:null;
  }

  return {VERSION,sanitizeRule,corpusProfile,familyFor,scenarioCatalog,safeScenarioCatalog,recentOpenings,similarity,resetHistory,specificScenario,buildDistractors,buildResearch,buildQuestion,qualityGate,orphanEntities,entityWords,genericDistractorPatterns,DEAD_PROMPTS};
});
