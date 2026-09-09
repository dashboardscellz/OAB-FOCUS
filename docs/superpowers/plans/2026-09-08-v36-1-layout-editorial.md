# OAB Focus v36.1 Layout & Editorial Remediation Implementation Plan

**Goal:** Corrigir LET-01 a LET-06 sem alterar negócio, Firebase, trilha ou banco jurídico.

**Architecture:** Corrigir a origem existente: o formatador do leitor em v16, conflitos tipográficos nos estilos já existentes, duplicações responsivas em index/v29, CSS v36 e a imagem embutida. Reconstruir semanticamente apenas quadros conferidos contra os PDFs-fonte; preservar com aviso estrutural os demais quadros de extração fixa para impedir interleaving sem inventar conteúdo.

**Tech Stack:** HTML/CSS/JavaScript estático, Python/pytest, Playwright.

**Spec:** Prompt de auditoria — Layout, Escrita e Tabelas — OAB Focus v36 (arquivo fornecido pelo usuário).

## Global Constraints
- Não alterar Firebase, trilha, banco de questões ou lógica de negócio.
- Não reescrever conteúdo jurídico sem fonte confiável.
- Não remover conteúdo.
- Não criar novo patch de runtime.
- Cache bust v36.1 em assets data alterados.
- Cada correção deve possuir regressão automatizada.

### Task 1: Regressões v36.1
- Criar testes estáticos/browser para LET-01 a LET-06 e confirmar RED.

### Task 2: Quadros e semântica
- Reconstruir os dois quadros confirmados nos PDFs fonte com marcadores tabulares explícitos.
- Alterar formatIntegralText em v16 para renderizar tabela semântica dos marcadores.
- Preservar visualmente, sem reordenar, regiões de layout fixo ainda não reconstruídas e rotulá-las como revisão estrutural.

### Task 3: Tipografia e CSS responsivo
- Manter Georgia/Times via --font-read como fonte editorial definitiva.
- Remover declarações concorrentes de v35-shell, v17 e v18.
- Manter v19 como aplicação do token.
- Remover regras responsivas mortas do index e manter 1180px em v29 como fonte do comportamento admin/ranking.

### Task 4: v36 mobile
- Adicionar cobertura visual 360/390/430/768 e ajustar somente se necessário.

### Task 5: Imagem institucional
- Extrair data URI para assets/manasses.webp e referenciar externamente com cache-bust e lazy loading.

### Task 6: QA e release
- Atualizar cache para 36.1.
- Rodar suítes estáticas e browser em lotes.
- Documentar revisados, pendentes e não verificados.
- Empacotar ZIP e testar integridade.
