# Inventário de alterações — OAB Focus v36

## Novos arquivos de produção
- `data/v36-content-governance.js` — correção jurídica de Seguro, saneamento Civil e aprofundamento Empresarial.
- `data/v36-curated-questions.js` — 18 questões autorais revisadas e estritamente mapeadas.
- `data/v36-primary-prep.js` — motor de peso da prova, prioridade, prontidão, diagnóstico e simulado ponderado.
- `data/v36-primary-prep.css` — componentes visuais de prontidão/diagnóstico e regras mobile.

## Arquivos de produção alterados
- `index.html` — carregamento dos assets v36, cache `?v=36.1` e marcador da versão.
- `README.md` — escopo e mudanças da v36.
- `ATUALIZAR_GITHUB.cmd` — validação dos novos assets e mensagem de release.

## QA e governança
- `tests/v36_legal_content.py`
- `tests/v36_curated_questions.py`
- `tests/v36_primary_engine.py`
- `tests/v36_release_gate.py`
- `tests/v36_coverage_matrix.py`
- `AUDITORIA_JURIDICA_v36.md`
- `MATRIZ_COBERTURA_v36.md`
- `FONTES_V36.md`
- `QA_ENGENHARIA_v36.md`
- `PROMPT_MESTRE_OAB_FOCUS_PRINCIPAL_v36.md`

## Ajuste de testes legados
Os testes que verificavam exclusivamente a chave de cache `?v=35.9` foram atualizados para `?v=36.1`. As demais asserções funcionais foram preservadas.
