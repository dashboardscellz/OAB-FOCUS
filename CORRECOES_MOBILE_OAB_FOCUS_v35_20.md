# Correções Mobile — OAB Focus v35
## Prompt Especializado para o ChatGPT

> **Contexto:** O site OAB Focus é uma SPA (Single Page Application) com dois arquivos CSS principais: `index.html` (CSS inline) e `data/v35-mobile-app.css`. O JS de controle está em `data/v35-mobile-app.js`. Todas as correções abaixo devem ser aplicadas no arquivo indicado em cada item, sem alterar o comportamento desktop (breakpoint de corte: `768px` e `860px`).

---

## BUG 1 — Toolbar de "Estudar" sobrepõe o topbar no scroll

**Problema:** A toolbar sticky da tela de disciplinas (`[data-v3513-route="study"] .toolbar`) está posicionada em `top: 56px`, mas o topbar tem `height: calc(var(--v3513-top-h) + var(--v3516-top-safe))` (56px + safe area). Em dispositivos com notch (iPhone 14+), a toolbar desliza para debaixo da barra de status.

**Arquivo:** `data/v35-mobile-app.css`

**Como corrigir:** Substituir a linha:
```css
#app[data-v3513-route="study"] .toolbar,#app[data-v3513-route="study"] .study-toolbar{position:sticky;top:56px;z-index:25; ...}
```
Por:
```css
#app[data-v3513-route="study"] .toolbar,#app[data-v3513-route="study"] .study-toolbar{
  position:sticky;
  top:calc(var(--v3513-top-h) + var(--v3516-top-safe));
  z-index:25;
  background:#f7f8fa;
  padding:8px 0 10px;
  margin:0!important;
}
```

---

## BUG 2 — Texto da questão transborda horizontalmente em telas estreitas

**Problema:** `.question-text` tem `white-space: pre-line` herdado do CSS desktop (linha 57 do index.html). Em mobile com enunciados longos sem quebra de linha natural, isso causa scroll horizontal no painel de questão.

**Arquivo:** `index.html` (bloco CSS inline) e `data/v35-mobile-app.css`

**Como corrigir:** No `v35-mobile-app.css`, dentro do bloco `@media(max-width:768px)`, adicionar após a regra existente de `.question-text`:
```css
#app .question-text{
  white-space:pre-wrap!important;
  overflow-wrap:anywhere!important;
  word-break:normal!important;
}
```
Obs.: `overflow-wrap:anywhere` já existe para `.answer` — aplicar o mesmo padrão ao `.question-text`.

---

## BUG 3 — Conteúdo do leitor fica coberto pelo `bottom-nav` ao rolar até o fim

**Problema:** `body.v26-reader-active #app .content` tem `padding-bottom: calc(110px + env(safe-area-inset-bottom))`. Porém, o `.v18-highlight-dock` (barra de marcadores) é fixo e posicionado acima do bottom-nav com `bottom: calc(var(--v3513-nav-h) + var(--v3516-bottom-safe) + 10px)`. A altura do dock (mínimo 48px) não está sendo somada ao padding-bottom do artigo, causando sobreposição quando o dock está visível.

**Arquivo:** `data/v35-mobile-app.css`

**Como corrigir:** Substituir:
```css
body.v26-reader-active #app .content{...padding:8px 0 calc(110px + env(safe-area-inset-bottom))!important;}
```
Por:
```css
body.v26-reader-active #app .content{
  padding:8px 0 calc(var(--v3513-nav-h) + var(--v3516-bottom-safe) + 78px)!important;
}
```
E em `body.v26-reader-active #readerArticle .integral-body` adicionar:
```css
padding-bottom:calc(var(--v3513-nav-h) + var(--v3516-bottom-safe) + 90px)!important;
```

---

## BUG 4 — Dois breakpoints conflitantes controlam o mesmo elemento (`.reader-top`)

**Problema:** O `reader-top` recebe `top: 66px` no bloco `@media(max-width:860px)` do `index.html`, mas no `v35-mobile-app.css` recebe `position:relative!important; top:auto!important`. Se o CSS do `index.html` carregar depois (ordem de cascata), o `top:66px` pode vencer e fazer o reader-top se sobrepor ao topbar.

**Arquivo:** `index.html` (bloco `@media(max-width:860px)`)

**Como corrigir:** No `index.html`, dentro de `@media(max-width:860px)`, remover ou comentar a linha:
```css
.reader-top{top:66px}
```
O posicionamento correto já é tratado pelo `v35-mobile-app.css` com `position:relative!important`.

---

## BUG 5 — Sheet de filtros de questões não respeita teclado virtual (iOS)

**Problema:** `.v3513-filter-sheet` usa `max-height: min(calc(var(--v3516-visual-h,100dvh) - 10px), 680px)`. A variável `--v3516-visual-h` é atualizada pelo JS (`v35-mobile-app.js`) quando o teclado abre (classe `v3516-keyboard-open`), mas o `max-height` da sheet não é reajustado nessa classe. Em iOS, quando o usuário foca o campo de busca dentro da sheet, o teclado cobre parte da UI.

**Arquivo:** `data/v35-mobile-app.css`

**Como corrigir:** Adicionar, após o bloco existente de `body.v3516-keyboard-open`, a seguinte regra:
```css
body.v3516-keyboard-open #app .v3513-filter-sheet{
  max-height:calc(var(--v3516-visual-h, 60dvh) - 6px)!important;
}
```
Esta regra já existe parcialmente no arquivo mas está isolada em outro contexto — trazer para junto das demais regras `v3516-keyboard-open`.

---

## BUG 6 — `question-side` exibe dois cartões lado a lado mesmo em tela < 390px

**Problema:** `.question-side` recebe `grid-template-columns: 1fr 1fr` em `@media(max-width:768px)` (v35-mobile-app.css). Em aparelhos muito estreitos (< 390px, ex.: iPhone SE), os cartões de estatísticas ficam espremidos e o texto dos rótulos (`font-size:.62rem`) beira a ilegibilidade.

**Arquivo:** `data/v35-mobile-app.css`

**Como corrigir:** No bloco `@media(max-width:390px)` existente no final do arquivo, adicionar:
```css
#app .question-side{
  grid-template-columns:1fr!important;
}
```

---

## BUG 7 — `content` do leitor não recebe `padding-left/right` em mobile — texto cola na borda

**Problema:** `body.v26-reader-active #app .content` sobrescreve o padding com `padding: 8px 0 ...`. O `0` zera o padding horizontal. Depois, o artigo (`#readerArticle .integral-body`) usa `padding: 16px 0 22px`. Em resumo, o texto do leitor fica sem margem lateral e a linha de texto vai da borda à borda.

**Arquivo:** `data/v35-mobile-app.css`

**Como corrigir:** Substituir:
```css
body.v26-reader-active #app .content{width:100%!important;max-width:100%!important;padding:8px 0 calc(110px + env(safe-area-inset-bottom))!important;}
```
Por:
```css
body.v26-reader-active #app .content{
  width:100%!important;
  max-width:100%!important;
  padding:8px 0 calc(var(--v3513-nav-h) + var(--v3516-bottom-safe) + 78px)!important;
}
```
E substituir:
```css
body.v26-reader-active #readerArticle .integral-body{padding:16px 0 22px!important;}
```
Por:
```css
body.v26-reader-active #readerArticle .integral-body{
  padding:16px var(--v3513-gutter,14px) 22px!important;
}
```

---

## BUG 8 — `font-size:16px!important` em inputs não está dentro do bloco `@media`

**Problema:** A regra `#app input, #app select, #app textarea { font-size: 16px!important }` está declarada **fora** do bloco `@media(max-width:768px)` no `v35-mobile-app.css` (nas linhas de "hardening" após o fechamento da media query). Isso aplica `font-size:16px` também em desktop, podendo quebrar o tamanho de fonte dos filtros e inputs na versão grande.

**Arquivo:** `data/v35-mobile-app.css`

**Como corrigir:** Mover a linha:
```css
#app input,#app select,#app textarea{font-size:16px!important;}
```
Para dentro do bloco `@media(max-width:768px),(max-width:950px) and (max-height:500px)`, na seção "Generic mobile ergonomics".

---

## BUG 9 — `bottom-nav` com `display:none` no CSS desktop nunca recebe `display:grid` no mobile quando `#app` não tem o ID correto

**Problema:** O `.bottom-nav` começa com `display:none` no CSS base (`index.html`, linha 63). O `v35-mobile-app.css` ativa com `#app .bottom-nav { ... display:grid (implícito pelo grid-template-columns) }`, mas apenas quando o elemento está dentro de `#app`. Se por algum erro de inicialização o `app-shell` não tiver `id="app"` (ex.: múltiplas instâncias renderizadas pelo JS), o bottom-nav permanece invisível.

**Arquivo:** `data/v35-mobile-app.css`

**Como corrigir:** Adicionar um seletor de fallback no bloco `@media(max-width:768px)`:
```css
@media(max-width:768px){
  .app-shell .bottom-nav{
    display:grid!important;
    grid-template-columns:repeat(5,minmax(0,1fr))!important;
  }
}
```
Manter o seletor `#app .bottom-nav` existente (mais específico) para o caso normal.

---

## BUG 10 — Scroll horizontal espúrio causado por `.home-welcome` no dashboard mobile

**Problema:** `.home-welcome` tem `border-radius: var(--r-lg)` (22px) e `padding: 32px`. Em mobile, o `@media(max-width:860px)` do `index.html` reduz o padding para `24px`, mas não adiciona `overflow:hidden` ou `max-width:100%`. O gradiente de fundo (`linear-gradient`) + a borda arredondada pode gerar 1-2px de overflow horizontal em alguns motores WebKit.

**Arquivo:** `data/v35-mobile-app.css`

**Como corrigir:** Dentro do bloco `@media(max-width:768px)`, adicionar:
```css
#app .home-welcome{
  overflow:hidden!important;
  max-width:100%!important;
  box-sizing:border-box!important;
}
```

---

## Checklist de Verificação Pós-Aplicação

Após aplicar as correções acima, testar nos seguintes cenários:

1. **iPhone SE (375px)** — Tela de questões: texto do enunciado sem scroll horizontal, cartões de estatística empilhados verticalmente.
2. **iPhone 14 Pro (393px, com Dynamic Island)** — Toolbar de "Estudar" não sobrepõe a island; leitor com margens laterais visíveis.
3. **Android genérico 360px** — Bottom-nav visível e fora do conteúdo; último parágrafo do leitor não escondido pela barra.
4. **Teclado virtual aberto (qualquer plataforma)** — Sheet de filtros de questões não fica cortada; inputs não disparam zoom automático (font-size ≥ 16px).
5. **Orientação paisagem em tablet estreito (950×500px)** — Quick-grid de 4 colunas ativo; highlight-dock centralizado.
