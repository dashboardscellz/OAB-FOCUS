# OAB Focus v10 — Auditoria de Engenharia do Site

Data da revisão: 06/09/2026

## Objetivo

Revisar a estrutura do site para reduzir bugs, melhorar coerência visual, tornar as buscas mais precisas e garantir comportamento responsivo entre computador, tablet e celular.

## Correções estruturais aplicadas

- Removido o comportamento `sticky` dos controles internos do leitor de estudo.
- Corrigido vazamento de listeners de rolagem ao entrar e sair repetidamente do leitor.
- Corrigido o botão de menu móvel, que existia visualmente mas não possuía ação ligada a ele.
- Criado menu móvel com acesso a Início, Estudar, Questões, Revisar, Desempenho, Perfil e Administração para ADM.
- Adicionado fechamento do menu e modais pela tecla `Esc`.
- Adicionado controle contra overflow horizontal em telas pequenas.
- Reforçado tratamento de textos longos para não estourarem cards ou o leitor.
- Mantido `viewport` correto para dispositivos móveis.
- Nenhum ID HTML estático duplicado foi encontrado.
- Botões dentro do formulário de login possuem tipo definido.
- Imagens estáticas possuem atributo `alt`.

## Busca

A pesquisa antiga era baseada essencialmente em `includes()`. Isso criava três problemas principais:

1. podia considerar parte de outra palavra como correspondência;
2. dependia demais da ordem exata das palavras;
3. a busca global não pesquisava adequadamente dentro do conteúdo integral.

A v10 passa a usar:

- normalização de acentos;
- comparação por palavras, não por fragmentos arbitrários;
- pequena normalização morfológica para singular/plural e variações comuns;
- busca independente da ordem dos termos;
- prioridade para título do assunto, disciplina e enunciado;
- pesquisa por siglas jurídicas comuns, como HC, MS, ANPP, CPC, CPP, CF, CLT, CDC e ECA;
- resultados exatos antes dos aproximados;
- resultados aproximados somente quando não existem resultados exatos;
- busca global dentro dos blocos do Super Material;
- abertura direta da questão escolhida na lupa;
- índice de busca preparado em memória após o login para reduzir atraso nas pesquisas seguintes.

### Casos de regressão verificados

- `prisão preventiva` prioriza Processo Penal → Prisão e Liberdade Provisória.
- `preventiva prisão` também encontra o mesmo assunto, sem depender da ordem.
- `usucapião` prioriza Direito Civil → Direito das Coisas / Propriedade.
- `honorários advocatícios` prioriza Ética → Honorários Advocatícios.
- `controle de constitucionalidade` prioriza Constitucional.
- `tutela provisória` prioriza Processo Civil.
- `licitação` prioriza Administrativo → Licitações e Contratos.
- `ANPP` prioriza questões de Acordo de Não Persecução Penal.
- a pesquisa por `ação` não considera `relação` como a mesma palavra.

## Responsividade

O site usa o mesmo código e o mesmo endereço em todos os dispositivos. O layout se reorganiza automaticamente conforme o espaço disponível.

### Desktop

- barra lateral permanente;
- conteúdo em múltiplas colunas quando houver espaço;
- pesquisa global completa no topo;
- maior largura útil para leitura e questões.

### Tablet / telas intermediárias

- redução progressiva das colunas;
- cartões e filtros reorganizados;
- leitor preserva largura confortável.

### Celular

- barra lateral removida;
- navegação inferior fixa;
- menu completo pelo botão superior;
- filtros passam para uma coluna em telas menores;
- questões e alternativas ocupam a largura disponível;
- botões e áreas de toque recebem altura mínima de aproximadamente 48 px em telas touch;
- modais passam a funcionar como painel inferior;
- leitor fica em uma coluna, sem controles internos acompanhando a rolagem;
- botões horizontais do leitor podem deslizar lateralmente sem quebrar o layout.

## Microcopy removida

Foram removidas frases internas sobre a própria engenharia do site, como referências a “PDFs soltos”, “bagunça visual”, “poluição visual” e “fontes editoriais”. A interface passa a falar apenas sobre a ação do estudante.
