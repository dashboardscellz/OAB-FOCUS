# QA de Engenharia — OAB Focus v36.2

## Resultado final

- Testes estáticos/regressão: 134 aprovados.
- Leitor v26: 18 aprovados.
- Trilha v27: 22 aprovados.
- Layout v28: 16 aprovados.
- Auditoria v29: 14 aprovados.
- Login v32: 12 aprovados.
- Login/altura v33: 13 aprovados.
- E2E real v35.8: 2 aprovados.
- Isolamento de conta no navegador: 3 aprovados.
- Layout navegador v35: 17 aprovados.
- Browser v36.1: 5 aprovados.
- Browser v36.2: 6 aprovados.
- Layout global v36.2: 8 aprovados.

**Total consolidado: 270 testes aprovados, 0 falhas.**

## Verificações adicionais

- `node --check` aprovado para `data/v16-patch.js`, `data/v21-patch.js` e `data/v34-patch.js`.
- Varredura pública sem ocorrências de: “O que faz sentido aqui:”, “O que não faz sentido aqui:”, “Revisão estrutural pendente”, “DIREÇÃO V36”, “Plano otimizado.” e “Área otimizada.”.
- Tabelas v36.2 testadas em 1366, 768, 430, 390 e 360 px.
- Fallback de layout preservado testado com fonte monoespaçada, sem banner de manutenção.
- Estado único dos filtros testado no app real carregado em Chromium.

## Observação de compatibilidade

Um teste legado da v36.1 ainda exigia literalmente o banner “Revisão estrutural pendente”. Ele foi atualizado porque esse comportamento foi explicitamente removido na v36.2; o teste agora exige preservação neutra do layout e ausência do banner, em conformidade com a nova especificação aprovada.
