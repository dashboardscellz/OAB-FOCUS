# PROMPT MESTRE — AUDITORIA E CORREÇÃO MOBILE OAB FOCUS v35.16

## Papel
Atue como engenheiro de front-end mobile, designer de produto educacional e auditor de qualidade. Trate o OAB Focus no celular como um aplicativo de estudo próprio, e nunca como uma página desktop apenas reduzida.

## Objetivo
Garantir que cada tela do OAB Focus seja confortável, legível, rápida e previsível em iPhone, Android e tablet, preservando as funções jurídicas existentes e a independência entre Estudar, Prepare-se e Banco de Questões.

## Princípios obrigatórios
1. **Uma rota, uma tela.** Conteúdo de login, Home, Estudar, Prepare-se, Questões, Leitor e Mais não pode coexistir visualmente por falha de CSS, z-index ou estado.
2. **Nada pode escapar da viewport.** É proibido overflow horizontal global. Elementos internos que legitimamente precisam de rolagem horizontal, como tabelas jurídicas, devem conter a própria rolagem.
3. **Safe-area real.** Cabeçalho e navegação inferior devem respeitar `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)`.
4. **Alvo de toque profissional.** Controles primários e ícones interativos devem ter área mínima de 44×44 CSS px.
5. **Leitura primeiro.** Texto jurídico principal e enunciados de questões usam no mínimo 16 px em mobile, com line-height confortável e sem palavras/frases cortadas.
6. **Navegação inferior não cobre conteúdo.** O conteúdo recebe espaço inferior suficiente e componentes flutuantes precisam ficar acima da bottom bar.
7. **Componentes flutuantes não competem.** Grifos, status de salvamento, filtros e modais não podem ocupar a mesma faixa visual ao mesmo tempo.
8. **`Salvo` não é obstáculo.** Em mobile, o estado salvo aparece como confirmação transitória; estados `Salvando` e `Falha ao salvar` continuam visíveis enquanto relevantes.
9. **Filtros são mobile-first.** O Banco de Questões mantém busca rápida e filtros em bottom sheet; o teclado virtual não pode esconder a ação principal.
10. **Prepare-se e Questões continuam independentes.** Nenhuma melhoria visual pode reintroduzir o contexto do Prepare-se no banco livre.
11. **Paisagem de celular continua mobile.** Um telefone em 844×390 ou equivalente não pode cair no layout desktop só porque a largura ultrapassou 768 px.
12. **Desktop preservado.** Regras da camada mobile não podem alterar o layout acima dos limites móveis definidos.

## Regra crítica para projeto com patches legados
O projeto contém estilos injetados em tempo de execução por patches antigos. Portanto, não basta criar um CSS correto no `<head>` se um patch posterior puder sobrescrevê-lo com `!important`.

Antes de declarar um bug corrigido:
- procure regras dinâmicas concorrentes em `v15-patch.js` a `v34-patch.js`;
- compare especificidade e ordem real de carregamento;
- para invariantes críticos de mobile, use seletor mais específico ou uma pequena camada CSS injetada pelo último adaptador mobile;
- teste explicitamente um cenário em que uma regra legada é injetada depois do CSS principal.

## Matriz mínima de viewport
Validar, no mínimo:
- 320×568 — aparelho estreito;
- 360×640 — Android compacto;
- 375×667 — iPhone compacto;
- 375×812 — iPhone X/11/12 mini-like;
- 390×844 — iPhone moderno;
- 412×915 — Android moderno;
- 430×932 — smartphone grande;
- 768×1024 — tablet portrait;
- 844×390 — smartphone landscape.

## Checklist por tela
### Login
- login oculto após autenticação;
- campos e botão não ficam atrás do teclado;
- formulário não exige zoom;
- inputs usam 16 px ou mais.

### Início
- saudação e nível cabem integralmente;
- nenhuma pill invade a borda direita;
- cards de ação não cortam texto;
- resumo `Hoje` não trunca percentual/legendas;
- status de salvamento não cobre métricas;
- conteúdo final pode ser rolado acima da bottom bar.

### Estudar
- uma disciplina por linha no telefone;
- busca sticky respeita header/safe-area;
- cards não possuem largura herdada do desktop;
- capítulos e CTAs têm alvos de toque adequados.

### Prepare-se
- uma coluna no telefone;
- etapas, pré-requisitos e botões não se comprimem horizontalmente;
- textos longos quebram naturalmente;
- botões de continuar/questões permanecem acessíveis.

### Questões
- enunciado e alternativas com 16 px aproximados;
- alternativas não cortam texto;
- busca livre e filtros independentes do Prepare-se;
- bottom sheet possui role de diálogo, fecha por botão/backdrop e respeita teclado;
- comentário e legislação permanecem legíveis após responder.

### Leitor
- artigo usa 100% da largura útil, sem desktop sheet;
- texto principal >= 16 px;
- tabelas podem rolar internamente sem criar overflow global;
- dock de grifos fica acima da navegação inferior;
- `Salvo` fica acima do dock ou some após confirmação;
- nenhum patch legado pode reposicionar o dock para `bottom:10px` em mobile.

### Mais / Perfil / Admin
- drawer/modal cabe na altura dinâmica;
- botão de fechar >= 44 px;
- conteúdo rolável;
- logout não fica sob a safe-area.

## Critérios de aceitação automatizáveis
- `document.documentElement.scrollWidth <= innerWidth + 1` em todos os viewports.
- Bottom nav totalmente contida na viewport.
- Pill de nível, Home header, resumo `Hoje`, question panel e reader article dentro da viewport.
- Touch targets primários >=44×44 px.
- `question-text` e texto jurídico principal >=1rem.
- Dock de grifos: `dock.bottom <= nav.top - 6px`.
- Estado `saved` torna-se visualmente inerte após confirmação breve.
- Estado `saving`/`retrying` não é ocultado automaticamente.
- Phone landscape é reconhecido como mobile.
- Regra dinâmica legada simulada não consegue vencer a camada crítica v35.16.

## O que não fazer
- Não usar `overflow-x:hidden` como único “conserto” para elementos maiores que a viewport; corrija a causa.
- Não empilhar novos `!important` sem investigar quem está vencendo a cascata.
- Não esconder funções para “fazer caber”. Reorganize a hierarquia.
- Não reduzir texto principal abaixo de 16 px para ganhar espaço.
- Não copiar visual/branding de outro aplicativo. Referências externas servem para arquitetura de uso.
- Não chamar a versão de final sem testar o ZIP extraído novamente.

## Saída esperada de cada auditoria futura
1. evidência visual;
2. causa no código;
3. prioridade P0/P1/P2;
4. correção aplicada;
5. teste de regressão correspondente;
6. verificação em múltiplos viewports;
7. resultado do pacote ZIP extraído.
