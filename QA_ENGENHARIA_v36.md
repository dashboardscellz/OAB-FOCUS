# QA Engenharia — OAB Focus v36

**Data:** 08/09/2026

## Escopo

Regressões da v35.9 + novos gates v36 para conteúdo jurídico, proveniência de questões, motor de prioridade, diagnóstico, simulado ponderado e release.

## TDD v36

Os testes v36 foram escritos antes da implementação correspondente e tiveram falha RED confirmada para: correção de Seguro/Empresarial, banco curado, motor principal e assets de release.

## Resultados registrados nesta execução

- `node --check data/v36-content-governance.js` — PASS.
- `node --check data/v36-curated-questions.js` — PASS.
- `node --check data/v36-primary-prep.js` — PASS.
- `pytest -q tests/v36_*.py` — **25/25 PASS**.
- Regressões v26–v30 — **81/81 PASS**.
- Regressões v32–v34 — **36/36 PASS**.
- Regressões v35 não-browser — **79/79 PASS**.
- `tests/v35_layout_browser.py` — **17/17 PASS**.
- `tests/v35_account_browser.py` — **3/3 PASS**.
- `tests/v35_8_real_app_e2e.py` — **2/2 PASS**.
- **Total verificado: 243/243 testes PASS**, executados em lotes para evitar timeout do runner sem alterar a suíte.

## Gates novos

- Seguro não pode reintroduzir como vigentes os arts. 757–802 do Código Civil.
- Cinco capítulos centrais de Empresarial devem manter profundidade mínima definida no teste.
- Questões autorais curadas devem possuir proveniência, revisão, fundamento e análise A/B/C/D.
- Questões autorais mecânicas legadas são reclassificadas como reforço de regra, sem alegar fidelidade FGV.
- Simulado completo deve usar 80 questões ponderadas pela distribuição disciplinar validada.
- Diagnóstico usa 40 questões ponderadas, priorizando oficiais.
- Todos os scripts locais usam cache `?v=36.1`.
- 47º EOU deve permanecer com 80 questões.

## Limitações

Os testes de navegador real e E2E foram executados efetivamente nesta rodada e passaram. A auditoria jurídica desta versão é focalizada nos bloqueios identificados e não constitui revisão humana individual de todo o acervo legado.
