# QA Engenharia — OAB Focus v14.3

## Ajuste aplicado
- Navegação lateral desktop com rolagem vertical independente.
- Logo e bloco inferior (nível/XP/Sair) permanecem fora da área rolável.
- Rolagem por mouse, touchpad e barra de rolagem.
- Scrollbar fina e discreta, visível quando necessário.
- `overscroll-behavior: contain` evita transferir involuntariamente a rolagem do menu para o conteúdo principal.
- Nenhum conteúdo, rota ou funcionalidade foi removido.

## Responsividade
- Regra aplicada apenas à sidebar desktop existente.
- Em telas <= 860 px a sidebar continua substituída pela navegação móvel já existente.

## Verificação estrutural
- `index.html` presente.
- Pastas de mapas continuam ausentes conforme v14.2.
- Alteração restrita à camada visual/CSS da navegação lateral.
