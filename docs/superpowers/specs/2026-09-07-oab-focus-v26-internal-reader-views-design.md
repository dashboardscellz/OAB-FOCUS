# OAB Focus v26 — Arquitetura de telas internas para leitura e estudo

Data: 2026-09-07
Base: OAB Focus SUPER v25
Status: design aprovado em princípio pelo usuário; aguardando revisão final deste documento antes da implementação.

## 1. Problema raiz confirmado

O leitor atual ainda tenta exibir simultaneamente três responsabilidades diferentes:

1. índice da leitura;
2. conteúdo jurídico;
3. painel “Seu estudo”.

A v16 introduziu explicitamente o grid de três colunas (`.v16-reader-grid`) e injetou o índice e o painel lateral em torno de `#readerArticle`. Versões posteriores (v17–v25) alteraram larguras, breakpoints, modo foco e aparência, mas mantiveram essa composição como fundamento.

Há ainda múltiplas camadas de override de funções e estilos: o projeto carrega patches sequenciais da v15 até a v25, e o `setRoute`/`renderReader` foi sobrescrito em mais de uma camada. Isso explica parte dos recursos que “não pegam” de forma consistente: estado, eventos e layout acabam dependendo da ordem final de carregamento dos patches.

A v26 não deve tentar resolver o problema apenas aumentando pixels. Deve mudar a responsabilidade de cada tela.

## 2. Objetivo

Transformar o leitor em uma experiência de uma tarefa por tela.

A tela principal de leitura deve priorizar apenas o material jurídico, com largura confortável. Índice, progresso detalhado, grifos e anotações passam a abrir como telas internas do próprio OAB Focus, cada uma com `← Voltar à leitura`.

Não serão abertas novas abas do navegador.

## 3. Arquitetura recomendada

### 3.1 Tela principal — Leitura

Responsabilidade única: ler e estudar o conteúdo.

Exibir:
- `← Voltar` para a origem anterior (Estudar / Prepare-se / Mais cobrados);
- breadcrumb compacto;
- título do conteúdo;
- material jurídico integral;
- progresso discreto;
- barra de grifo contextual/flutuante;
- ações compactas: `Índice`, `Seu estudo`, `Grifos`, `Anotações`, `Foco`.

Não exibir permanentemente:
- índice lateral;
- painel lateral “Seu estudo”;
- cards de métricas ao lado do texto.

Largura do texto: aproximadamente 78–84ch, respeitando legibilidade e viewport.

### 3.2 Tela interna — Índice

Responsabilidade: orientação e navegação na matéria.

Exibir:
- `← Voltar à leitura`;
- disciplina, capítulo e unidade atual;
- capítulos/subassuntos em lista ampla;
- item atual destacado;
- progresso por unidade quando disponível;
- clique em qualquer item retorna ao leitor no ponto escolhido.

Não repetir material ou métricas laterais.

### 3.3 Tela interna — Seu estudo

Responsabilidade: mostrar o estado da unidade atual.

Exibir:
- `← Voltar à leitura`;
- progresso de leitura;
- tempo nesta unidade;
- questões da unidade;
- acertos/erros específicos da unidade;
- domínio/fragilidade quando houver dados suficientes;
- quantidade de grifos;
- estado “em andamento / concluído”;
- ação `Marcar como estudada`;
- ação contextual `Fazer questões desta unidade`.

Layout em cards largos, nunca em coluna lateral estreita.

### 3.4 Tela interna — Grifos

Responsabilidade: revisar destaques da unidade.

Exibir:
- `← Voltar à leitura`;
- agrupamento amarelo / verde / azul;
- trecho grifado;
- contexto mínimo;
- ação `Ir para este trecho`;
- remoção do grifo.

### 3.5 Tela interna — Anotações

Responsabilidade: criar e revisar notas do conteúdo atual.

Exibir:
- `← Voltar à leitura`;
- anotações da unidade;
- nova anotação;
- edição/exclusão;
- opção de retornar ao trecho relacionado quando houver âncora.

### 3.6 Questões contextuais

Permanece como tela própria de prática, conforme correções da v21.

Quando aberta a partir do leitor ou Prepare-se:
- `← Voltar ao material`;
- trilha exata;
- questão X de N;
- sem busca global;
- sem filtros gerais;
- sem simulado;
- sem card promocional de revisão inteligente.

Banco livre continua sendo outro modo.

## 4. Navegação interna

A v26 deve introduzir um estado único para o leitor:

```js
readerSession = {
  payload,
  origin,
  view: 'reading' | 'index' | 'study' | 'highlights' | 'notes',
  scrollAnchor,
  focusMode
}
```

Ações `Índice`, `Seu estudo`, `Grifos` e `Anotações` alteram apenas `readerSession.view` e renderizam uma tela interna de largura total.

`← Voltar à leitura` retorna para `view: 'reading'` e restaura a posição sem recalcular o conteúdo inteiro desnecessariamente.

`← Voltar` na leitura usa a pilha global de navegação e retorna à origem real.

A navegação deve ser determinística; nenhum painel interno deve depender de `scrollIntoView()` em uma coluna escondida.

## 5. Estratégia de implementação

### Abordagem escolhida: módulo v26 proprietário do leitor

Não criar apenas mais CSS sobre o grid legado.

Criar `data/v26-patch.js` como camada final que:
- assume propriedade de `renderReader`;
- remove a composição permanente de `.v16-reader-toc` + `#readerArticle` + `.v16-reader-status`;
- reaproveita as funções de conteúdo, progresso, questões, grifos e persistência já existentes;
- renderiza as cinco views internas;
- centraliza os listeners da toolbar do leitor;
- limpa listeners/elementos ao sair da rota;
- não altera os dados jurídicos.

O objetivo é reduzir dependência de manipulações conflitantes da v16–v25 sem reescrever toda a aplicação.

Não será criado multi-page HTML. A aplicação continua SPA.

## 6. Recursos “que não pegam” — regra de correção

Antes de implementar cada ação do novo leitor, verificar o fluxo atual de dados e evento.

A v26 deve criar uma matriz de QA para:
- Voltar;
- Índice;
- Seu estudo;
- Grifos;
- Anotações;
- A-/A+;
- tema claro/escuro;
- foco;
- marcar como estudada;
- questões da unidade;
- anterior/próximo;
- retorno do Prepare-se;
- restauração da leitura.

Cada função deve ter um único owner/listener ativo por render.

Se uma ação antiga continuar existindo em patches legados, a v26 deve neutralizar o elemento/listener legado antes de montar o novo controle.

## 7. Modo foco

Modo foco será uma variação da view `reading`, não uma arquitetura paralela.

Ao ativar:
- esconder topbar global;
- esconder toolbar completa do leitor;
- manter apenas progresso discreto, grifo e `Sair do foco`;
- conteúdo central em largura de leitura confortável;
- sem índice e sem “Seu estudo”, já que esses são telas internas separadas.

## 8. Desktop

Leitura:
- um único centro editorial;
- largura máxima aproximada do artigo: 900–980px;
- corpo textual 78–84ch;
- toolbar superior compacta;
- sem colunas laterais permanentes.

Telas internas:
- largura de conteúdo entre 960–1180px;
- grids de 2–3 cards quando fizer sentido;
- nenhum card menor que ~260px para texto explicativo.

## 9. Mobile

Em 360 / 390 / 430px:
- uma coluna real;
- toolbar compacta horizontal com overflow controlado ou menu “Mais”; 
- Índice/Seu estudo/Grifos/Notas sempre em tela própria;
- botões de ação com área de toque adequada;
- dock de grifo não pode cobrir botões de navegação;
- nenhum scroll horizontal;
- `Voltar à leitura` permanece visível no topo das telas internas.

Em tablet 768px:
- ainda preferir tela única de leitura; não restaurar laterais permanentes.

## 10. Preservação de funcionalidades

A v26 deve preservar:
- material jurídico integral;
- 2.336+ questões atuais e complementos posteriores;
- vínculo material ↔ questão;
- Prepare-se pedagógico;
- revisão inteligente;
- curva do esquecimento;
- grifos persistentes;
- dark mode;
- Mais cobrados;
- progresso;
- mapas permanecem removidos.

## 11. Critérios de aceitação

### Leitura
- nenhum painel lateral permanente em desktop/tablet/mobile;
- corpo textual não fica estreito por causa de “Seu estudo” ou índice;
- título e parágrafos não sofrem quebra artificial por largura insuficiente.

### Telas internas
- cada ação abre uma tela do próprio site;
- `← Voltar à leitura` restaura conteúdo e posição;
- nenhuma tela interna vira nova aba do navegador;
- nenhuma tela mistura funções de outro modo.

### Funcional
- todos os botões do leitor possuem teste manual/automatizado;
- grifos continuam persistindo;
- conclusão da unidade continua salvando;
- questões contextuais continuam vinculadas ao assunto;
- Prepare-se consegue abrir e recuperar o leitor corretamente.

### Mobile
- testar 360, 390, 430 e 768px;
- zero overflow horizontal;
- nenhuma ação principal fica coberta pelo dock de grifo;
- nenhum texto em cards quebra palavra por palavra.

## 12. Não fazer

- não aumentar apenas a largura do grid legado;
- não criar novas abas reais do browser;
- não criar iframe;
- não duplicar estado de progresso;
- não reintroduzir mapas;
- não resumir material;
- não remover funções apenas para simplificar visualmente;
- não misturar banco livre, revisão adaptativa e prática contextual.

## 13. Resultado esperado

A sensação final deve ser:

**Leitura = uma página de estudo limpa e larga.**

Recursos auxiliares deixam de competir pelo mesmo espaço e passam a funcionar como páginas internas dedicadas, com retorno claro à leitura. Isso elimina a causa estrutural da sensação de “site inteiro estreito” e reduz a fragilidade dos controles espalhados entre várias colunas.
