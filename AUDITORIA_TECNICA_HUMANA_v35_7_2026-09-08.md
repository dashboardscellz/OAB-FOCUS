# OAB Focus v35.7: Auditoria Técnica e de Experiência Humana

Data: 08/09/2026
Pacote revisado: `OAB_Focus_SUPER_v35_7_QUESTOES_CORRIGIDAS_GITHUB.zip`
Metodologia: `PROMPT_MESTRE_AUDITORIA_TECNICA_HUMANA_v1.md`. Leitura direta do código real (`index.html`, 4,7 MB; todo `data/*.js`; `database.rules.json`; os 14 arquivos de `tests/`), cruzada com o histórico já documentado no próprio projeto (README, `CORRECAO_TRILHA_QUESTOES_v35_6.md`, `AUDITORIA_QUESTOES_v35_7.md`).

Limite honesto desta auditoria: não executei a aplicação real com login no Firebase (isso exigiria credenciais de um ambiente de teste). Os pontos abaixo vêm de leitura de código, de evidência já documentada pelo próprio projeto, ou de simulação isolada (como os testes Playwright existentes já fazem). Onde isso importa, eu digo explicitamente.

## Resumo para quem tem 2 minutos

- O alicerce de segurança do Firebase está bem pensado (nada de porta aberta na raiz), mas falta uma trava de formato para o que o aluno pode escrever no próprio perfil.
- Já aconteceu, de verdade, um bug de contaminação entre disciplinas (questão de Ética aparecendo no estudo de Constitucional) por causa de como o estado é compartilhado entre os mais de 30 arquivos que compõem o app. A causa raiz que permitiu isso ainda existe como padrão arquitetural, mesmo com aquele caso pontual corrigido.
- Nenhum teste automatizado carrega a página real como o aluno a recebe; todos recriam pedaços isolados. É por isso que o bug acima só foi descoberto na prática, não pelos testes.
- Quando salvar o progresso falha (conexão ruim, por exemplo), o aluno não fica sabendo. O sistema tenta de novo sozinho, o que é bom, mas em silêncio total.
- O carregamento inicial baixa cerca de 29 arquivos de forma sequencial e bloqueante, incluindo um de 5,7 MB, sem cache atualizado em 22 deles. Em conexão ruim, isso é tempo de tela em branco.
- Nada disso tira o mérito do que já está sólido: a lista completa está na seção seguinte.

## O que já está bem resolvido

- `database.rules.json` nega leitura e escrita por padrão na raiz e usa lógica correta de dono do dado e de papel (admin/aluno), incluindo tratamento de conta pendente/rejeitada. Esse é o erro mais comum em apps Firebase amadores (regra aberta por esquecimento) e ele não existe aqui.
- Nos dois pontos de maior exposição pública que testei (lista de usuários no admin e ranking visível a todos os alunos), o nome e o username do usuário passam por uma função de escape antes de entrar no HTML. Não encontrei uma falha de XSS ativa nesses pontos.
- Existem testes de navegador de verdade, usando Playwright, não apenas checagem de texto, cobrindo exatamente a família de bug (isolamento de conta e identidade por hash) que já causou retrabalho estrutural na v35. Isso mostra que o time aprendeu com o incidente.
- `AUDITORIA_QUESTOES_v35_7.md` é honesto sobre os próprios limites: diz claramente que a auditoria das 2.336 questões foi estrutural, não jurídica questão a questão, e que comentários legados não foram reescritos por falta dessa revisão individual. Essa transparência é rara e vale manter como padrão.
- `saveProgress` tenta salvar de novo automaticamente a cada 12 segundos quando falha. A decisão de engenharia é razoável; falta só torná-la visível (achado COD-03).
- O `PROMPT_MESTRE_QUALIDADE_QUESTOES_v35_7.md` já em uso é sofisticado e proíbe explicitamente inventar fundamento jurídico, exatamente a postura certa para um banco de questões da OAB.

## Achados

### COD-01 (CRÍTICO): Estado global fragmentado entre patches
**Categoria:** integridade do estado global entre patches
**Evidência:** o próprio `CORRECAO_TRILHA_QUESTOES_v35_6.md` documenta que `index.html` declara `qFilters` com `let` (uma variável léxica local ao script), enquanto `v27-patch.js` escrevia em `window.qFilters`, uma propriedade diferente do objeto global. Como `buildQueue()` lia o `qFilters` léxico, o contexto de disciplina escrito pela trilha nunca chegava até a montagem da fila de questões. Isso não é uma hipótese minha: é a causa raiz que o próprio projeto já registrou por escrito. A condição que permite esse tipo de divergência (mais de trinta arquivos escrevendo em variáveis compartilhadas por nome, sem um único namespace confirmado) continua presente na arquitetura.
**Cenário humano:** um aluno estudando a unidade de Direito Constitucional entra na prática contextual e recebe uma questão de Ética misturada, ou pior, o banco inteiro (o próprio documento cita "1/5048" como sintoma) em vez de só as questões daquela unidade. O aluno perde tempo, se confunde sobre o que está de fato estudando, e pode achar que a "trilha guiada" não é confiável.
**Correção sugerida:**
- Mínima: ao escrever um novo patch, sempre confirmar por leitura de código, não por suposição, que ele lê e escreve a mesma referência (léxica ou `window.*`) usada pelo código que consome aquele dado.
- Estrutural: consolidar as variáveis verdadeiramente compartilhadas entre arquivos em um único objeto explícito (por exemplo `window.OAB_STATE`), criado uma vez em `index.html`, e migrar os patches para ler/escrever só através dele. Isso não exige reescrever a aplicação inteira, só parar de criar novos bindings soltos com nomes que já existem em outro lugar.
**Status:** o sintoma relatado em v35.6 está `CORRIGIDO`; o padrão arquitetural que permitiu o problema segue `ABERTO`.

### COD-02 (CRÍTICO): Nenhum teste carrega a página real de ponta a ponta
**Categoria:** cobertura real de testes
**Evidência:** a suíte tem 14 arquivos e 169 funções de teste. Oito arquivos usam Playwright para automação real de navegador (`v26_reader_architecture.py`, `v27_progressive_trail.py`, `v28_layout_quality.py`, `v29_layout_audit.py`, `v32_login_layout.py`, `v33_login_height.py`, `v35_account_browser.py`, `v35_layout_browser.py`); os outros seis fazem checagem de presença/ordem de texto no arquivo-fonte. Conferi cada um dos oito arquivos de navegador: todos usam `page.set_content(...)` com um fragmento de página reconstruído, nunca `page.goto(...)` sobre o `index.html` real e completo. Alguns (`v32_login_layout.py`, `v33_login_height.py`) pelo menos extraem o trecho real do `index.html` antes de montar o fragmento, o que é melhor do que escrever à mão, mas ainda testam a peça isolada, não a página inteira com os 29 scripts carregando na ordem real de produção.
**Cenário humano:** é exatamente por isso que o bug do COD-01 (questão de Ética aparecendo em Constitucional) só foi encontrado quando alguém reproduziu manualmente o fluxo ("Sintoma reproduzido", nas palavras do próprio `CORRECAO_TRILHA_QUESTOES_v35_6.md`), e não pela suíte automatizada. Um teste que só carrega um fragmento de `v27-patch.js` isolado, com stubs no lugar do resto do app, não tem como perceber que o `index.html` real declara `qFilters` de um jeito que diverge do que o patch espera.
**Correção sugerida:**
- Mínima: um teste Playwright que sirva a pasta do projeto (por exemplo com `python -m http.server`) e faça `page.goto()` no `index.html` real, cobrindo pelo menos: login, abertura de uma unidade, confirmação de que a fila de prática contém só questões daquela disciplina, troca para uma segunda conta, confirmação de que não sobrou estado da primeira.
- Estrutural: adotar esse teste como porta de saída obrigatória antes de qualquer publicação, e priorizá-lo sobre a criação de novos testes fragmentados, que continuam úteis para lógica isolada mas não substituem esta cobertura.
**Status:** `ABERTO`.

### COD-03 (ALTO): Falha ao salvar progresso é invisível para o aluno
**Categoria:** resiliência e transparência de erro
**Evidência:** em `index.html`, `saveProgress` captura qualquer erro de rede e faz apenas `console.warn('Falha ao salvar progresso', e)`, marcando o progresso como pendente para nova tentativa a cada 12 segundos (`startSaveLoop`). A função `persistNow` (em `v17-patch.js`) chama `saveProgress` e ainda encadeia `.catch(()=>{})` por cima, suprimindo o erro uma segunda vez. No total, o código tem 60 blocos `catch` vazios; a maioria protege efeitos colaterais de baixo risco (tema, presença online, publicação de ranking), mas o caminho de salvar o progresso do aluno está entre eles, sem nenhum aviso visual em nenhum dos casos.
**Cenário humano:** um aluno responde uma sequência de questões com conexão instável (metrô, sinal fraco de 4G, wifi de fórum). O app tenta salvar, falha, tenta de novo silenciosamente. Se o aluno fechar a aba antes de uma tentativa bem-sucedida, ele descobre o problema só depois, ao notar que o progresso não bateu, sem nenhuma mensagem que explique o que aconteceu ou o que fazer.
**Correção sugerida:**
- Mínima: depois de um número definido de tentativas seguidas sem sucesso (por exemplo três), mostrar um indicador discreto ("não foi possível salvar, tentando novamente") e um aviso de confirmação ao tentar fechar a aba enquanto houver progresso pendente sem salvar.
- Estrutural: um indicador de status de sincronização sempre visível durante o estudo (algo como "salvo agora" / "salvando…" / "falha ao salvar"), no mesmo espírito de ferramentas como Google Docs, para que a confiança no salvamento seja visível, não presumida.
**Status:** `ABERTO`.

### COD-04 (ALTO): Carregamento inicial pesado e cache incompleto
**Categoria:** carregamento e desempenho
**Evidência:** `index.html` tem 4.784.259 bytes (~4,7 MB) em apenas 1.834 linhas, porque blocos inteiros de lógica ficam em linhas únicas (a linha 374 sozinha soma cerca de 4,2 milhões de caracteres). A página carrega 29 arquivos via `<script src>`, todos de forma síncrona e bloqueante (nenhum usa `defer` ou `async`), incluindo `data/integral-material.js` (5,7 MB) e `data/v16-question-map.js` (696 KB). Cache-busting (`?v=`) foi aplicado a apenas 7 dos 29 arquivos, todos das versões mais recentes (35.5 a 35.7); os outros 22, incluindo os dois maiores citados acima, não têm nenhum parâmetro de versão. Não encontrei service worker nem cabeçalho `Cache-Control` customizado no código; o cache depende inteiramente do servidor de hospedagem (o `.nojekyll` sugere GitHub Pages).
**Cenário humano:** um aluno no intervalo entre aulas, no celular, com conexão instável, abre o app para revisar uma questão rapidamente. O navegador precisa buscar e processar, em sequência, quase trinta arquivos, incluindo um de quase 6 MB, antes da tela ficar utilizável. Se uma correção futura for publicada em um dos 22 arquivos sem parâmetro de versão, parte dos alunos pode continuar recebendo a versão antiga em cache por dias, sem forma de perceber que estão estudando com uma versão desatualizada.
**Correção sugerida:**
- Mínima: terminar de aplicar `?v=` a todo arquivo em `data/` sempre que ele for alterado, não só aos mais recentes; adicionar `defer` a todas as tags `<script>` (nada no fluxo de inicialização parece depender de execução síncrona durante o parse).
- Estrutural: separar o material de estudo pesado (que muda pouco) da lógica de aplicação (que muda a cada patch) e carregar o material sob demanda, por disciplina ou unidade, em vez de tudo no primeiro carregamento.
**Status:** `ABERTO`.

### COD-05 (MÉDIO): Regras do Firebase sem validação de formato, e-mail de bootstrap exposto
**Categoria:** segurança e isolamento de dados
**Evidência:** `database.rules.json` (25 linhas, lido por inteiro) nega leitura/escrita por padrão na raiz e define regras corretas de dono/papel, mas não contém nenhuma cláusula `.validate` limitando tipo, tamanho ou formato de campos como `username`, `name`, ou os valores gravados em `leaderboard`. A segurança contra HTML malicioso nesses campos depende inteiramente de todo ponto atual e futuro do código lembrar de aplicar `esc()` antes de inserir o valor em `innerHTML`, sem nenhuma barreira automática no banco ou em teste que impeça um valor malformado de ser gravado. Além disso, a regra de criação de perfil contém um e-mail fixo (`auth.token.email === 'manasses@oabfocus.app'`) como único autorizado a se autopromover a administrador na primeira gravação; como o arquivo de regras costuma ser publicado junto do repositório, esse e-mail fica identificável por qualquer pessoa que veja o projeto no GitHub.
**Por que não é CRÍTICO:** verifiquei os dois pontos de renderização mais expostos (lista de usuários no admin e ranking público) e ambos aplicam `esc()` corretamente hoje. O risco aqui é de manutenção futura, não uma falha ativa confirmada.
**Cenário humano:** um aluno que abra o DevTools do navegador consegue hoje gravar qualquer texto, de qualquer tamanho, no próprio username, sem checagem do lado do banco. Se um patch futuro (v36, v37…) inserir esse campo em `innerHTML` em um novo lugar sem lembrar de aplicar `esc()`, o efeito aparece para quem visualizar aquele campo, não para quem o escreveu. Quanto ao e-mail fixo, ele não é, por si, uma senha; mas torna mais fácil para alguém mal-intencionado saber exatamente qual conta tentar comprometer para virar administrador da plataforma.
**Correção sugerida:**
- Mínima: adicionar `.validate` em `username` e `name` (tipo string, comprimento máximo, e opcionalmente um conjunto de caracteres permitido).
- Estrutural: um teste automatizado (pode reaproveitar o padrão dos testes Python já existentes) que falhe se qualquer trecho novo inserir um valor vindo de `progress`, `leaderboard` ou `profile` em `innerHTML` sem `esc(` na mesma linha ou nas linhas imediatamente anteriores. Sobre o e-mail de bootstrap, considerar documentar claramente que a proteção real está na senha daquela conta Google/Firebase, não no sigilo do endereço.
**Status:** `NÃO VERIFICADO` quanto a exploração ativa fora dos dois pontos checados; `ABERTO` quanto à ausência de `.validate`.

### COD-06 (MÉDIO): Utilitários duplicados e linhas inviáveis para revisão
**Categoria:** manutenibilidade
**Evidência:** a função de escape aparece redefinida de forma quase idêntica em pelo menos três arquivos diferentes (`escAttr` em `v16-patch.js`, `esc18` em `v18-patch.js`, `esc34` em `v34-patch.js`), todas fazendo o mesmo escape de `&<>'"`. O padrão do projeto, de v12 a v35, é sempre somar um novo `data/vNN-patch.js` em vez de revisar um arquivo existente, chegando a mais de trinta arquivos de patch. `index.html` tem linhas de até ~4,2 milhões de caracteres, o que torna o diff do GitHub Desktop (citado no próprio README como ferramenta de publicação) inútil para revisão: ele mostra "a linha inteira mudou" em vez do trecho real alterado.
**Cenário humano:** se for preciso corrigir a lógica de escape amanhã, por exemplo porque um caractere novo passa a ser perigoso, existe risco real de corrigir uma cópia e esquecer as outras duas. E ao revisar um commit no GitHub Desktop antes de aceitar, não há como enxergar visualmente o que de fato mudou dentro de uma linha de milhões de caracteres.
**Correção sugerida:**
- Mínima: nenhuma ação urgente; é dívida técnica, não falha ativa.
- Estrutural: quando houver tempo, consolidar as funções de escape numa só, carregada primeiro e reutilizada por todos os patches; quebrar (sem reescrever a lógica) os blocos de `index.html` que hoje ficam em uma única linha, para permitir diffs legíveis. Ao pedir um novo patch a uma IA, incluir instrução explícita para reaproveitar utilitários já existentes em vez de recriá-los.
**Status:** `ABERTO`, baixa urgência.

### COD-07 (MÉDIO): Conteúdo revisado e legado não são distinguíveis para o aluno
**Categoria:** transparência de confiança pedagógica
**Evidência:** `AUDITORIA_QUESTOES_v35_7.md` documenta, com uma transparência que vale reconhecer, que a auditoria de v35.7 verificou integridade estrutural das 2.336 questões do banco estático, não revisão jurídica individual de cada uma, e que comentários legados no padrão antigo ("Gabarito + regra-chave + referências-base") foram mantidos porque reescrevê-los exigiria conferir, questão a questão, legislação e jurisprudência vigentes. Nos pontos de renderização de questão e comentário que verifiquei em `index.html`, não encontrei nenhuma etiqueta visível que informe ao aluno se aquele comentário específico é da geração v35.7 (fundamento confirmado, análise A/B/C/D) ou um comentário legado genérico.
**Cenário humano:** um aluno que erra uma questão confia no comentário para entender o erro e não repeti-lo na prova. Se o comentário for legado e genérico, ele pode sair da questão com uma sensação de domínio que não corresponde à qualidade da explicação recebida, sem saber que deveria desconfiar mais daquele comentário específico e conferir a fonte primária por conta própria.
**Correção sugerida:**
- Mínima: uma etiqueta discreta no comentário, por exemplo "comentário revisado (v35.7)" versus "comentário legado, em fila de revisão", usando o mesmo critério que o `PROMPT_MESTRE_QUALIDADE_QUESTOES_v35_7.md` já define.
- Estrutural: usar esse mesmo prompt mestre para priorizar a fila de revisão dos comentários legados mais acessados pelos alunos, em vez de tentar revisar as 2.336 questões de uma vez.
**Status:** `ABERTO`.

## Outras observações menores

- Acessibilidade básica está em ordem no que verifiquei: as 5 tags `<img>` da página têm `alt`, e há 59 atributos `aria-*` distribuídos entre 210 botões. Não é prioridade agora, mas vale revisar pontualmente os botões só com ícone, sem texto nem `aria-label`, quando houver tempo.
- O pacote enviado não inclui uma pasta `.git`, então não revisei histórico de commits; o `ATUALIZAR_GITHUB.cmd` sugere que o histórico real vive fora deste pacote específico, o que é normal para um ZIP de distribuição.
- A chave `apiKey` do Firebase aparece em texto claro em `index.html`. Isso não é, por si só, uma falha: é assim que toda aplicação web com Firebase funciona, a chave identifica o projeto, mas não concede acesso sozinha. A segurança de verdade está inteiramente em `database.rules.json` (achado COD-05), que é onde a atenção deve continuar.

## Tabela-resumo

| ID | Gravidade | Categoria | Status |
|---|---|---|---|
| COD-01 | CRÍTICO | Estado global entre patches | Sintoma corrigido; padrão aberto |
| COD-02 | CRÍTICO | Cobertura real de testes | Aberto |
| COD-03 | ALTO | Transparência de erro ao salvar | Aberto |
| COD-04 | ALTO | Carregamento e cache | Aberto |
| COD-05 | MÉDIO | Validação de dados no Firebase | Aberto |
| COD-06 | MÉDIO | Duplicação e manutenibilidade | Aberto, baixa urgência |
| COD-07 | MÉDIO | Transparência pedagógica | Aberto |

## Prioridade recomendada de execução

1. Aplicar `?v=` aos 22 arquivos que ainda não têm, e `defer` em todas as tags `<script>`. Baixo esforço, retorno imediato em confiabilidade e velocidade (COD-04).
2. Adicionar um indicador visível de falha ao salvar progresso, mesmo que simples (COD-03).
3. Escrever um teste Playwright fim a fim contra o `index.html` real (login, prática filtrada por disciplina, troca de conta). Vale mais do que somar novos testes fragmentados (COD-02).
4. Adicionar `.validate` básico para `username` e `name` nas regras do Firebase (COD-05).
5. Etiquetar comentários "revisado v35.7" versus "legado", reaproveitando o Prompt Mestre de Qualidade de Questões que você já usa (COD-07).
6. Quando houver tempo, consolidar as funções de escape duplicadas e considerar separar o material pesado do carregamento inicial (COD-01, COD-06).
