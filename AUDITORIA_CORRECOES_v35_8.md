# OAB Focus v35.8 — correções da auditoria técnica humana

- COD-01: criado `window.OAB_STATE`; filas contextuais usam um único serviço e validam disciplina/IDs/gabarito.
- COD-02: teste de integração da aplicação completa com todos os scripts reais na ordem de produção.
- COD-03: indicador de sincronização e proteção quando há progresso pendente após falhas.
- COD-04: cache-busting `?v=35.8` em todos os scripts locais. `defer` dos dados iniciais ficou fora porque o script principal consome esses objetos de forma síncrona.
- COD-05: `.validate` em `name`, `username`, `role`, `active` e `approvalStatus`.
- COD-07: selo de confiança do comentário; legado não é promovido a revisado.
- COD-06: não houve reescrita total dos patches nesta release por risco de regressão; o novo estado explícito impede novas divergências no contexto de questões.

## Verificação final

- 211 testes aprovados nas 16 suítes do pacote (82 + 11 + 52 + 66).
- 30/30 scripts locais de `data/` com `?v=35.8`.
- Sintaxe dos JS alterados verificada com `node --check`; regras Firebase parseadas como JSON válido.
- Integração integral: `index.html` completo + scripts reais na ordem de produção. A política do ambiente impede `page.goto()` local, portanto esta release não afirma teste de rede/hospedagem real.
