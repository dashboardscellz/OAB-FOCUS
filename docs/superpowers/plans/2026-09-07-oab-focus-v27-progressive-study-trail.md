# Plano de implementação — OAB Focus v27

1. Criar testes de contrato para progressão antes do patch.
2. Criar `data/v27-patch.js` como camada final sobre v26.
3. Expor funções de QA em `window.OAB_V27`.
4. Montar unidades a partir de `disciplineChapters` sem alterar material jurídico.
5. Calcular conclusão a partir de `progress.learningPath.completed`, com compatibilidade para fragmentos v18.
6. Usar apenas `OAB_V16_QUESTION_MAP.strict` + `subtopicStrict` como requisito de progressão.
7. Implementar amostra mínima `min(3, questões validadas)`.
8. Transformar a página da disciplina em trilha guiada e manter consulta livre separada.
9. Transformar a view interna `index` da v26 em Trilha sem mudar sua arquitetura de tela única.
10. Adicionar orientação pedagógica à view `Seu estudo`.
11. Controlar “Próxima unidade” no leitor e permitir travessia entre capítulos.
12. Preservar prática contextual e retorno ao ponto exato do material.
13. Validar mobile e zero overflow.
14. Executar sintaxe, pytest, smoke test completo com Chromium e checagens de preservação.
15. Atualizar `ATUALIZAR_GITHUB.cmd`, QA e empacotar v27.
