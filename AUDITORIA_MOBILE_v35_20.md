# OAB Focus v35.20 — Mobile Hardening

Base: v35.19.

Esta versão aplica os 10 ajustes especificados em `CORRECOES_MOBILE_OAB_FOCUS_v35_20.md`, preservando o comportamento desktop.

Principais mudanças:
- toolbar de Estudar respeita safe-area/topbar;
- enunciados quebram linha sem overflow horizontal;
- leitor reserva espaço para bottom-nav + barra de grifo;
- conflito legado de `.reader-top` removido;
- sheet de filtros respeita viewport visual com teclado aberto;
- cartões laterais de questões empilham abaixo de 390px;
- corpo do leitor recebe gutter lateral em mobile;
- inputs de 16px ficam restritos ao contexto mobile;
- fallback de `display:grid` para bottom-nav em `.app-shell`;
- `.home-welcome` é contido à largura mobile.

Cache/versionamento mobile atualizado para `35.20`.
