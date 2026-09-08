# OAB Focus v35.5 — Plano de Taxonomia Pedagógica Global

**Goal:** reduzir microfragmentação em todas as disciplinas sem perder conteúdo, questões ou progresso.

**Architecture:** adicionar `data/v35-taxonomy.js` como camada pós-v35.4 que reinterpreta `disciplineChapters()` e os recortes do leitor, usando macrounidades com ranges literais; integrar v18/v27 para labels, questões strict e compatibilidade de conclusão.

## Tarefas

- [ ] 1. Testes RED para parser de headings, agrupamento e Poder Constituinte.
- [ ] 2. Implementar engine puro de taxonomia e estratégias `whole/top/cluster/custom`.
- [ ] 3. Integrar `disciplineChapters()` e `isolateSubtopicSections()` sem alterar `integral-material.js`.
- [ ] 4. Agregar questões strict das antigas micro-unidades às novas macrounidades.
- [ ] 5. Tornar v18/v27 compatíveis com labels e progresso legado v35.5.
- [ ] 6. Auditar todas as disciplinas e gerar métricas antes/depois.
- [ ] 7. Rodar regressão completa, sintaxe e integridade do ZIP.
