# OAB Focus v33 — QA do login por largura + altura

## Problema reproduzido
Em desktops largos porém baixos (ex.: 1366×607), o login entrava no layout desktop completo porque os breakpoints consideravam apenas largura. Isso fazia o card ultrapassar o primeiro viewport e o showcase institucional ficar verticalmente comprimido/cortado.

## Causa raiz
A responsividade do login era unidimensional: media queries apenas por `max-width`. Em 1366×607 o sistema tratava a tela como desktop amplo, embora não houvesse altura útil para foto, biografia completa, benefícios e card de acesso simultaneamente.

## Correção v33
- Adicionado modo compacto para `min-width:1101px` + `max-height:720px`.
- Mantida a proporção horizontal da v32; a correção ocorre verticalmente.
- Card reduz margens/paddings/alturas sem perder campos ou ações.
- Foto e tipografia institucional compactam de forma proporcional.
- Em `max-height:630px`, elementos editoriais secundários são ocultados para manter o acesso completo no primeiro viewport.
- Em desktops altos (ex.: 1440×900), a apresentação completa continua visível.
- Tablet/mobile seguem os breakpoints já existentes por largura.

## Medições verificadas
### 1366×607
- ScrollWidth: 1366px (sem overflow horizontal).
- ScrollHeight: 607px (sem rolagem vertical na tela de acesso).
- Card: y≈61.6px; altura≈483.7px; inteiramente dentro do primeiro viewport.
- Showcase: altura=607px.

### 1366×768
- Card completo dentro do viewport.
- Apresentação institucional completa preservada.

### 390×844
- Sem overflow horizontal.
- Layout empilhado preservado; rolagem vertical é intencional no mobile.

## Testes
- `tests/v33_login_height.py`: 13 testes.
- Suítes anteriores preservadas: v26, v27, v28, v29, v30, v32.
