# OAB Focus SUPER v35

## Novidades estruturais da v35

- **Shell profissional:** a navegação global migrou da sidebar fixa para cabeçalho superior em dois níveis no desktop, com navegação horizontal e largura de conteúdo de até 1240 px.
- **Sidebar contextual:** só aparece em fluxos em que agrega contexto, como trilha/leitor e administração.
- **Mobile próprio:** topbar compacta + 5 destinos inferiores (Início, Estudar, Prepare-se, Questões e Mais), com safe-area e auditoria em 360/390/430/768 px.
- **Tipografia e densidade:** interface e leitura usam Inter, cards perderam sombras e arredondamentos excessivos, hierarquia e espaçamento foram normalizados.
- **Isolamento de contas:** novos usernames recebem identidade técnica SHA-256 sem colisão por pontuação; contas legadas continuam aceitas somente quando o username digitado corresponde ao `profile.username`.
- **Cadastro seguro:** criar cadastro não troca a sessão ativa; progresso só pode ser salvo quando `user.uid === progressOwnerUid`.
- **Troca de usuário limpa:** timers, questão atual, fila, resposta selecionada, leitor, streams e estado temporário são limpos entre contas.


A v34 é uma revisão estrutural da experiência de estudo do OAB Focus. Ela preserva o material jurídico integral, o banco histórico, a 47ª OAB, o progresso existente, o login/Firebase e a arquitetura ampla do leitor, mas corrige a trilha, o feedback das questões, a grifagem e a medição de tempo de estudo.

## Principais correções da v34

- **Trilha pedagógica auditada:** títulos-pai redundantes deixam de repetir integralmente os subtópicos; introduções próprias são preservadas e o recorte de cada unidade termina no próximo heading.
- **Limpeza de falsos tópicos:** sumários, paginação, tabelas, quadros, status editoriais e outros headings contaminados são filtrados da trilha.
- **Cobertura de questões por unidade:** cada unidade estudável recebe no mínimo 3 questões estritamente relacionadas ao microtema. Questões FGV/OAB reais têm prioridade; faltas são completadas por questões autorais claramente identificadas e excluídas das estatísticas históricas da FGV.
- **Feedback visual de ações:** favoritos, alternativas selecionadas e ações de continuação passam a exibir estado selecionado/carregando de forma perceptível e acessível.
- **47ª OAB aprofundada:** as 80 questões possuem pesquisa jurídica estruturada com resposta correta, fundamento, armadilha e análise das alternativas. Em resposta errada, o site informa exatamente a alternativa marcada, por que ela está errada e qual é a correta.
- **Caderno de erros enriquecido:** registra alternativa marcada, resposta correta, conceito confundido, fundamento jurídico, explicação do erro e data, para alimentar revisão adaptativa.
- **Grifagem ampliada:** funciona no material explicado, legislação e súmulas, com 6 cores (amarelo, verde, azul, rosa, lilás e laranja) e persistência por escopo.
- **Tempo de estudo visível:** reaproveita a contagem de tempo ativo e mostra sessão, unidade, hoje e acumulado; aba oculta/inatividade não contam como estudo ativo.
- **Progressão pedagógica:** leitura + prática contextual liberam a sequência; percentual de acerto não bloqueia a trilha, e os erros retornam para revisão.
- **Mapas mentais continuam removidos.**

## 47º Exame de Ordem — gabarito atual

A v34 usa o **gabarito preliminar da FGV atualizado em 07/09/2026** para a Prova Tipo 1 – Branca. Nessa atualização, a questão 17 passou a ter resposta **D**. O sistema identifica o status como `preliminar-revisado-2026-09-07` para permitir nova atualização quando houver gabarito definitivo.

## Arquivos centrais da atualização

- `data/v34-research.js` — pesquisa jurídica estruturada das 80 questões da 47ª OAB.
- `data/v34-patch.js` — trilha, cobertura contextual, feedback, caderno de erros, temporizador e estados visuais.
- `data/v18-patch.js` — grifagem estendida para teoria, legislação e súmulas, com 6 cores.
- `data/v30-questions.js` — gabarito atual da 47ª OAB e comentários-base atualizados.
- `tests/v34_heavy_audit.py` — regressões específicas da auditoria pesada.
- `QA_ENGENHARIA_v34.md` — relatório da validação desta versão.

## Publicação

Extraia o ZIP e execute `ATUALIZAR_GITHUB.cmd`, ou copie a pasta para `C:\Users\endoa\Documents\GitHub\OAB-FOCUS`, confira as alterações no GitHub Desktop e faça commit/push.


### v35.2
Redesenho do leitor: coluna central de estudo, métricas integradas, material plano e barra de grifo centralizada.


### v35.3
Leitor focado: foram removidos do modo de leitura os blocos redundantes mostrados na auditoria visual — `Questões relacionadas`, a prévia de questões dentro do artigo e os rodapés legados de encerramento/"Fim desta unidade". A prática continua disponível nas áreas próprias de Questões/Prepare-se e a progressão guiada v27 permanece preservada quando aplicável. Também foi removido o atalho morto de "Questões" da toolbar do leitor quando o bloco correspondente não existe. Assets v35 usam `?v=35.3`.


### v35.4
Acabamento visual do login e navegação de saída das questões: retrato institucional ampliado e reequilibrado no desktop, gutters seguros no formulário, diagonais suavizadas e botão contextual `← Voltar` na experiência de questões. Assets v35 usam `?v=35.4`.


### v35.5
Taxonomia pedagógica global: subtítulos deixam de virar unidades automaticamente. O sistema agrupa microtópicos juridicamente dependentes em unidades completas, preserva institutos autônomos separados, agrega questões dos microtópicos de origem e mantém compatibilidade com progresso legado. Poder Constituinte passa a reunir conceito, originário, derivado/modalidades e limites em uma única unidade. Materiais aprofundados de Improbidade, Licitações e Ética recebem recortes semânticos próprios para impedir sumários, citações e fragmentos de PDF de virarem assuntos. Assets v35 usam `?v=35.5`.
