# QA de Engenharia — OAB Focus SUPER v27

Data: 07/09/2026

## Escopo validado

A v27 adiciona a **Trilha Guiada Progressiva** sobre a arquitetura ampla do leitor v26, sem recolocar painéis laterais permanentes e sem reduzir o material jurídico.

Regras verificadas:

- Disciplina → capítulo → unidade/subtema.
- Estados: `Disponível`, `Em estudo`, `Questões pendentes`, `Concluído` e `Bloqueado`.
- Próxima unidade depende de **leitura concluída + amostra mínima de questões especificamente validadas**, quando essas questões existirem.
- A amostra obrigatória é `min(3, quantidade de questões estritas disponíveis)`.
- Acerto não é requisito de desbloqueio: erros contam como tentativa e continuam disponíveis para revisão adaptativa.
- Quando não há questão FGV/OAB especificamente validada para a unidade, a leitura é suficiente para avançar; questão autoral permanece apenas como reforço opcional.
- Banco livre, revisão inteligente, simulador e prática contextual não foram fundidos com a trilha.
- A visualização de capítulos usa divulgação progressiva: somente o capítulo ativo fica aberto por padrão; busca abre os capítulos correspondentes.
- Leitor continua amplo e sem a antiga grade comprimida de três colunas.
- Mapas permanecem removidos.

## Testes automatizados

Comando:

```bash
python3 -m pytest tests/v26_reader_architecture.py tests/v27_progressive_trail.py -q
```

Resultado final:

```text
37 passed in 12.90s
```

Cobertura específica da v27: **19 testes**.

Também validado:

```bash
node --check data/v27-patch.js
```

Resultado: sem erro de sintaxe.

## Smoke test no aplicativo real

O `index.html` real foi executado no Chromium com os arquivos `data/*.js` incorporados em memória e conexões externas bloqueadas. Foi usado progresso local vazio para testar apenas a aplicação.

Disciplina real auditada: **Ética**.

- Trilha: 192 unidades preservadas em 14 capítulos.
- Capítulos abertos por padrão: 1.
- Unidades futuras bloqueadas no estado inicial: 191.
- Leitor: toolbar v26 presente, botão `Trilha` presente, gate de progressão presente.
- Índice lateral antigo no leitor: 0.
- Painel lateral antigo de status: 0.
- View interna `Trilha`: presente, 14 capítulos, somente 1 aberto por padrão.
- Erros JavaScript durante o fluxo auditado: 0.
- Overflow horizontal: 0 px.

Mobile auditado em **360, 390, 430 e 768 px**:

- Leitor: 0 px de overflow horizontal em todas as larguras.
- Gate de progressão: presente em todas as larguras.
- Trilha em 390 px: 0 px de overflow e somente o capítulo ativo aberto.

## Preservação de dados

Contagem estática de questões em `index.html`:

- v26 de origem: **2.336**.
- v27 final: **2.336**.

Arquivos/recursos de mapas confirmados como ausentes:

- `maps/`
- `maps-hd/`
- `data/map-manifest.js`

## Base pedagógica aplicada

A implementação foi desenhada a partir da pesquisa aprofundada solicitada, priorizando:

- prática de recuperação após exposição inicial;
- espaçamento/revisão posterior em módulo separado;
- avaliação formativa sem transformar erro em barreira artificial de progresso;
- mastery/progressão com requisito mínimo observável;
- progressive disclosure para reduzir carga visual em disciplinas com dezenas ou centenas de unidades.

Referências de base consultadas na pesquisa: Dunlosky et al. (2013), Roediger & Karpicke (2006), Cepeda et al. (pesquisa sobre prática distribuída), revisões sobre retrieval practice e princípios de progressive disclosure do Nielsen Norman Group.
