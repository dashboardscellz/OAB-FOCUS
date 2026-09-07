# OAB Focus SUPER v19

A v19 mantém toda a arquitetura pedagógica e o conteúdo da v18 e aplica a **consolidação visual baseada na auditoria real do CSS**. O objetivo é retirar a aparência de interface construída por patches e criar um design system coerente para o site inteiro.

## Consolidação visual v19

- Inter carregada de verdade pelo Google Fonts nos pesos 400–900, com fallback de sistema.
- Um único `:root` principal com tokens coerentes de marca, neutros, estados, tipografia, espaços, raios e elevação.
- `--paper`, `--ink`, `--muted`, marca vinho e aliases legados passam a apontar para o mesmo sistema.
- Escala visual padronizada: raios `sm/md/lg/pill`, sombras `sm/md/lg` e espaçamento em grade de 4 px.
- Contraste de texto secundário melhorado (`#5a6675` sobre `#fbfaf7`, acima de WCAG AA para texto normal).
- Gradientes decorativos restritos aos momentos de destaque/hero; cards e áreas de estudo usam superfícies sólidas.
- Dark mode global persistente, além da leitura noturna já existente no leitor.
- Componentes principais — navegação, cards, filtros, questões, Prepare-se e modais — usam o mesmo vocabulário visual.

## Leitor v19

- Mantém o leitor e a grifagem estrutural da v18, mas com nova camada editorial mais sóbria.
- Menos sensação de “caixas dentro de caixas”.
- Papel central com borda e sombra discretas, tipografia editorial, largura de leitura controlada e melhor ritmo vertical.
- Índice lateral e painel de progresso mais silenciosos, com vinho apenas como sinal de posição/progresso.
- Legislação ganha tratamento editorial próprio em tom quente, sem competir com a teoria.
- Barra de grifo permanece acessível e integrada à leitura.
- Desktop e mobile recebem ajustes próprios.

## O que continua da v18

- Material jurídico integral preservado.
- **2.336 questões** preservadas.
- Prepare-se em modo **APRENDER DO ZERO**, com pré-requisitos pedagógicos.
- Questões da etapa somente depois da teoria correspondente.
- Revisão inteligente / curva do esquecimento separada do ensino inicial.
- Mapeamento estrito material ↔ questões.
- Grifagem persistente.
- Mapas mentais continuam removidos.

## Arquivos essenciais

```text
index.html
data/
  integral-material.js
  highyield-static.js
  v15-study-map.js
  v15-patch.js
  v16-question-map.js
  v16-patch.js
  v17-patch.js
  v18-patch.js
  v19-patch.js
database.rules.json
.nojekyll
ATUALIZAR_GITHUB.cmd
```

## Atualização do GitHub

Destino configurado no atualizador:

```text
C:\Users\endoa\Documents\GitHub\OAB-FOCUS
```

1. Extraia o ZIP inteiro.
2. Entre na pasta `OAB_Focus_SUPER_v19_GITHUB`.
3. Execute `ATUALIZAR_GITHUB.cmd`.
4. Confira a aba `Changes` no GitHub Desktop.
5. Faça commit com `OAB Focus v19 - consolidacao visual`.
6. Clique em `Push origin`.
7. Na primeira abertura do site publicado, use `Ctrl + F5`.
