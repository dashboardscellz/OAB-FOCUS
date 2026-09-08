# QA de Engenharia — OAB Focus v35

## Escopo
- Shell profissional com navegação superior horizontal e sidebar apenas contextual.
- Isolamento de contas por UID, username canônico e email técnico SHA-256.
- Compatibilidade com contas legadas validada por `profile.username`.
- Mobile com barra superior compacta e cinco destinos inferiores.

## Matriz responsiva prevista
- 1366x768 — desktop compacto
- 1440x900 — desktop padrão
- 1920x1080 — desktop amplo
- 768x1024 — tablet
- 430x932 — celular grande
- 390x844 — celular padrão
- 360x800 — celular estreito

## Regressões de conta cobertas
1. Login v35 tenta identidade hash antes do fallback legado.
2. Fallback legado só é aceito quando o username digitado corresponde ao `profile.username` normalizado.
3. Registro próprio não chama `keepSession()` e grava perfil usando o token da conta recém-criada.
4. Criação administrativa preserva a sessão do administrador e grava o perfil com token administrativo.
5. `progressOwnerUid` deve ser igual ao UID autenticado antes de qualquer PUT de progresso.
6. Troca/logout limpa questão, fila, resposta selecionada, leitor, timers e streams da conta anterior.
7. Restauração de sessão valida UID + profile + username antes de carregar progresso.

## Critério de aprovação
Nenhuma gravação de progresso pode usar um UID diferente de `progressOwnerUid`, e nenhum viewport da matriz pode apresentar overflow horizontal na aplicação autenticada.

## Evidência de navegador real (Chromium headless)
Foi renderizado o shell autenticado v35 com o CSS real da aplicação e os componentes reais do novo cabeçalho/nav. Medições de `scrollWidth / innerWidth`:

| Viewport | Medição | Resultado |
|---|---:|---|
| 1366x768 | 1366 / 1366 | PASS |
| 1440x900 | 1440 / 1440 | PASS |
| 1920x1080 | 1920 / 1920 | PASS |
| 768x1024 | 768 / 768 | PASS |
| 430x932 | 430 / 430 | PASS |
| 390x844 | 390 / 390 | PASS |
| 360x800 | 360 / 360 | PASS |

Nos viewports até 768 px, a barra superior compacta e a navegação inferior permaneceram dentro do viewport. O teste automatizado está em `tests/v35_layout_browser.py`.

## Evidência de identidade em navegador
`tests/v35_account_browser.py` executa as funções v35 em Chromium e confirma que:
- `manasses.lucas` e `manasses-lucas` geram identidades técnicas SHA-256 diferentes;
- `Manassés` e `manasses` normalizam para a mesma chave canônica;
- o reset de runtime zera questão atual, fila, resposta selecionada e proprietário do progresso.

A implementação também contém fallback SHA-256 em JavaScript para ambientes locais sem `crypto.subtle`, mantendo o mesmo formato de identidade técnica.

## Suíte de regressão
A release v35.3 auditada possui **162 testes automatizados** distribuídos entre arquitetura do leitor/trilha, auditoria de layout, importação da 47ª OAB, auditoria pesada v34, isolamento de contas e shell responsivo v35. As suítes Playwright são executadas separadamente para evitar interferência entre instâncias do Chromium no ambiente de QA.


## Auditoria visual corretiva — 08/09/2026
A auditoria das capturas pós-v35 identificou regressões sistêmicas no shell e adicionou cobertura específica para elas:
- rail duplicada não é mais ativada em `study`/`reader`;
- nenhum `padding-left:248px` é usado para compensar navegação fixa;
- o botão `Mais` usa o mesmo chrome dos itens primários;
- cabeçalhos operacionais do leitor são normalizados para Inter;
- a ação da tela de questões é rotulada `Simulado completo`;
- o contexto administrativo é sticky/in-flow e permanece centralizado dentro do shell.

O relatório detalhado está em `AUDITORIA_VISUAL_v35_2026-09-08.md`.

## v35.1 — segunda auditoria visual (2026-09-08)

Correções de regressão visual observadas em produção:
- limpeza de `v34-active-state` acumulado na navegação v35;
- neutralização defensiva do estado verde legado no cabeçalho;
- reset de sombra/raio herdados no dashboard hero;
- compactação do painel de nível e ações do hero;
- cache bust dos assets `v35-shell.css`, `v35-auth.js` e `v35-shell.js` com `?v=35.1`.

Testes novos cobrem estado ativo acumulado, herança visual do hero, hierarquia dos CTAs e versionamento dos assets.


## v35.2 — redesenho do leitor (2026-09-08)

- Leitor reorganizado em uma única superfície central de estudo.
- Estrutura visual de até 1000 px, com medida textual principal de 760 px.
- Temporizadores de sessão/unidade/hoje/total integrados ao cabeçalho da leitura.
- Material explicado deixa de usar aparência de card dentro de card.
- Barra de grifo centralizada e com espaço inferior reservado para não cobrir o texto.
- Toolbar do leitor refinada e alinhada à largura do artigo.
- Mobile mantém coluna única, timers em 2x2 e highlighter acima da navegação inferior.
- Assets v35 versionados com `?v=35.2` para evitar cache antigo no GitHub Pages.


## v35.3 — limpeza do leitor (2026-09-08)

A pedido do usuário, a leitura passou a priorizar somente o material e controles essenciais. Foram removidos do DOM do leitor:
- `#zoneQuestions` (seção "Questões relacionadas");
- `.v20-practice-shell` (cards de prévia de questões);
- `.v16-reader-end` (bloco "FIM DESTA UNIDADE" e navegação legada);
- `.v18-reader-footer` (rodapé legado de conclusão/prática);
- `[data-reader-jump="questions"]` (atalho que ficaria sem destino).

A remoção é aplicada pelo adaptador v35 e também protegida por CSS para impedir flash/reinserção tardia por patches legados. A progressão guiada da v27 não foi removida. Assets versionados com `?v=35.3`.

Validação: 162 testes automatizados, distribuídos em 67 (v26–v29), 47 (v30–v34) e 48 (v35).


## v35.4 — acabamento visual e navegação contextual (2026-09-08)

- Login recebe override final após v32/v33 para aumentar a presença do retrato em desktop baixo sem criar overflow.
- Formulário de login passa a ter largura/gutters defensivos contra corte lateral.
- A tela de Questões recebe controle sticky `← Voltar`, com captura da rota de origem.
- Foram adicionados testes de fonte e Playwright para presença do retrato, ausência de overflow e retorno contextual.
- Assets v35 versionados com `?v=35.4`.

Validação v35.4: **169 testes passaram** quando as 12 suítes foram executadas separadamente; 55 deles pertencem às suítes específicas v35 (account browser, isolamento, layout browser e shell).


## v35.5 — taxonomia pedagógica global (2026-09-08)

- Nova camada `data/v35-taxonomy.js` carregada após o shell v35.
- Regra global: subtítulo textual não equivale automaticamente a unidade de estudo.
- Microtópicos dependentes são agrupados; institutos autônomos permanecem separados.
- Questões e progresso usam `sourceSubtopics` para preservar vínculo com os microtópicos legados.
- Poder Constituinte: conceito + originário + derivado/modalidades + limites em uma unidade coerente.
- Materiais aprofundados de Improbidade Administrativa, Licitações/Contratos e Ética/OAB usam limites semânticos próprios, ignorando sumário, notas, citações e fragmentos de PDF.
- Nenhuma unidade pedagógica pode receber rótulo genérico `parte X/Y` nos materiais teóricos/complementares auditados.
- Assets v35 versionados com `?v=35.5`.
- Validação v35.5: **187 testes automatizados** aprovados nas 13 suítes v26–v35, incluindo 18 testes específicos da taxonomia global.
