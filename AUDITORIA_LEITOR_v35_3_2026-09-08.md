# OAB Focus v35.3 — limpeza de elementos redundantes do leitor

## Pedido aplicado
Os blocos exibidos nas capturas como “Questões relacionadas”/prévia de prática e “FIM DESTA UNIDADE” foram considerados desnecessários no modo de leitura.

## Alterações
- removida a seção `#zoneQuestions`;
- removida a prévia `.v20-practice-shell`;
- removido o encerramento legado `.v16-reader-end`;
- removido o rodapé legado `.v18-reader-footer`;
- removido o botão de salto para `questions` da toolbar, pois o destino foi retirado;
- mantida a progressão guiada v27, que é funcionalmente distinta e necessária ao fluxo progressivo quando esse modo é usado;
- cache-bust atualizado para `?v=35.3`.

## Estratégia técnica
A limpeza fica concentrada em `data/v35-shell.js`, sem reescrever patches históricos. Há uma regra CSS defensiva em `data/v35-shell.css` para impedir reaparecimento tardio durante os encadeamentos de renderização legados.
