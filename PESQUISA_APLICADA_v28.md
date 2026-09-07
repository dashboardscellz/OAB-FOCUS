# OAB Focus SUPER v28 — pesquisa aplicada

A v28 aplica a pesquisa aprofundada mais recente ao leitor e à progressão pedagógica do OAB Focus, preservando a arquitetura ampla da v26 e a Trilha Guiada da v27.

## 1. Leitor responsivo sem quebra acidental

A toolbar deixa de tentar exibir simultaneamente navegação, ajustes de leitura e breadcrumb. Em desktop, ficam visíveis apenas `Voltar`, `Trilha`, `Seu estudo`, `Grifos`, `Anotações` e o menu `Leitura`. Ajustes de fonte, tema e foco ficam em disclosure próprio.

Em telas pequenas, a composição passa a ter duas faixas deliberadas: ações principais em uma faixa horizontal própria e os controles de leitura recolhidos. O objetivo é atender ao princípio de reflow da WCAG 2.2, evitando rolagem horizontal do corpo em largura equivalente a 320 CSS px.

Referências principais: W3C/WAI WCAG 2.2 — Reflow; WAI-ARIA Authoring Practices — Disclosure e Breadcrumb.

## 2. Breadcrumb único e semântico

O caminho do conteúdo deixa de aparecer duplicado. O leitor usa um único `nav` com `aria-label="Caminho do conteúdo"`, itens hierárquicos e `aria-current="page"` no conteúdo atual. Nomes extensos recebem ellipsis sem aumentar a largura da página.

## 3. Títulos jurídicos longos

Títulos legítimos podem ser extensos. Em vez de reduzir todos indiscriminadamente, a v28 classifica títulos normais, longos e muito longos e ajusta escala tipográfica, largura máxima e quebra de linha. O texto corrido permanece em uma coluna confortável para leitura prolongada.

## 4. Artefatos de PDF não viram unidades

A origem do falso assunto `STATUS DE EMENDA STATUS DE NORMA SUPRALEGAL STATUS DE` foi tratada na indexação de subassuntos. Linhas com grandes lacunas internas típicas de colunas de tabelas e linhas de sumário não entram mais como unidades navegáveis.

O material jurídico integral não é apagado. Apenas a classificação como título/subassunto é bloqueada. Rotas antigas que contenham esse falso subassunto são saneadas para o capítulo correspondente.

## 5. Conclusão não é domínio

A regra da v27 é preservada:

- leitura concluída + prática mínima específica = libera a próxima unidade;
- percentual de acertos não bloqueia avanço;
- erros aumentam fragilidade e antecipam revisão;
- acertos consistentes ao longo do tempo elevam domínio e espaçam a próxima revisão.

A v28 passa a explicar isso visualmente no fim da unidade. Quando há amostra adaptativa, mostra domínio, fragilidade e previsão aproximada da próxima revisão. Sem amostra, explica que domínio ainda será construído com questões e espaçamento.

## 6. Grifador e acessibilidade

O documento recebe espaço inferior e `scroll-padding` para que docks fixos não cubram a última parte do conteúdo. Em mobile, o dock respeita a largura útil da viewport. Controles do leitor recebem indicação clara de `:focus-visible`.

## 7. O que não foi introduzido

- Não foi criada gamificação superficial.
- Não foi exigido 100% de acertos para liberar conteúdo.
- Não foi inserido interleaving obrigatório na primeira leitura.
- Não foi reduzido ou resumido o material jurídico.
- Não foram reintroduzidos mapas mentais.
