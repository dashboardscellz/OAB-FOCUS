# QA de Engenharia — OAB Focus SUPER v19

## Escopo

A v19 preserva a arquitetura pedagógica e funcional da v18 e aplica uma consolidação visual global com base na auditoria real do CSS.

## Integridade funcional

- Versão carregada em Chromium: `19.0`.
- `window.__OAB_BOOT_OK = true`.
- Banco preservado: **2.336 questões**.
- Material integral, high-yield e mapas de vínculo continuam presentes.
- Nenhuma pasta `maps`, `maps-hd` ou `map-manifest.js` foi reintroduzida.
- Prepare-se v18, Revisão inteligente e mapeamento estrito material ↔ questões permanecem intactos.

## Consolidação do design system

Métricas do CSS do `index.html` depois da correção:

- `:root` principal: **1**.
- Cores hex distintas: **38**.
- Tamanhos `font-size` soltos em `rem`: **0**; a interface passa a usar a escala tipográfica por tokens.
- Tokens tipográficos usados: 8 famílias de nível no CSS legado normalizado, com a escala completa definida no `:root`.
- `border-radius` literal em px: **0**; somente `--r-sm`, `--r-md`, `--r-lg`, `--r-pill`.
- Sombras normalizadas para `--shadow-sm`, `--shadow-md`, `--shadow-lg`.
- Padding/gap em px normalizados para múltiplos de 4.
- Gradientes no CSS legado: reduzidos de 22 para **7**, preservados apenas em momentos visuais com propósito.
- `--muted:#5a6675` sobre `--paper:#fbfaf7`: contraste calculado ≈ **5,60:1**, acima de WCAG AA para texto normal.

## Tipografia

- Inter é carregada no `<head>` via Google Fonts, pesos 400, 500, 600, 700, 800 e 900.
- `body` usa `var(--font-ui)`.
- O leitor mantém `Georgia / Times New Roman` como fonte editorial de leitura longa e Inter na interface/títulos.

## Dark mode

- Implementado `data-theme="dark"` global.
- Toggle persistente incluído no topbar.
- Em QA, o toggle alterou o tema de `light` para `dark` e mudou os fundos do app e do artigo para os tokens escuros.
- O dark mode global é sincronizado com o modo noturno do leitor.

## Leitor v19

Teste real em Chromium com um capítulo de Direito Penal:

- capítulo aberto: `Eficácia da Lei Penal no Tempo e no Espaço`;
- leitor v18 preservado e camada v19 ativa;
- botão `← Voltar` presente;
- índice lateral presente;
- dock de grifo presente;
- artigo central com raio de 16 px via token e sombra `sm`;
- zero overflow horizontal em desktop;
- tipografia computada do app: `Inter, ui-sans-serif, ...`.

O novo acabamento editorial usa:

- fundo geral quente e discreto;
- artigo central com borda e sombra mínimas;
- vinho apenas como sinal de hierarquia/progresso;
- títulos com Inter;
- corpo jurídico em fonte serifada;
- legislação em bloco editorial quente;
- índice e painel lateral menos competitivos.

## Regressão da grifagem

- seleção real de texto capturada pelo motor da v18;
- aplicação de amarelo produziu marcação no artigo;
- a v19 não substitui nem remove as rotinas de persistência da v18.

## Mobile

Viewport validado: **390 × 844**.

- largura do documento: 390 px;
- largura do viewport: 390 px;
- overflow horizontal: **0**;
- artigo ocupa 390 px;
- dock de grifo: 370 px, permanecendo dentro da tela.

## Testes sintáticos

`node --check` aprovado em todos os arquivos `data/*.js`, inclusive:

- `v15-patch.js`
- `v16-patch.js`
- `v17-patch.js`
- `v18-patch.js`
- `v19-patch.js`
- arquivos de dados e mapas de questões/estudo.

## Atualizador

`ATUALIZAR_GITHUB.cmd` atualizado para v19 e validando `data/v19-patch.js` junto das dependências anteriores.

Destino:

`C:\Users\endoa\Documents\GitHub\OAB-FOCUS`
