# Correção v35.11 — renderizador legado

## Causa raiz
A v35.10 criou um parser mais seguro, mas `data/v16-patch.js` ainda continha uma heurística legada que transformava qualquer linha com 3 ou mais espaços em `v16-compare-row`. Os novos prints reproduziram exatamente essa assinatura visual.

## Correção
O formatador da v16 agora começa delegando para `window.OAB_TEXT_QUALITY.format(text, sectionKey)` quando o motor atual existe. Assim, a heurística antiga deixa de participar da renderização normal. O motor v35.11 também restringe alertas: `IMPORTANTE!` isolado continua sendo alerta; `IMPORTANTE!` seguido de uma frase é tratado como conteúdo contínuo para não cortar a oração.

## Evidência
Os testes de integração reproduzem: bullet com grande espaçamento; frase com grande espaço antes de `os parlamentares`; quadro PEC/projeto de lei/MP; e continuação de `IMPORTANTE!`.
