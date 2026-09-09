# Auditoria mobile aplicada — OAB Focus v35.16

## Evidência recebida
Foram analisadas duas capturas reais de iPhone enviadas pelo usuário.

### P0 — Home escapando da viewport
A pill `LV 1 Calouro` era mantida como item `flex: 0 0 auto` ao lado de uma saudação longa. Em largura real de telefone, a soma dos dois blocos ultrapassava a viewport e a pill era cortada à direita. O teste novo reproduziu o defeito em 360 px antes da correção (`home-head` medindo aproximadamente 394 px dentro de uma viewport de 360 px).

**Correção:** o cabeçalho da Home passa a ter linha superior própria para marca + nível, e a saudação ocupa a largura inteira abaixo. A pill recebe `max-width` e ellipsis defensivo.

### P0 — Barra de grifos sobre a navegação
A captura do leitor mostrava a paleta de grifos competindo com a bottom bar. A causa raiz não estava apenas no CSS v35.13: `v28-patch.js` injeta em runtime uma regra mobile com `bottom:10px!important` para `.v18-highlight-dock`. Como o `<link>` do CSS mobile já havia sido processado antes, a regra dinâmica posterior podia vencer a cascata.

**Correção:** a v35.16 cria uma camada crítica `#v3516-mobile-runtime-css`, instalada pelo último adaptador JavaScript e reaplicada ao fim da cadeia. O dock fica fixo acima da bottom bar, com seletor mais específico. Um teste injeta deliberadamente uma regra legada posterior e confirma que a invariante mobile continua correta.

### P1 — `Salvo` sobre conteúdo
O status de sincronização permanecia como badge fixo acima da bottom bar. Na Home ele cobria o resumo; no leitor disputava espaço com grifos.

**Correção:** em mobile, `Salvo` torna-se confirmação transitória (1,4 s) e depois fica transparente/pointer-events none. `Salvando` e estados de falha permanecem visíveis. No leitor, quando visível, o badge é elevado acima do dock de grifos.

### P1 — Touch targets de 40 px
Ícones do cabeçalho e botão de fechar dos filtros tinham 40×40 px.

**Correção:** controles primários ajustados para pelo menos 44×44 px.

### P1 — Texto de questão menor que 16 px
O enunciado estava em `.94rem` e alternativas em `.86rem`.

**Correção:** enunciado em `1rem`, alternativas em `.96rem` com line-height maior. Inputs/selects recebem 16 px para evitar zoom involuntário no Safari.

### P1 — Smartphone em paisagem virava desktop
A função `mobileQuery` considerava apenas `max-width:768px`. Um telefone em 844×390 deixava de usar a arquitetura mobile.

**Correção:** mobile também é reconhecido até 950 px de largura quando a altura é <=500 px. A mesma condição foi aplicada à camada CSS.

### P1 — Safe-area superior incompleta
A bottom bar já tratava a safe-area inferior, porém o header não incorporava explicitamente `safe-area-inset-top` para uso standalone/PWA.

**Correção:** altura e padding do topbar incluem a safe-area superior.

### P1 — Resumo `Hoje` sujeito a corte
O título e `0% de acerto geral` usavam flex sem proteção de min-width.

**Correção:** grid `auto + minmax(0,1fr)`, texto secundário alinhado à direita e quebra segura.

### P2 — Teclado virtual
A UI não reagia explicitamente ao `visualViewport`.

**Correção:** a v35.16 acompanha `visualViewport.height`, ajusta a altura máxima do bottom sheet e oculta temporariamente a bottom nav quando o teclado ocupa parcela relevante da tela.

## Viewports verificadas
320×568, 360×640, 375×667, 375×812, 390×844, 412×915, 430×932, 768×1024 e 844×390.

## Invariantes
- sem overflow horizontal global;
- bottom nav dentro da viewport;
- Home header, nível e resumo dentro da largura útil;
- reader dock separado da bottom bar;
- texto jurídico e enunciado mobile legíveis;
- desktop permanece fora da camada mobile.

### P0 — Falha real ao montar ferramentas do Banco de Questões
O teste com o `index.html` completo e todos os scripts na ordem de produção encontrou um `NotFoundError`: o adaptador mobile assumia que `.question-layout` era filho direto de `#content` e chamava `insertBefore` com um descendente aninhado.

**Correção:** antes de inserir busca/filtros, o adaptador sobe pela árvore DOM até localizar o ancestral que é filho direto do host. A mesma função passa a funcionar tanto no harness simples quanto no renderer real.

**Regressão:** `tests/v35_mobile_real_app.py` autentica um usuário de teste na aplicação completa, abre Home e Banco de Questões em 390×844 e valida bounded layout + montagem das ferramentas mobile sem page error.
