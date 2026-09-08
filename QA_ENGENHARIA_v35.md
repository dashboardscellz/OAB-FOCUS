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
A release v35 auditada possui **148 testes automatizados** distribuídos entre arquitetura do leitor/trilha, auditoria de layout, importação da 47ª OAB, auditoria pesada v34, isolamento de contas e shell responsivo v35. As suítes Playwright são executadas separadamente para evitar interferência entre instâncias do Chromium no ambiente de QA.


## Auditoria visual corretiva — 08/09/2026
A auditoria das capturas pós-v35 identificou regressões sistêmicas no shell e adicionou cobertura específica para elas:
- rail duplicada não é mais ativada em `study`/`reader`;
- nenhum `padding-left:248px` é usado para compensar navegação fixa;
- o botão `Mais` usa o mesmo chrome dos itens primários;
- cabeçalhos operacionais do leitor são normalizados para Inter;
- a ação da tela de questões é rotulada `Simulado completo`;
- o contexto administrativo é sticky/in-flow e permanece centralizado dentro do shell.

O relatório detalhado está em `AUDITORIA_VISUAL_v35_2026-09-08.md`.
