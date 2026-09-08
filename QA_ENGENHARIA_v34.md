# QA DE ENGENHARIA — OAB Focus SUPER v34

Data da auditoria: 08/09/2026

## 1. Objetivo

A v34 concentra uma auditoria estrutural sobre cinco áreas que vinham acumulando comportamento inconsistente: trilha pedagógica, questões contextuais, feedback visual, grifagem e tempo de estudo. A atualização foi feita preservando dados e interfaces já consolidados nas versões anteriores.

## 2. Trilha pedagógica

### Problema reproduzido

Um heading-pai podia ser tratado como unidade embora seu recorte englobasse também os headings-filhos. Exemplo: `Poder Constituinte` continha o texto posterior de `Poder Constituinte Originário`; em seguida `Originário` aparecia novamente como outra unidade.

### Correção

- detecção de profundidade de headings numerados;
- identificação de pais com descendentes;
- extração somente da introdução direta do pai, até o próximo heading;
- pai sem conteúdo introdutório próprio relevante passa a funcionar como grupo e não como leitura duplicada;
- filtro de headings contaminados por sumário, paginação, tabela/quadro/figura, status editoriais e marcadores de revisão;
- `sliceTextBySubtopic` passa a respeitar o limite do próximo heading.

### Cobertura de prática

Cada unidade estudável é normalizada para no mínimo 3 questões estritamente vinculadas. O sistema usa primeiro questões reais mapeadas com segurança e gera reforço autoral somente para completar a cobertura. Questões autorais recebem `authorial: true`, `sourceType: 'authorial'` e `excludeFromHistoricalStats: true`.

## 3. 47ª OAB

- 80 registros de pesquisa em `data/v34-research.js`;
- cada registro contém resposta oficial, justificativa da correta, fundamento jurídico, armadilha e análise de A/B/C/D;
- o feedback de erro identifica a alternativa escolhida e explica o motivo específico do erro antes de apresentar a correta;
- gabarito da Prova Tipo 1 sincronizado com o preliminar atualizado pela FGV em 07/09/2026;
- questão 17 corrigida de A para D conforme o gabarito revisado;
- status persistido: `preliminar-revisado-2026-09-07`.

## 4. Caderno de erros

Uma resposta incorreta registra:

- id da questão, exame, disciplina e tópico;
- alternativa marcada e texto marcado;
- alternativa correta e texto correto;
- conceito confundido;
- fundamento jurídico;
- explicação do erro e da correta;
- data/hora;
- recuperação posterior quando a questão é acertada em nova tentativa.

## 5. Feedback visual e acessibilidade

Foram adicionados estados mais fortes para:

- questão favoritada/marcada (`aria-pressed` + estado persistente);
- alternativa selecionada;
- botões de continuação/navegação (`aria-busy` e estado de abertura);
- estados pressionados dos botões;
- atualização dos estados após mudanças de DOM.

## 6. Grifagem

O mecanismo de grifo foi estendido para:

- material explicado;
- legislação;
- súmulas contidas na área legislativa.

Paleta: amarelo, verde, azul, rosa, lilás e laranja. Cada segmento persiste `scope: theory|law`, evitando colisão entre trechos iguais em áreas distintas.

## 7. Temporizador de estudo

A v34 reaproveita o relógio ativo já existente para não contar simples permanência com a página aberta. A interface apresenta:

- sessão atual;
- tempo da unidade;
- tempo de hoje;
- total acumulado;
- indicador compacto no modo foco.

A lógica existente de aba oculta e inatividade superior a aproximadamente 90 segundos continua sendo respeitada. Sessões também são registradas para histórico.

## 8. Testes automatizados

A suíte completa foi executada por módulos devido ao tempo de execução agregado do ambiente:

- v26: 18 aprovados
- v27: 19 aprovados
- v28: 16 aprovados
- v29: 14 aprovados
- v30: 11 aprovados
- v32: 12 aprovados
- v33: 13 aprovados
- v34: 11 aprovados

**Total: 114 testes aprovados.**

A suíte v34 cobre, entre outros pontos:

- presença e ordem dos patches v34;
- 80 pesquisas da 47ª OAB;
- gabarito revisado e Q17 = D;
- feedback de alternativa incorreta;
- registro de caderno de erros;
- mínimo de 3 questões por unidade;
- exclusão de autorais das estatísticas FGV;
- limpeza hierárquica da trilha;
- grifagem de legislação e seis cores;
- temporizador visível e pausa por atividade;
- ausência dos mapas mentais removidos.

## 9. Smoke test de runtime

Foi executado um bootstrap isolado em Playwright usando o patch real da v34. Sem erros de página no cenário testado. No caso sintético `Poder Constituinte → Originário/Derivado`, o heading-pai redundante foi removido da sequência estudável e os dois filhos terminaram com 3 questões estritas cada.

O ambiente de QA não permitiu navegação completa do site local por URL; por isso este relatório não afirma uma inspeção browser end-to-end da aplicação inteira. As regressões responsivas anteriores continuam cobertas pelas suítes automatizadas v29, v32 e v33.

## 10. Integridade

- material jurídico integral preservado;
- banco de questões anteriores preservado;
- Firebase/login preservados;
- patches v31 continuam fora da cadeia de carregamento;
- mapas mentais continuam removidos (`maps/`, `maps-hd/`, `data/map-manifest.js`).
