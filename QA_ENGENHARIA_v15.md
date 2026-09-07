# QA — OAB Focus SUPER v15

## Escopo validado

- base: v14.3;
- mapas mentais permanecem removidos;
- sidebar com rolagem preservada;
- 2.336 questões auditadas preservadas;
- `integral-material.js` e `highyield-static.js` novamente incluídos no pacote;
- `v15-study-map.js`: vínculo dos temas estatísticos ao material;
- `v15-patch.js`: correções de grifo, questões, Mais cobrados e Prepare-se.

## Critérios funcionais

1. A seleção de texto não é apagada apenas porque o usuário tocou na paleta de cor.
2. Há paleta flutuante para grifar sem retornar ao topo.
3. O leitor monta um conjunto explícito de IDs de questões para o conteúdo aberto.
4. O caderno de questões mantém esse conjunto até o usuário alterar manualmente os filtros ou escolher “Ver banco completo”.
5. Mais cobrados não oferece “Estudar” para tema sem destino confiável no acervo atual.
6. Prepare-se usa somente temas com destino real e mantém o tema estatístico como vínculo para as questões.
7. Quando falta teoria separada, a interface identifica a leitura como “conteúdo-base”, em vez de chamar lei seca de material explicado.
8. O ZIP contém todos os arquivos externos referenciados pelo `index.html`.

## Validações técnicas

- sintaxe dos scripts inline: OK;
- sintaxe de `integral-material.js`: OK;
- sintaxe de `highyield-static.js`: OK;
- sintaxe de `v15-study-map.js`: OK;
- sintaxe de `v15-patch.js`: OK;
- mapeamento de alta recorrência: 59/70 temas com capítulo confiável no acervo; 11 omitidos da lista de estudo para evitar destino falso.
