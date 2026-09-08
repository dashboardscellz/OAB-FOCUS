# OAB Focus v35.6 — Correção Trilha → Questões

## Sintoma reproduzido
Ao abrir a prática de uma unidade de Constitucional, o banco podia permanecer sem o filtro contextual real e exibir o banco completo (por exemplo 1/5048), fazendo uma questão de Ética aparecer durante o estudo de Constitucional.

## Causa raiz
`index.html` declara `qFilters` com `let`, criando um binding léxico global. A v27 escrevia o novo contexto em `window.qFilters`, que é uma propriedade diferente. Assim, a trilha alterava um objeto que `buildQueue()` não lia.

## Correção
- `openVerifiedQuestions()` passa a escrever no `qFilters` real;
- o contexto passa a carregar `discipline: fresh.discipline` explicitamente;
- IDs de questões são validados novamente contra a disciplina real da questão antes de compor a fila;
- o requisito mínimo usa somente os IDs efetivamente válidos;
- `v27-patch.js` recebeu cache-busting `?v=35.6` no `index.html`.

## Garantia
Uma prática contextual de uma unidade de Constitucional não pode reutilizar fila antiga de Ética nem abrir o banco completo por falha de contexto. Se a unidade não tiver questão específica válida, o sistema informa isso e não mistura outra disciplina.
