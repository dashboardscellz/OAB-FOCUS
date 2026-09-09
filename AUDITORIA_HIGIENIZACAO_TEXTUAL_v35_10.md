# OAB Focus v35.10 — Auditoria de Higienização Textual

## Diagnóstico
Os problemas visuais relatados não eram apenas CSS. A origem estava na interpretação do texto extraído de PDFs. O formatador anterior tratava alguns elementos físicos como semânticos:

- bullet iniciada por `-`, `→`, `•` etc. era encerrada na própria linha física, mesmo quando a frase continuava na linha seguinte;
- `Art.`, `§`, `Súmula` e equivalentes também eram renderizados apenas até o fim da linha física;
- qualquer linha com três ou mais espaços podia virar `v16-compare-row`, criando tabelas falsas a partir de alinhamento residual do PDF;
- linha vazia sempre encerrava o parágrafo, mesmo quando a sentença estava sintaticamente incompleta.

## Sinais encontrados no acervo bruto
A varredura heurística do material integral encontrou:

- 10.080 ocorrências de início de bloco legal com continuação física na linha seguinte;
- 1.641 bullets seguidas por linha de continuação;
- 3.493 linhas com grandes sequências de espaços, muitas delas provenientes de tabelas/colunas de PDF;
- 893 candidatos a quebra vazia no meio de sentença;
- 541 linhas muito curtas entre trechos de prosa.

Esses números são **sinais brutos**, não equivalem um a um a erros jurídicos. Eles demonstram que o defeito é sistêmico e que a solução precisa atuar no renderizador global.

## Correção v35.10
Foi criada `data/v35-text-quality.js`, carregada por último, que substitui a formatação do material por uma reconstrução semântica:

1. agrega continuação de bullets;
2. agrega continuação de artigos, parágrafos e súmulas;
3. recompõe linhas normais e remove espaçamento artificial;
4. impede que uma única linha espaçada seja convertida em tabela;
5. detecta quadros multi-coluna apenas quando existe evidência em mais de uma linha;
6. apresenta comparações válidas em cartões responsivos;
7. mantém títulos e divisões jurídicas reais;
8. não modifica o banco textual original nem o conteúdo jurídico substantivo.

## Casos reais usados como regressão
- Poder Constituinte Originário: “ainda que compatíveis...” deve permanecer na mesma bullet/frase.
- Controle preventivo: o espaço enorme entre “lei,” e “os parlamentares” não pode gerar tabela falsa.
- Art. 37 da CF: continuação física deve ficar dentro do mesmo bloco legal.
- “POSSIBILIDADE DE REEDIÇÃO OU REAPRECIAÇÃO”: o quadro de PEC, projeto de lei e medida provisória deve ser reconstruído em três cartões completos e responsivos.
