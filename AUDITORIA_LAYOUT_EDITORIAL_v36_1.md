# Auditoria de Layout, Escrita e Tabelas — OAB Focus v36.1

**Data:** 08/09/2026

## Resultado executivo

A rodada v36.1 tratou os achados LET-01 a LET-06 sem alterar Firebase, lógica de negócio, trilha ou banco de questões. A estratégia foi conservadora: conteúdo jurídico não foi reordenado por heurística quando a fonte não foi confirmada.

## LET-01 — ordem de leitura de quadros extraídos de PDF

**Status: PARCIALMENTE CORRIGIDO COM BLOQUEIO DE DANO.**

- **2 dos 164 trechos apontados** foram efetivamente reconstruídos contra fonte confiável: `Administrativo → Organização da Administração Pública → Ato Simples x Ato Composto x Ato Complexo` (fonte: `RESUMO SEMANA 03(1).pdf`) e `Trabalho → Contrato de Trabalho → Alteração do regime de trabalho` (fonte: `RESUMO SEMANA 01(1).pdf`).
- Esses dois quadros foram migrados para marcadores estruturados e renderização `<table>` semântica.
- Os demais **162 trechos não foram reescritos de cabeça**. O formatador v16 agora detecta layout fixo ainda não reconstruído, preserva os espaços originais em bloco rolável e mostra `Revisão estrutural pendente`, evitando a antiga compactação que intercalava colunas em uma frase falsa.
- A assinatura literal `[a-zà-ÿ)]\s{4,}[A-ZÀ-Ýa-zà-ÿ(]` caiu de **1.975 para 1944 ocorrências no arquivo bruto** após a reconstrução dos dois quadros confirmados. As ocorrências restantes continuam no dado-fonte para não adulterar conteúdo sem validação.

## LET-02 — semântica de tabelas

**Status: CORRIGIDO PARA QUADROS RECONSTRUÍDOS; MIGRAÇÃO GLOBAL PENDENTE.**

- O leitor agora suporta `<table class="integral-semantic-table">` com `<caption>`, `<thead>`, `<tbody>` e `<th scope="col">`.
- Os dois quadros validados usam essa estrutura.
- Quadros ainda não reconstruídos são preservados como layout original e explicitamente marcados como revisão estrutural, sem fingir semântica tabular que ainda não foi validada.
- `.admin-user-row` e `.platform-rank-row` permanecem fora desta migração, conforme a prioridade definida pela auditoria.

## LET-03 — tipografia conflitante

**Status: CORRIGIDO.**

- Fonte editorial definitiva para leitura longa: `--font-read: Georgia, "Times New Roman", serif`.
- Removidas as declarações concorrentes de `.integral-body` em `v17-patch.js`, `v18-patch.js` e `v35-shell.css`.
- `v19-patch.js` permanece como aplicação do token editorial.
- Teste em Chromium confirma que o parágrafo do leitor resolve para fonte serifada e não para Inter.

## LET-04 — CSS responsivo morto

**Status: CORRIGIDO.**

- O comportamento responsivo de `.admin-user-head/.admin-user-row` e `.platform-rank-head/.platform-rank-row` passa a ter como fonte de verdade o `@media(max-width:1180px)` de `v29-patch.js`.
- Regras duplicadas/mortas do `@media(max-width:900px)` de `index.html` foram removidas.
- A declaração de grid de ranking em 1180px no `index.html`, que também era sobrescrita pelo v29, foi removida.

## LET-05 — breakpoints v36

**Status: CORRIGIDO E VERIFICADO.**

- `v36-primary-prep.css` agora possui ajustes explícitos em 430, 390 e 360px, além de 768px.
- Teste real em Chromium validou `.v36-readiness`, `.v36-mission-grid` e `.v36-diagnostic-action` em **768x1024, 430x932, 390x844 e 360x800**, sem overflow horizontal.

## LET-06 — imagem base64 no HTML

**Status: CORRIGIDO.**

- A foto institucional foi extraída para `assets/manasses.webp`.
- `index.html` referencia `assets/manasses.webp?v=36.1` com `decoding="async"`.
- `loading="lazy"` não foi aplicado porque a imagem integra a apresentação principal da tela de login e pode estar acima da dobra; atrasá-la seria contraproducente.
- A data URI WebP deixou de existir no HTML.

## Pendências declaradas

1. **162 dos 164 trechos** de layout multi-coluna ainda precisam de reconstrução semântica individual contra fonte confiável. Eles já não são silenciosamente intercalados pelo renderizador, mas continuam marcados como revisão estrutural.
2. Migração semântica de grids administrativos/ranking para tabela/ARIA não foi priorizada nesta rodada, em conformidade com a auditoria original.
3. Não foi feita revisão ortográfica integral dos mais de 5 MB de texto jurídico; esta versão resolve o padrão estrutural identificado, não uma revisão linguística linha a linha.

## Arquivos principais alterados

- `index.html`
- `assets/manasses.webp`
- `data/integral-material.js`
- `data/v16-patch.js`
- `data/v17-patch.js`
- `data/v18-patch.js`
- `data/v35-shell.css`
- `data/v36-primary-prep.css`
- testes com referências de cache atualizadas para `?v=36.1`
- `tests/v36_1_editorial_layout.py`
- `tests/v36_1_browser.py`
- `README.md`
- `ATUALIZAR_GITHUB.cmd`

## Regra de release

A v36.1 não declara os 162 quadros pendentes como juridicamente reconstruídos. O ganho desta versão é impedir que o site apresente colunas intercaladas como texto corrido confiável, enquanto dois quadros confirmados passam a possuir estrutura semântica real.
