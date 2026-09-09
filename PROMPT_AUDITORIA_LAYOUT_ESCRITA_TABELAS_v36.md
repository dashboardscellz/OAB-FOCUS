# Prompt de auditoria — Layout, Escrita e Tabelas — OAB Focus v36

**Como usar:** cole este arquivo inteiro no ChatGPT junto com os arquivos do projeto (ou o ZIP `OAB_Focus_SUPER_v36_FINAL_GITHUB.zip`). Os achados abaixo já foram confirmados por leitura direta do código (`index.html`, `data/*.js`, `data/*.css`) de uma cópia real do pacote v36, com o comando ou critério de busca indicado em cada item, para que possam ser reproduzidos antes de qualquer alteração.

---

## Missão

Atue como engenheiro front-end sênior e revisor editorial. Corrija os problemas de **layout**, **escrita/conteúdo** e **estrutura de tabelas** listados abaixo no OAB Focus v36, sem alterar a lógica de negócio, o Firebase, a trilha, o banco de questões ou qualquer conteúdo jurídico além do estritamente necessário para consertar a formatação apontada.

## Regras de execução

1. Não infira ou "reescreva de cabeça" conteúdo jurídico para consertar formatação. Onde um trecho de teoria estiver embaralhado (achado LET-01), a prioridade é **identificar e sinalizar**, não adivinhar uma reordenação que pareça fluente. Um conserto automático que pareça correto mas inverta o sentido de um instituto jurídico é pior do que o texto visivelmente quebrado que existe hoje, porque o aluno confia sem desconfiar.
2. Sempre que possível, confira o trecho contra uma fonte primária ou contra o material de origem antes de reescrever teoria. Isso segue a mesma regra absoluta que já está em `PROMPT_MESTRE_OAB_FOCUS_PRINCIPAL_v36.md` ("pesquise a situação jurídica atual antes de alterar conteúdo").
3. Não remova conteúdo. Corrija a ordem de leitura, a estrutura ou o estilo, preservando a informação. Se um trecho realmente não puder ser reconstruído com confiança, marque-o visivelmente como pendente de revisão em vez de apagá-lo ou de publicá-lo com aparência de pronto.
4. Cada correção precisa vir com um teste de regressão (o projeto já usa Playwright/pytest em `tests/`; siga o padrão dos arquivos existentes, por exemplo `tests/v35_layout_browser.py`).
5. Não crie mais um `data/vNN-patch.js` novo para sobrepor as regras antigas. Este projeto já tem esse problema (ver LET-03 e LET-04): consolide a regra na origem correta (o arquivo que hoje já é sobrescrito) em vez de somar mais uma camada.
6. Aplique cache-busting (`?v=36.1` ou a próxima versão) em qualquer arquivo `data/*.js` ou `data/*.css` alterado.
7. Ao final, produza uma lista do que foi corrigido, do que ficou pendente e do que não foi verificado, no mesmo espírito de transparência que os relatórios `AUDITORIA_*.md` já existentes no projeto.

## O que já está resolvido (não mexer)

- Não há nenhuma tag `<table>` mal formada ou desbalanceada, porque não existe nenhuma tag `<table>` no projeto (ver LET-02).
- O componente `.v16-compare-row` (comparações dentro do leitor de teoria) já trata corretamente o colapso para mobile, inclusive removendo a borda do último item quando empilha em coluna única.
- Não há `debugger`, `alert()` ou `console.log` esquecidos em produção.
- Estrutura básica do documento está correta: `<!doctype html>`, `lang="pt-BR"`, `charset="utf-8"`, meta viewport presente.

---

## Achados

### LET-01 (CRÍTICO): Ordem de leitura corrompida em quadros comparativos extraídos de PDF

**Categoria:** escrita / conteúdo / tabelas (a causa raiz é a ausência de estrutura tabular, ver LET-02)

**Arquivo:** `data/integral-material.js`

**Evidência:** o campo `text` de vários itens de `window.OAB_INTEGRAL.disciplines` contém trechos com espaçamento largo e repetição de frases, sintoma clássico de um PDF de duas ou mais colunas lido linha a linha em vez de coluna a coluna. Exemplo real, em `Administrativo → "Organização da Administração Pública"` (kind: `Teoria completa`):

```
ATO SIMPLES                                             ATO COMPOSTO                                ATO COMPLEXO

Para a formação, depende                               Depende              de       mais    de     uma   É a soma de vontades de
de uma única manifestação                              manifestação                 de    vontade    de   órgãos                  públicos
de vontade.                                            agentes              em           patamar     de   independentes     em    mesmo

```

E em `Trabalho → "Contrato de Trabalho"`, dentro de um quadro "Presencial para o Remoto / Remoto para o Presencial":

```
PRESENCIAL PARA O REMOTO                                                      REMOTO PARA O PRESENCIAL
Mútuo acordo                                                       Vontade do empregador
Sem prazo de adaptação                                                         Adaptação de 15 dias

```

Nos dois casos, o texto não segue ordem de leitura nenhuma: colunas diferentes foram intercaladas linha a linha.

**Extensão confirmada:** buscando o padrão de espaçamento largo (`[a-zà-ÿ)]\s{4,}[A-ZÀ-Ýa-zà-ÿ(]`) no arquivo inteiro, encontrei **1.975 ocorrências em 164 regiões distintas**. As de maior concentração:

| Disciplina Trecho (`title`) Ocorrências  |                                                |     |
| ---------------------------------------- | ---------------------------------------------- | --- |
| Administrativo                           | Improbidade Administrativa — conteúdo completo | 320 |
| Penal                                    | Eficácia da Lei Penal no Tempo e no Espaço     | 112 |
| Administrativo                           | Poderes Administrativos                        | 79  |
| Penal                                    | Das Penas                                      | 75  |
| Constitucional                           | Legislação integral                            | 71  |
| Eleitoral                                | Legislação integral                            | 69  |
| Tributário                               | Competência Tributária                         | 69  |
| Trabalho                                 | Legislação integral                            | 66  |
| Penal                                    | Fato Típico                                    | 52  |
| Ética                                    | Honorários Advocatícios                        | 43  |

Há mais de 150 outros trechos menores, cobrindo praticamente todas as 20 disciplinas do menu, incluindo Civil, Consumidor, Previdenciário, Processo do Trabalho e Internacional.

**Causa raiz:** extração de texto de PDF de layout multi-coluna sem reconstrução por coluna (a política do próprio arquivo, `"policy":"Conteúdo textual preservado; apenas cabeçalhos técnicos, marcas d'água e dados pessoais foram removidos"`, confirma que o texto veio de um documento original, não foi digitado à mão).

**Cenário humano:** um aluno estudando Administrativo abre exatamente a unidade que explica a diferença entre autarquia, fundação, empresa pública e sociedade de economia mista (um dos tópicos mais cobrados da prova) e encontra um parágrafo sem nexo, com frases cortadas e repetidas. Ele não sabe se o problema é ele ou o material, e não tem como aprender o conteúdo daquele jeito.

**Correção sugerida:**

- Localizar cada um dos trechos afetados (o critério de busca acima é reproduzível) e reconstruir a ordem correta comparando com a fonte original, quando disponível, ou com uma fonte primária equivalente (lei seca, doutrina consolidada).
- Não fazer isso via heurística automática de reordenação sem revisão humana, pelo risco descrito na Regra de execução 1.
- Ao reconstruir, migrar o quadro comparativo para uma estrutura real (ver LET-02) em vez de devolver texto solto com espaços manuais, para não repetir o problema na próxima edição de conteúdo.
- Onde não for possível confirmar a reconstrução com segurança no prazo desta correção, marcar o trecho com um aviso visível de "conteúdo em revisão" (o projeto já tem o conceito de rótulo de revisão para questões legadas, aplicar o mesmo princípio aqui) em vez de publicá-lo como se estivesse pronto.

**Status:** aberto.

---

### LET-02 (ALTO): Nenhuma tabela semântica em toda a aplicação

**Categoria:** tabelas / acessibilidade / estrutura HTML

**Evidência:** busca por `<table`, `<tr`, `<td`, `<th`, `<thead`, `<tbody` em `index.html` e em todos os `data/*.js` retorna zero ocorrências. Toda comparação de conteúdo hoje é texto simples (a causa do LET-01) ou, em componentes mais novos, uma div com CSS grid (`.v16-compare-row`, `.admin-user-row`, `.platform-rank-row`).

**Por que importa:** além de ser a causa raiz do LET-01, isso significa que qualquer leitor de tela não recebe nenhuma informação de que aquele bloco é uma tabela, não tem cabeçalho de coluna anunciado, e não tem como navegar célula a célula.

**Correção sugerida:**

- Ao reconstruir os quadros comparativos do LET-01, usar `<table>` semântico de verdade (com `<caption>`, `<th scope="col">`) para as comparações de teoria, com CSS aplicado por cima para manter a identidade visual, e um `overflow-x:auto` num contêiner para telas estreitas.
- Alternativa aceitável se o time preferir manter o padrão de div (como em `.v16-compare-row`): adicionar `role="table"`, `role="row"`, `role="cell"` e `role="columnheader"` explícitos, para não perder a semântica de tabela mesmo sem a tag nativa.
- Não é necessário migrar `.admin-user-row` e `.platform-rank-row` como prioridade desta rodada (são telas internas/administrativas), mas registrar como pendência.

**Status:** aberto.

---

### LET-03 (ALTO): `.integral-body` com `font-family` conflitante definida em 4 arquivos diferentes

**Categoria:** layout / tipografia / consistência do design system

**Evidência:** a classe que estiliza o corpo de leitura do material jurídico é redefinida com `!important` em:

```
data/v35-shell.css   → font-family: Inter, system-ui, sans-serif !important;
data/v17-patch.js    → font-family: Georgia, "Times New Roman", serif !important;
data/v18-patch.js    → font-family: "Segoe UI Variable Text", "Segoe UI", ui-sans-serif, ... !important;
data/v19-patch.js    → font-family: var(--font-read) !important;   /* --font-read = Georgia, "Times New Roman", serif */

```

A ordem real de carregamento no `index.html` é: `v35-shell.css` (via `<link>` no `<head>`) primeiro, depois, entre outros, `v17-patch.js`, `v18-patch.js` e `v19-patch.js` nessa ordem, como `<script>`. Como todos injetam `<style>` com `!important` e a mesma especificidade, quem processa por último vence: hoje isso é `v19-patch.js`, ou seja, o corpo de leitura provavelmente ainda renderiza em serifa (Georgia), não em Inter/sans-serif como o design system da v35 diz adotar.

**Por que isso já deveria ter sido pego:** a própria `AUDITORIA_VISUAL_v35_2026-09-08.md` já identificou este exato problema ("Tipografia do leitor quebrando o design system") e corrigiu, mas só para os seletores de título (`study-zone-head h2`, `subtopic-reader-hero h2`, `integral-section-head h2`). O corpo do texto (`.integral-body`), que é o que o aluno mais lê, nunca recebeu a mesma correção.

**Correção sugerida:**

- Decidir qual fonte é a definitiva para leitura (o histórico do projeto sugere que pode haver preferência editorial por serifa no material de leitura longa, então não presuma que Inter é automaticamente "a correção certa"; confirme com quem definiu o design system da v35).
- Remover a declaração de `.integral-body` de `v17-patch.js` e `v18-patch.js` (ou de `v19-patch.js`, dependendo da decisão acima), deixando uma única fonte de verdade.
- Adicionar um teste de regressão que carregue os scripts na ordem real de produção e confirme o `font-family` computado de `.integral-body`, no mesmo espírito de `tests/v35_8_real_app_e2e.py`.

**Status:** aberto.

---

### LET-04 (MÉDIO): Regra de responsividade "morta" em `index.html` para tabelas de usuário e ranking

**Categoria:** layout / manutenibilidade CSS

**Evidência:** `index.html` define, em `@media(max-width:900px)`:

```css
.admin-user-head{display:none}
.admin-user-row{grid-template-columns:1fr;gap:8px;padding:16px}

```

Mas `data/v29-patch.js` redefine o mesmo comportamento dentro de `@media(max-width:1180px)`, com `!important`:

```css
.admin-user-head{display:none!important}
.admin-user-row{grid-template-columns:minmax(0,1fr)!important;gap:8px!important;padding:16px!important}

```

O mesmo padrão duplicado existe para `.platform-rank-head` / `.platform-rank-row`. Como `v29-patch.js` carrega depois e usa `!important`, a regra de 900px escrita em `index.html` nunca chega a valer: o comportamento real de produção muda em 1180px, não em 900px. Isso não quebra a tela (o resultado visual do patch é razoável), mas quem for ler `index.html` para entender o breakpoint real vai ser enganado por código morto.

**Correção sugerida:**

- Escolher um único breakpoint (verificar visualmente se 900px ou 1180px é o comportamento desejado) e apagar a regra duplicada do outro arquivo.
- Fazer o mesmo levantamento para outros seletores que aparecem redefinidos em mais de um arquivo de patch antes de publicar, já que este padrão (somar um novo patch em vez de editar o existente) é recorrente no histórico do projeto.

**Status:** aberto.

---

### LET-05 (MÉDIO): `v36-primary-prep.css` não segue o padrão de breakpoints do restante do projeto

**Categoria:** layout / responsividade

**Evidência:** o CSS novo da v36 (tela de prontidão, diagnóstico e "mission grid") define só um breakpoint:

```
@media (max-width: 768px)

```

Enquanto `v35-shell.css` (o shell atual) usa 360px, 390px, 430px, 768px e 1080px, e o próprio checklist do projeto (`PROMPT_AUDITORIA_ACABAMENTO_v35_4.md`) exige verificação explícita em 360, 390, 430 e 768px no mobile.

**Por que não está confirmado como quebrado:** o único breakpoint existente já colapsa `.v36-mission-grid` para uma coluna e `.v36-readiness-score` para bloco, o que tecnicamente cobre todas as larguras abaixo de 768px sem overflow óbvio. Não é uma falha confirmada, é uma lacuna de verificação: as telas novas nunca passaram pelo mesmo escrutínio visual que o resto do shell.

**Correção sugerida:**

- Testar visualmente `.v36-readiness`, `.v36-mission-grid` e `.v36-diagnostic-action` em 360px, 390px e 430px.
- Se algum elemento ficar apertado, cortado ou com espaçamento desproporcional nessas larguras (os mesmos critérios já usados em `PROMPT_AUDITORIA_ACABAMENTO_v35_4.md`), adicionar breakpoints intermediários.

**Status:** não verificado quanto a quebra visual; aberto quanto à cobertura de teste.

---

### LET-06 (BAIXO, observação): foto institucional do login embutida como base64 dentro do `index.html`

**Categoria:** layout / desempenho

**Evidência:** o `index.html` contém uma tag `<img src="data:image/webp;base64,...">` com a foto do Manassés (usada no painel institucional do login), com o conteúdo base64 embutido diretamente no HTML em vez de ser um arquivo `.webp` referenciado externamente.

**Por que importa:** isso é um contribuinte concreto e identificável para o problema já registrado em auditoria anterior (carregamento inicial pesado, `index.html` de 4,7 MB): uma imagem embutida como texto base64 não pode ser cacheada separadamente do HTML, não se beneficia de carregamento preguiçoso (`loading="lazy"`) e obriga o navegador a processar dezenas de milhares de caracteres extras como parte do parsing do HTML, não do pipeline de imagem.

**Correção sugerida:**

- Extrair a imagem para um arquivo próprio (`assets/manasses.webp` ou equivalente), referenciar via `<img src="assets/manasses.webp?v=36.1" alt="...">` e aplicar `loading="lazy"` se a imagem não estiver acima da dobra.
- Isso não precisa esperar a correção estrutural maior de carregamento (já registrada em auditoria técnica anterior), pode ser feito isoladamente como ganho rápido.

**Status:** aberto, baixa urgência.

---

## O que este prompt NÃO cobre (limites desta auditoria)

- Não foi feita uma varredura ortográfica/gramatical completa do texto corrido de `data/integral-material.js` (são mais de 5,7 MB de conteúdo). A varredura aqui identificou o padrão estrutural de colunas embaralhadas (LET-01) por assinatura de espaçamento, não uma revisão linha a linha de português.
- Não foi verificado o resultado visual real em navegador (este prompt foi montado por leitura direta de código, não por captura de tela ou Playwright).
- Não foi feita auditoria de conteúdo jurídico (isso já é coberto por `AUDITORIA_JURIDICA_v36.md` e pelo `PROMPT_MESTRE_QUALIDADE_QUESTOES_v35_7.md`, que continuam sendo a referência para isso).
- Os achados de engenharia mais profundos (estado global fragmentado, cobertura de teste, cache incompleto) já estão documentados em `AUDITORIA_TECNICA_HUMANA_v35_7_2026-09-08.md` e não foram repetidos aqui, exceto o LET-06, que é um contribuinte concreto para o COD-04 já registrado lá.

## Checklist de verificação antes de publicar

- [ ] Rodar novamente a busca `[a-zà-ÿ)]\s{4,}[A-ZÀ-Ýa-zà-ÿ(]` em `data/integral-material.js` e confirmar que o número de ocorrências caiu nos trechos corrigidos.
- [ ] Confirmar por inspeção (`getComputedStyle`) que `.integral-body` resolve para uma única `font-family` esperada, carregando os scripts na ordem real de produção.
- [ ] Confirmar visualmente `.admin-user-row` e `.platform-rank-row` no breakpoint escolhido (900 ou 1180px) e remover a regra não usada do outro arquivo.
- [ ] Testar `.v36-readiness`, `.v36-mission-grid` e `.v36-diagnostic-action` em 360, 390, 430 e 768px.
- [ ] Confirmar que qualquer quadro comparativo novo usa `<table>` ou `role="table"`, não texto solto com espaçamento manual.
- [ ] Rodar a suíte de testes existente (`pytest -q tests/`) e confirmar que nada regrediu.
- [ ] Aplicar `?v=` novo em todo arquivo alterado.

## Entregáveis esperados

- Código e conteúdo corrigidos para os achados LET-01 a LET-06 (ou parte deles, com justificativa clara do que ficou para depois).
- Testes novos ou atualizados cobrindo cada correção.
- Lista do que foi corrigido, do que ficou pendente e do que não foi verificado, incluindo quantos dos 164 trechos identificados no LET-01 foram efetivamente revisados contra fonte confiável.

---

## Tabela-resumo

| ID Gravidade Categoria Arquivo(s) principal(is) Status  |         |                          |                                         |                                                           |
| ------------------------------------------------------- | ------- | ------------------------ | --------------------------------------- | --------------------------------------------------------- |
| LET-01                                                  | CRÍTICO | Escrita / Tabelas        | `data/integral-material.js`             | Aberto                                                    |
| LET-02                                                  | ALTO    | Tabelas / Acessibilidade | todo o projeto                          | Aberto                                                    |
| LET-03                                                  | ALTO    | Layout / Tipografia      | `v35-shell.css`, `v17/v18/v19-patch.js` | Aberto                                                    |
| LET-04                                                  | MÉDIO   | Layout / CSS morto       | `index.html`, `v29-patch.js`            | Aberto                                                    |
| LET-05                                                  | MÉDIO   | Layout / Responsividade  | `v36-primary-prep.css`                  | Não verificado quanto a quebra; aberto quanto à cobertura |
| LET-06                                                  | BAIXO   | Layout / Desempenho      | `index.html`                            | Aberto, baixa urgência                                    |