# OAB Focus v36 Primary Prep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar uma v36 que corrija o risco jurídico identificado, aprofunde Empresarial, torne o planejamento/simulado adaptativos e fortaleça a transparência para uso como ferramenta principal da 1ª fase.

**Architecture:** Camada v36 aditiva após a v35.9, dividida em governança de conteúdo, questões autorais revisadas e motor de preparação. A camada preserva objetos globais e rotas existentes, alterando apenas pontos de extensão testáveis.

**Tech Stack:** HTML/CSS/JavaScript estático, Firebase existente, Python/pytest para regressão, Node.js para testes de runtime.

**Spec:** `docs/superpowers/specs/2026-09-08-oab-focus-primary-prep-design.md`

## Global Constraints
- Preservar banco, progresso, Firebase, grifos, caderno de erros e trilha existente.
- Não prometer aprovação.
- 1ª fase apenas.
- Questões autorais nunca entram em estatística histórica FGV.
- Erro jurídico vigente bloqueia release.
- v36 deve carregar depois da v35.9.

---

### Task 1: Gate jurídico de Seguro
**Files:** Create `tests/v36_legal_content.py`; Create `data/v36-content-governance.js`.
**Interfaces:** Consumes `window.OAB_INTEGRAL`; Produces `window.OAB_V36_CONTENT_GOVERNANCE`.
- [ ] Escrever teste que exige Lei 15.040/2024 e proíbe arts. 757–802 do CC como bloco vigente de Seguro.
- [ ] Rodar o teste e confirmar RED.
- [ ] Implementar patch que substitui somente a seção SEGURO do capítulo legal de Civil.
- [ ] Rodar o teste e confirmar GREEN.

### Task 2: Aprofundamento de Empresarial
**Files:** Modify `data/v36-content-governance.js`; Test `tests/v36_legal_content.py`.
**Interfaces:** Produces cinco capítulos de `Teoria completa` com >=800 palavras e blocos normativos atualizados.
- [ ] Acrescentar asserts de profundidade e fontes.
- [ ] Confirmar RED.
- [ ] Inserir conteúdo aprofundado nos cinco capítulos.
- [ ] Confirmar GREEN.

### Task 3: Questões autorais revisadas
**Files:** Create `tests/v36_curated_questions.py`; Create `data/v36-curated-questions.js`.
**Interfaces:** Consumes `window.OAB_QUESTIONS`; Produces `window.OAB_V36_CURATED_QUESTIONS` e mapeamento estrito quando disponível.
- [ ] Testar quantidade, origem, comentário estruturado e exclusão das estatísticas históricas.
- [ ] Confirmar RED.
- [ ] Criar banco curado para Seguro e Empresarial.
- [ ] Confirmar GREEN.

### Task 4: Motor adaptativo e simulado ponderado
**Files:** Create `tests/v36_primary_engine.py`; Create `data/v36-primary-prep.js`.
**Interfaces:** Produces `window.OAB_V36_ENGINE`, `buildV36DiagnosticQueue`, `buildV36SimulationQueue`; overrides `preparePriorityItems`, `generatePrepareDay`, `startSimulation` when safe.
- [ ] Testar pesos da 47ª, soma 80, prioridade e filtragem de autorais.
- [ ] Confirmar RED.
- [ ] Implementar motor puro e wrappers de runtime.
- [ ] Confirmar GREEN.

### Task 5: UI de direção diária
**Files:** Create `data/v36-primary-prep.css`; Modify `data/v36-primary-prep.js`; Test `tests/v36_primary_engine.py`.
**Interfaces:** Adds mission rationale, coverage/readiness widgets, diagnostic and simulation actions without removing current UI.
- [ ] Criar asserts de CSS/HTML hooks.
- [ ] Confirmar RED.
- [ ] Implementar blocos v36 em Prepare-se/Revisão/Questões.
- [ ] Confirmar GREEN.

### Task 6: Integração, docs e release gate
**Files:** Modify `index.html`, `README.md`, `ATUALIZAR_GITHUB.cmd`; Create `tests/v36_release_gate.py`, `AUDITORIA_JURIDICA_v36.md`, `QA_ENGENHARIA_v36.md`, `FONTES_V36.md`, `PROMPT_MESTRE_OAB_FOCUS_PRINCIPAL_v36.md`.
**Interfaces:** Produces release v36 empacotável e auditável.
- [ ] Testar ordem de scripts, baseline de questões, 47ª=80, presença de docs e versão.
- [ ] Confirmar RED.
- [ ] Integrar assets e documentação.
- [ ] Rodar grupos de regressão estáveis e registrar resultados.
- [ ] Empacotar ZIP e validar `unzip -t`.
