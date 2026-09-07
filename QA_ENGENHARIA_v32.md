# OAB Focus v32 — QA de layout do login

## Objetivo
Corrigir a regressão visual introduzida na v31 sem alterar a arquitetura funcional da v30.

## Estratégia
- Base funcional: v30.
- A v31 não é carregada na v32.
- O showcase institucional da v30 foi preservado.
- Apenas a distribuição externa do login e a largura do card de acesso foram refinadas.

## Correções
- Desktop usa uma área de login `clamp(470px, 36vw, 560px)`, mantendo o lado institucional predominante.
- O card de acesso usa até 512px e mantém largura segura dos campos e do controle de senha.
- Abaixo de 1100px a composição muda deliberadamente para pilha antes que o showcase fique comprimido.
- Mobile mantém o card dentro do viewport sem overflow horizontal.
- Ao exibir o login, a rolagem é restaurada ao topo mesmo com `html { scroll-behavior:smooth }`, evitando logo/cabeçalho parcialmente cortados.

## Medição em 1366×595
- Showcase: ~874px.
- Área do formulário: ~492px.
- Card de login: ~444px.
- Área textual do fundador: ~402px.
- Overflow horizontal: 0px.

## Verificações
- 1366×595: composição visual revisada com screenshot real do HTML/CSS do projeto.
- Breakpoints verificados: 1180, 980, 900, 768, 430, 390 e 360px.
- Suite total do projeto: 90 testes.
- Mapas mentais permanecem removidos.
