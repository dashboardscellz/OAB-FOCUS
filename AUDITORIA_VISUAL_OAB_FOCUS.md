# OAB Focus — Auditoria Visual e de Design

Auditoria do CSS real do `index.html`. Cada achado tem o número medido no seu código, o porquê de ser um problema e a correção. No fim há um `:root` unificado pronto para usar e um bloco de prompt para colar. Ordem por impacto visual.

---

## CRÍTICO PARA A PERCEPÇÃO DE QUALIDADE

### 1. A fonte Inter é usada 342 vezes mas NUNCA é carregada
O CSS declara `font-family: Inter, ...` em toda a interface (342 referências), porém não existe **nenhum** `@font-face` nem link para Google Fonts no HTML. Resultado: quem não tem Inter instalada (quase todo mundo no Windows e no Android) vê o app inteiro na fonte de fallback do sistema. A tipografia que você desenhou simplesmente não aparece para a maioria dos alunos. Este é, de longe, o item que mais afeta a sensação de "produto acabado".
Correção: auto-hospedar a Inter (arquivos `.woff2`) ou carregar do Google Fonts com `preconnect`, incluindo o peso 650/680/800/900 que o CSS usa. Auto-hospedar é melhor para performance e para funcionar offline no PWA.

```html
<!-- no <head>, antes do <style> -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap">
```
(Ideal: baixar os .woff2 e servir localmente com `@font-face` + `font-display:swap`.)

### 2. Três blocos `:root` com tokens que se contradizem
Existem **três** `:root` separados no CSS, e eles brigam entre si:
- `--paper` é definido duas vezes, com valores diferentes: `#fbfaf7` e `#fbfbfa`.
- Há um `--accent:#7a2238` (vinho amarronzado) e, em outro bloco, `--wine:#9f1239` (vinho vivo) mais `--wine-2:#be123c`. São três vinhos diferentes disputando o papel de cor da marca.
- `--ink-2` também aparece duplicado.
Isso gera inconsistência sutil: o mesmo elemento pode ter uma tonalidade de fundo levemente diferente dependendo de qual regra venceu. O olho não nomeia o problema, mas percebe que "algo está desalinhado".
Correção: um `:root` único, uma cor de marca só (escolha entre o vinho `#7a2238` da identidade atual ou o `#9f1239`, não os dois), um `--paper` só. Bloco pronto no fim deste documento.

### 3. Paleta com 296 cores distintas
O CSS usa **296 valores hex diferentes**. Boa parte são variações quase idênticas de branco-azulado para fundos de card (`#edf3ff`, `#eef3ff`, `#f5f9ff`, `#eef5ff`, `#fbfcfe`, `#f7f9fc`...). Isso é o que faz uma interface parecer "montada em pedaços" em vez de desenhada. Um design system maduro vive com 20 a 40 tokens de cor.
Correção: colapsar essas variações em uma escala de neutros e uma escala da cor de marca (ver `:root` no fim). Trocar os hex soltos pelos tokens.

---

## ALTO

### 4. Escala tipográfica com 61 tamanhos diferentes
O CSS tem **61 valores distintos de `font-size` em rem**. Não existe escala; cada componente escolheu seu tamanho na mão. Isso quebra o ritmo vertical e a hierarquia visual (o olho não consegue agrupar "isto é título, isto é corpo, isto é legenda" quando há 61 degraus).
Correção: adotar uma escala de 7 a 8 degraus e mapear tudo nela. Sugestão (base 16px):
`.72 / .8 / .88 / 1 / 1.15 / 1.4 / 1.8 / 2.4 / 3.2rem`.

### 5. Border-radius com mais de 20 valores
Contei `border-radius` em 10px, 11px, 12px, 13px, 14px, 16px, 17px, 18px, 19px, 20px, 22px, 24px, 26px... e por aí vai. Cantos arredondados inconsistentes são um dos sinais mais visíveis de UI não sistematizada: cards vizinhos com raios diferentes parecem "tortos".
Correção: três raios só, mais o pill.
`--r-sm:10px; --r-md:16px; --r-lg:22px; --r-pill:999px;` e usar exclusivamente esses.

### 6. 22 sombras (box-shadow) distintas
São **22 definições diferentes de `box-shadow`**. Elevação inconsistente faz cards que deveriam estar "no mesmo plano" parecerem flutuar em alturas diferentes.
Correção: três níveis de elevação.
`--shadow-sm`, `--shadow-md`, `--shadow-lg`, aplicados por hierarquia (card em repouso = sm, card hover/modal = md, overlay = lg).

### 7. Espaçamento sem grade (padding e gap dispersos)
`padding` aparece em 12, 13, 14, 16, 18, 20, 22px...; `gap` em 6, 7, 8, 9, 10, 12, 14px... Valores ímpares e próximos (13px vs 14px) que ninguém distingue, mas que impedem alinhamento entre componentes.
Correção: grade de 4px. Use só múltiplos: 4, 8, 12, 16, 20, 24, 32, 40. Tokenize:
`--s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:20px; --s6:24px; --s8:32px; --s10:40px;`.

---

## MÉDIO

### 8. Contraste de texto a verificar (WCAG)
`--muted:#6b7785` sobre `--paper:#fbfaf7` fica perto do limite mínimo de contraste para texto pequeno (WCAG AA pede 4.5:1). Legendas e textos secundários em cinza claro podem reprovar, o que atrapalha leitura no celular sob sol.
Correção: escurecer o muted para algo como `#5a6675` e testar os pares texto/fundo num verificador de contraste.

### 9. Excesso de gradientes competindo
18 `linear-gradient` + 3 `radial` + 1 `conic`. Alguns são bons (o hero escuro), mas gradientes espalhados em muitos cards competem por atenção e datam o visual. Um produto de estudo ganha em legibilidade com superfícies mais chapadas e um ou dois momentos de gradiente com propósito.
Correção: reservar gradiente para o hero e talvez o anel de nível; deixar cards em cor sólida.

### 10. Dark mode inexistente (impacto visual e de conforto)
Como já apontado, o "modo noturno" prometido não existe. Para um app de leitura longa à noite, é um pedido de conforto visual real. Depois de unificar os tokens no `:root`, o dark mode vira quase de graça: basta um segundo bloco de tokens sob `[data-theme="dark"]`.

---

## `:root` UNIFICADO (ponto de partida)

Substitui os três `:root` atuais por um só. Mantém a identidade vinho + navy do projeto, colapsa neutros e define as escalas. Ajuste os valores de marca ao seu gosto, mas mantenha a estrutura.

```css
:root{
  /* MARCA (escolha UM vinho e mantenha) */
  --brand:#7a2238; --brand-2:#9f1239; --brand-soft:#f6e6eb;
  --navy:#17345c; --night:#0c1d33; --night-2:#173252;

  /* NEUTROS (colapsam as ~200 variações de branco-azulado) */
  --paper:#fbfaf7; --surface:#ffffff; --surface-2:#f4f6f8;
  --ink:#0d1b2a; --ink-2:#2f3950; --muted:#5a6675; --line:#e4e8ec;

  /* AÇÃO E ESTADO */
  --blue:#2563eb; --blue-2:#1d4fd6;
  --good:#16794d; --good-bg:#eaf7f0;
  --bad:#8f241c; --bad-bg:#fdecea;
  --warn:#a86a1f; --warn-bg:#fdf3e2;

  /* RAIO (só estes) */
  --r-sm:10px; --r-md:16px; --r-lg:22px; --r-pill:999px;

  /* ELEVAÇÃO (só estas) */
  --shadow-sm:0 1px 2px rgba(9,18,35,.05), 0 2px 8px rgba(9,18,35,.04);
  --shadow-md:0 6px 20px rgba(9,18,35,.08);
  --shadow-lg:0 24px 60px rgba(7,22,42,.17);

  /* ESPAÇO (grade de 4px) */
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:20px; --s6:24px; --s8:32px; --s10:40px;

  /* TIPOGRAFIA (escala) */
  --t-caption:.72rem; --t-small:.8rem; --t-body-sm:.88rem; --t-body:1rem;
  --t-lead:1.15rem; --t-h4:1.4rem; --t-h3:1.8rem; --t-h2:2.4rem; --t-h1:3.2rem;
  --font-ui:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
  --font-read:Georgia,"Times New Roman",serif;

  /* LAYOUT */
  --sidebar:264px; --reader:720px;
}

/* Dark mode fica trivial depois da unificação: */
[data-theme="dark"]{
  --paper:#0f1620; --surface:#151d29; --surface-2:#1b2532;
  --ink:#eef2f7; --ink-2:#c7d0da; --muted:#8b98a7; --line:#26303d;
  --brand-soft:#2a1620;
}
```

---

## PROMPT PARA COLAR (só o lado visual)

```
Você é um designer de produto e front-end sênior especializado em design systems para web. Vou lhe
passar o CSS de uma SPA de estudos (OAB Focus): tudo inline em um index.html, vanilla, evoluída por
patches vNN. Não reescreva em framework, não adicione build. Mudanças visuais podem entrar tanto
consolidando o :root do index quanto por um novo patch vNN que injeta <style id="vNNStyles">.

Diagnóstico já feito (confirmado no código): a fonte Inter é referenciada 342x mas nunca é carregada
(0 @font-face, 0 Google Fonts); há 3 blocos :root com tokens conflitantes (dois valores de --paper,
três vinhos diferentes); 296 cores hex distintas; 61 tamanhos de fonte; 20+ border-radius; 22
box-shadow; espaçamento sem grade; --muted possivelmente abaixo de contraste WCAG AA; sem dark mode.

Faça, uma tarefa por vez, confirmando comigo antes de seguir:
1. Carregar a fonte Inter de verdade (preconnect + stylesheet, ou @font-face auto-hospedado com
   font-display:swap) nos pesos 400-900 que o CSS usa. Explique o trade-off Google Fonts vs
   auto-hospedar (offline/PWA).
2. Substituir os 3 :root por UM só, com uma cor de marca única, --paper único, e escalas de cor,
   raio, sombra, espaço e tipografia. Use o :root unificado que eu fornecer como base e me diga
   quais hex soltos no CSS passam a apontar para cada token.
3. Colapsar as 296 cores nas escalas de neutro/marca/estado, sem mudar a identidade visual.
4. Normalizar border-radius para {sm,md,lg,pill} e box-shadow para {sm,md,lg} por hierarquia.
5. Mapear os 61 font-size na escala tipográfica de 8 degraus e os paddings/gaps na grade de 4px.
6. Corrigir contraste do texto muted para passar WCAG AA e me mostrar os pares testados.
7. Implementar dark mode via [data-theme="dark"] com toggle persistido, aproveitando os tokens.

Para cada tarefa: mostre o antes/depois dos valores, garanta que nenhuma tela quebra nos breakpoints
existentes (860px e 560px), e entregue um checklist de QA visual. Comece confirmando o plano da
Tarefa 1 (a fonte).
```
