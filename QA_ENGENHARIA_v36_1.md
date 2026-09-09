# QA Engenharia — OAB Focus v36.1

**Data:** 08/09/2026

## Testes novos v36.1

- `tests/v36_1_editorial_layout.py` — 8/8 PASS.
- `tests/v36_1_browser.py` — 5/5 PASS.

## Regressões completas executadas nesta rodada

- Não-browser + gates de conteúdo/release: **134/134 PASS**.
- v26–v29 (inclui navegador): **70/70 PASS**.
- v32–v35 layout/login: **42/42 PASS**.
- conta/E2E + navegador v36.1: **10/10 PASS**.
- **Total fresco desta rodada: 256/256 PASS.**

## Sintaxe

- `node --check data/v16-patch.js` — PASS.
- `node --check data/v17-patch.js` — PASS.
- `node --check data/v18-patch.js` — PASS.
- `node --check data/v19-patch.js` — PASS.

## Viewports v36.1

- 768x1024 — PASS, sem overflow horizontal.
- 430x932 — PASS, sem overflow horizontal.
- 390x844 — PASS, sem overflow horizontal.
- 360x800 — PASS, sem overflow horizontal.

## Transparência

O QA não converte a pendência editorial dos 162 quadros em status de revisão jurídica. Esses blocos estão protegidos contra reordenação automática, mas continuam exigindo conferência individual para migração semântica definitiva.
