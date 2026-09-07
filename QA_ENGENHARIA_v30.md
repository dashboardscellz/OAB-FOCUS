# QA de Engenharia — OAB Focus SUPER v30

Data: 07/09/2026

## Escopo

A v30 incorpora ao banco do OAB Focus a prova **Tipo 1 – Branca do 47º Exame de Ordem Unificado**, mantendo as versões anteriores do material e as correções responsivas da v29.

## Fonte e integridade da prova

- Caderno usado: 47º Exame de Ordem Unificado — Tipo 1 (Branca), 80 questões.
- Enunciados e as quatro alternativas foram extraídos do caderno fornecido pelo usuário.
- Validação local de fidelidade: 80/80 registros gerados coincidem com a extração estruturada usada na importação.
- IDs novos: `oab47-01` a `oab47-80`.
- Nenhum ID colide com as 2.336 questões existentes.
- Banco após a importação: **2.416 questões**.

## Gabarito

Foi usado o **gabarito preliminar oficial da FGV**, prova Tipo 1, referente à prova objetiva de 06/09/2026 e publicado em 06/09/2026.

Chave validada, questões 1–80:

`ABDCCDBBDCCADCCAAACBACACBBABDCBCCDCDCADADADBADCCADBBCDBDBBDAACBDDCBBBDADBADABDCA`

O site identifica esse status como `preliminar-2026-09-06` e mostra um aviso específico ao abrir questão da 47ª OAB. O cronograma oficial prevê o gabarito definitivo da 1ª fase em 23/09/2026; eventual alteração posterior deve gerar uma atualização do banco.

## Distribuição das 80 questões

- Ética: 8
- Filosofia: 2
- Constitucional: 6
- Direitos Humanos: 2
- Eleitoral: 2
- Internacional: 2
- Financeiro: 2
- Tributário: 5
- Administrativo: 5
- Ambiental: 2
- Civil: 6
- ECA: 2
- Consumidor: 2
- Empresarial: 4
- Processo Civil: 6
- Penal: 6
- Processo Penal: 6
- Previdenciário: 2
- Trabalho: 5
- Processo do Trabalho: 5

## Correção comentada

- 80/80 questões possuem comentário próprio.
- A questão 17 preserva a alternativa A como gabarito preliminar oficial da FGV, mas o comentário sinaliza expressamente a controvérsia jurídica e a fundamentação para a alternativa D (Tratado de Marraqueche), até a publicação do gabarito definitivo.
- Cada comentário informa a letra do gabarito preliminar, explica a regra decisiva e registra fundamento normativo/doutrinário correspondente.
- A interface já existente de correção usa `q.answer` para indicar acerto/erro e `q.comment` para exibir o comentário após a resposta.
- Os assuntos foram refinados quando a classificação genérica induziria vínculo incorreto (ex.: tratados de direitos humanos, TPI, LGPD, competência processual e ação de cumprimento).

## Vínculos com o material

- **65** questões receberam vínculo contextual manual e estrito com capítulo existente.
- **15** questões permanecem no banco livre sem vínculo forçado quando não havia capítulo suficientemente seguro.
- A política é conservadora: ausência de vínculo é preferível a apresentar uma questão de outro microtema dentro da leitura.

## Recorrência histórica

- `V13_COMPLETE_EXAMS` passou a considerar 13 provas completas: 30º–37º e 43º–47º EOU.
- Foram removidas referências de cálculo/apresentação ainda fixadas em `/12` nas rotas históricas e no patch v15.

## Compatibilidade

- `data/v30-questions.js` é carregado antes da constante principal `QUESTIONS`.
- `data/v30-patch.js` é carregado depois da v29.
- Mapas mentais continuam removidos.
- Nenhum material jurídico integral foi reduzido ou substituído.

## Arquivos novos/alterados

- `data/v30-questions.js`
- `data/v30-patch.js`
- `index.html`
- `data/v15-patch.js`
- `tests/v30_oab47_import.py`
- `README.md`
- `ATUALIZAR_GITHUB.cmd`
- `QA_ENGENHARIA_v30.md`

## Verificação final

- `pytest -q tests/*.py`: **78 testes aprovados**.
- `node --check data/v30-questions.js`: aprovado.
- `node --check data/v30-patch.js`: aprovado.
- O ZIP final é submetido a teste de integridade após o empacotamento.
