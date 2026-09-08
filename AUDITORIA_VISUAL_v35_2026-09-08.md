# Auditoria Visual Corretiva — OAB Focus v35

Data: 08/09/2026

## Escopo
Auditoria motivada pelas cinco capturas reportadas após a publicação da v35. O objetivo foi localizar causas sistêmicas, não aplicar ajustes isolados por tela.

## Achados e correções

### 1. Barra contextual invadindo Estudar e Leitor — crítico
**Sintoma:** faixa lateral grande no Estudar, conteúdo comprimido e menu adicional sobreposto aos cartões/controles do leitor.

**Causa-raiz:** `v35-shell.js` ativava a rail para `study`, `reader` e `admin`; o CSS a posicionava com `position: fixed` e compensava o conteúdo com `padding-left: 248px`. Assim, uma navegação duplicada ficava fora do fluxo normal da página e o conteúdo perdia largura útil.

**Correção:** Estudar e Leitor deixaram de ativar a rail v35. Esses fluxos continuam usando suas navegações próprias. A rail ficou restrita à Administração e, nessa área, passou para o fluxo normal em grid/sticky, sem empurrão artificial de 248 px.

### 2. Botão “Mais” com aparência nativa do navegador — alto
**Sintoma:** “Mais” aparecia cinza, com borda padrão, tamanho e tipografia diferentes dos demais itens do menu.

**Causa-raiz:** o CSS usava `.v35-primary-nav > button`, mas “Mais” é filho de `.v35-more-wrap`, não filho direto de `.v35-primary-nav`.

**Correção:** o botão “Mais” passou a compartilhar o mesmo contrato visual, hover e responsividade dos demais botões da navegação.

### 3. Tipografia do leitor quebrando o design system — médio/alto
**Sintoma:** cabeçalhos operacionais como “Material explicado” podiam reaparecer em Georgia/serif enquanto o restante da v35 já usava Inter/sans-serif.

**Causa-raiz:** o design system v35 cobria o corpo e parte dos títulos, mas não sobrescrevia explicitamente todos os seletores legados do leitor.

**Correção:** `study-zone-head h2`, `subtopic-reader-hero h2` e `integral-section-head h2` agora são explicitamente normalizados para Inter no shell v35. A tipografia serifada institucional do login permanece intencionalmente preservada.

### 4. “Simulado 80” preso à contagem — médio
**Sintoma:** a ação principal da tela de questões aparecia como “Simulado 80”, rótulo rígido e inconsistente com a nomenclatura evoluída do projeto.

**Correção:** rótulo alterado para **“Simulado completo”**. O handler e a lógica do simulado não foram modificados.

### 5. Rail administrativa descentralizada — achado preventivo
**Sintoma potencial:** depois de retirar o `fixed`, a regra global `margin-left:0!important` poderia manter o grid administrativo encostado à esquerda em desktop amplo.

**Correção:** o contexto administrativo recebeu centralização explícita dentro do shell de 1240 px. Teste em Chromium confirma rail e conteúdo sem sobreposição e sem overflow.

## O que foi preservado
- Firebase e caminhos de progresso.
- Isolamento de contas v35.
- Banco de questões e 47ª OAB.
- Trilha progressiva, revisão e grifos.
- Login institucional e sua tipografia de marca.
- Navegação mobile com cinco destinos e safe area.
- Ausência dos mapas mentais já determinada nas versões anteriores.

## Regressões adicionadas
Foram adicionados testes para impedir o retorno de:
- rail duplicada em Estudar/Leitor;
- `padding-left:248px` como compensação de layout;
- rail contextual em `position:fixed`;
- botão “Mais” com chrome nativo do navegador;
- rótulo “Simulado 80”;
- serifas legadas em cabeçalhos operacionais do leitor;
- rail administrativa fora do shell central.

## Resultado esperado após publicação
- Estudar ocupa novamente a largura correta, sem a coluna “Mesa de estudos” duplicada.
- Leitor não recebe menu lateral sobre os cartões de sessão/tempo.
- “Mais” fica visualmente igual aos demais itens da barra superior.
- Leitor mantém tipografia operacional coerente.
- Questões exibe “Simulado completo”.

## Rodada 2 — evidências enviadas após a primeira correção

### 1. Abas visitadas permaneciam verdes
**Sintoma:** depois de navegar por Início → Estudar → Prepare-se, mais de uma aba aparecia destacada simultaneamente.

**Causa raiz:** `data/v34-patch.js` acrescenta a classe global `v34-active-state` aos elementos ativos/`aria-current`, porém a classe não é removida das rotas visitadas quando a rota muda. A v35 passou a usar `aria-current="page"` no novo cabeçalho e, por isso, ficou exposta a esse estado legado acumulativo.

**Correção v35.1:** `syncV35Navigation()` limpa `v34-active-state` da navegação v35 antes de aplicar o novo estado; o CSS v35 também neutraliza defensivamente o visual verde legado dentro da navegação principal.

### 2. Home continuava com volume visual da v19
**Sintoma:** grande área vazia no bloco inicial, sombra extensa e painel de nível alto demais, apesar do redesign claro da v35.

**Causa raiz:** a v35 removia o fundo escuro do `.dashboard-hero`, mas não anulava explicitamente `box-shadow` e `border-radius` herdados de versões anteriores. O `.hero-level-panel` também continuava consumindo altura por estilos antigos de tipografia/margens.

**Correção v35.1:** reset explícito de sombra e raio, painel de nível compactado, CTA principal/secundário com hierarquia própria para fundo claro e altura do hero limitada por conteúdo real.

### 3. Risco de o GitHub Pages continuar servindo shell anterior
**Sintoma compatível:** alterações em `v35-shell.css`/`v35-shell.js` podiam não aparecer imediatamente mesmo com `index.html` atualizado.

**Correção v35.1:** os três assets da camada v35 passaram a carregar com query de versão (`?v=35.1`), forçando nova URL de recurso para CSS, autenticação e shell e evitando reutilização do cache anterior.

### Validação adicional
- navegação não acumula estados verdes legados;
- apenas a rota atual permanece ativa;
- botão `Mais` mantém o mesmo contrato visual dos demais itens;
- hero desktop medido abaixo de 190 px no cenário de regressão;
- zero overflow horizontal permanece coberto nos viewports definidos;
- login v32/v33 permaneceu sem alterações estruturais e com suas suítes responsivas preservadas.
