# QA de Engenharia — OAB Focus v29

## Objetivo

A v29 é uma auditoria responsiva global da interface. O escopo não ficou restrito ao Modo Foco: foram procurados padrões de CSS e composição capazes de causar desalinhamento, compressão excessiva, overflow, texto escapando de cartões, toolbars quebradas e componentes incompatíveis com larguras intermediárias.

## Causas-raiz encontradas

### 1. Modo Foco deslocado

A navegação lateral era ocultada, mas `.main-area` ainda preservava o `margin-left` reservado à sidebar. O leitor ficava deslocado para a direita mesmo sem a barra lateral visível.

Correção: no estado de foco, a área principal passa a usar a largura real do viewport, sem offsets herdados. O artigo fica centralizado e o botão de saída respeita a área segura da tela.

### 2. Faixa intermediária desktop/tablet

Entre aproximadamente 861 e 1180 px, diversos componentes ainda mantinham grids pensados para desktop largo, enquanto a sidebar continuava consumindo espaço. Isso comprimia cartões sem necessariamente produzir overflow da página inteira.

Foram ajustados:

- Questões: painel principal deixa de competir com uma coluna lateral fixa.
- Prepare-se: opções e configuração reduzem colunas progressivamente.
- Alto rendimento: hero, cartões e ações passam a refluír sem esmagar títulos.
- Ranking: linhas passam a uma composição compacta quando a largura cai.
- Administração: tabela rígida vira composição empilhada antes de ficar ilegível.

### 3. Buraco de breakpoint no login

Havia uma faixa próxima de 920 px em que as colunas mínimas do login somavam mais que o viewport. Foi criada uma transição intermediária antes do layout mobile.

### 4. Conteúdo que podia escapar de blocos

Foram adicionadas proteções em títulos, textos de cartões, identidades, anotações, resultados de busca, controles de formulário e elementos de trilha para palavras/tokens excepcionalmente longos.

### 5. Material jurídico com elementos naturalmente largos

Tabelas, blocos de código e citações extensas dentro do leitor agora são contidos pelo próprio artigo. Tabelas largas ganham rolagem horizontal interna, evitando deslocar a página inteira.

### 6. Elementos flutuantes

O dock de grifo e o botão de saída do foco receberam limites relativos ao viewport e safe-area, reduzindo o risco de cobrir o material ou escapar em telas estreitas.

## Testes adicionados na v29

A suíte `tests/v29_layout_audit.py` cobre, entre outros pontos:

- carregamento do patch v29 por último;
- `margin-left: 0` efetivo no Modo Foco;
- centralização real do artigo no viewport;
- Prepare-se em 861 e 1024 px;
- Questões em 900 px;
- login em 920 px;
- ranking mobile com identidade longa;
- administração em 1024 px;
- alto rendimento em 1024 px;
- texto longo dentro de cartões;
- tabelas largas no leitor.

## QA visual

A auditoria visual foi executada em Chromium com fixtures representativas das telas mais sensíveis:

- Foco: 1366 px;
- Administração: 1024 px;
- Alto rendimento: 1024 px;
- Login: 920 px;
- Prepare-se: 1024 px;
- Questões: 900 px;
- Ranking: 360 px.

No teste específico do Modo Foco em 1366 px, o artigo de 1000 px ficou centralizado exatamente no viewport e sem overflow horizontal da página.

## Regressão

A v29 preserva:

- material jurídico integral;
- mapas mentais removidos desde a v14.2;
- arquitetura de telas internas da v26;
- trilha pedagógica da v27;
- melhorias de leitura e ensino adaptativo da v28.

A validação final deve sempre executar `pytest -q tests/*.py` e `node --check data/v29-patch.js` antes da distribuição do ZIP.
