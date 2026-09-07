# QA de Engenharia — OAB Focus SUPER v28

## Validações executadas

- `node --check data/v28-patch.js` — aprovado.
- `pytest -q tests/v26_reader_architecture.py tests/v27_progressive_trail.py tests/v28_layout_quality.py` — **53 testes aprovados**.
- Suite v28 isolada — **16 testes aprovados**.

## Cobertura específica da v28

- carregamento do patch após v27;
- contrato público `OAB_V28`;
- rejeição de linha tabular `STATUS DE EMENDA ... STATUS DE NORMA SUPRALEGAL ...`;
- preservação de título jurídico longo legítimo;
- saneamento de rota antiga com subassunto artefato;
- toolbar com navegação primária + disclosure `Leitura`;
- `aria-expanded`, `aria-controls`, fechamento com `Esc` e devolução de foco;
- breadcrumb único e semântico;
- classificação tipográfica de título longo;
- composição sem quebra acidental em 1041×595;
- reflow sem overflow horizontal em 320, 360, 390, 430 e 768 px;
- espaço de segurança para o dock de grifo.

## Limitação do ambiente de QA

O sandbox bloqueou navegação HTTP/file para abrir o `index.html` completo via `page.goto`. Por isso, a integração visual foi validada em harness Playwright que carrega os patches reais v26+v28 e reproduz o DOM do leitor. A suíte completa v26+v27+v28 passou sem regressões.

## Preservação

- material jurídico integral mantido;
- banco de questões preservado;
- mapas mentais continuam removidos;
- v28 é carregada depois de v27 e atua como camada incremental.
