# QA de Engenharia — OAB Focus SUPER v18

## Escopo

A v18 mantém o conteúdo jurídico integral e altera principalmente dois sistemas:

1. leitor editorial / grifagem;
2. Prepare-se como currículo de **aprendizagem**, separado da revisão adaptativa.

## Integridade do pacote

- Banco preservado: **2.336 questões**.
- Mapa de questões possui 2.336 entradas.
- 1.448 questões possuem vínculo estrito de capítulo.
- 797 possuem vínculo estrito de subassunto (`subtopicStrict`).
- Material integral e high-yield presentes.
- Nenhuma pasta `maps`, `maps-hd` ou `map-manifest.js` no pacote.
- Todos os scripts locais referenciados pelo `index.html` existem.

## Testes sintáticos

Executado `node --check` em todos os arquivos de `data/*.js`:

- `highyield-static.js`
- `integral-material.js`
- `v15-patch.js`
- `v15-study-map.js`
- `v16-patch.js`
- `v16-question-map.js`
- `v17-patch.js`
- `v18-patch.js`

Resultado: aprovado.

## Teste real em Chromium headless

A aplicação foi carregada com todos os dados e patches inline em Chromium headless.

Resultado de inicialização:

- `window.__OAB_BOOT_OK = true`;
- versão detectada: `18.0`;
- 2.336 questões carregadas;
- zero erros JavaScript de página durante os cenários testados.

## Leitor v18

Validado em desktop (1440 × 1000):

- cabeçalho editorial v18 presente;
- botão `Voltar` presente;
- barra de grifo v18 presente;
- rodapé com conclusão/anterior/próximo presente;
- sem overflow horizontal.

Validado em mobile (390 × 844):

- largura do documento = largura do viewport;
- overflow horizontal = 0;
- barra de grifo permanece dentro da tela;
- artigo ocupa a largura móvel sem deslocamento lateral.

## Grifagem v18

Teste automatizado em conteúdo jurídico real:

1. seleção de texto atravessando mais de um parágrafo;
2. captura da seleção antes do clique;
3. paleta contextual exibida;
4. clique em amarelo;
5. 1 grifo salvo no estado;
6. múltiplos fragmentos visuais criados quando o trecho atravessa nós diferentes;
7. saída da unidade;
8. reabertura da mesma unidade;
9. grifo restaurado no mesmo trecho;
10. contador de grifos preservado.

Resultado: aprovado.

## Prepare-se v18

Cenário de QA: plano de 90 dias, 90 minutos por sessão, modo `APRENDER DO ZERO`.

Primeira etapa gerada:

`Constitucional → Teoria da Constituição`

As primeiras unidades foram fundamentos como Poder Constituinte, e as questões ficaram bloqueadas enquanto a teoria da etapa não estava concluída.

A regra de dependências implementada impede que a incidência estatística ultrapasse pré-requisitos. Exemplos explícitos no grafo:

- Processo Penal depende da cadeia de Penal até `Culpabilidade`;
- Processo Civil depende da cadeia de Civil até `Negócio Jurídico`;
- Processo do Trabalho depende da cadeia de Trabalho até `Empregador`.

A ordenação é topológica: o conteúdo dependente só entra depois dos seus pré-requisitos.

## Separação ensino x revisão

- `Prepare-se`: primeiro contato e progressão pedagógica.
- `Revisão inteligente`: curva do esquecimento, fragilidade e reapresentação após aprendizagem.

Questões do Prepare-se são bloqueadas até a conclusão da teoria da etapa. Se não houver questão específica validada, o sistema não preenche com questão de outro assunto.

## Atualizador

`ATUALIZAR_GITHUB.cmd` atualizado para v18 e validando também `data/v18-patch.js`.

Destino configurado:

`C:\Users\endoa\Documents\GitHub\OAB-FOCUS`
