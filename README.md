# OAB Focus SUPER v29

A v29 preserva a arquitetura pedagógica das versões anteriores e faz uma auditoria responsiva global da interface. O objetivo é eliminar desalinhamentos, compressão excessiva, texto escapando de blocos e quebras de layout em larguras intermediárias — não apenas no Modo Foco.

## Principais mudanças

- Modo Foco realmente centralizado no viewport, sem reservar espaço invisível da sidebar.
- Questões reorganizadas antes de ficarem comprimidas em desktop/tablet estreito.
- Prepare-se com grids progressivos e formulários que respeitam a largura disponível.
- Alto rendimento responsivo em telas intermediárias.
- Ranking e Administração deixam layouts tabulares rígidos mais cedo.
- Login corrigido na faixa próxima de 920 px.
- Proteções para títulos, e-mails, identificadores e outros textos excepcionalmente longos.
- Tabelas largas do material jurídico usam overflow interno em vez de deslocar a página.
- Blocos de código, citações, imagens, vídeos e canvas respeitam a área útil.
- Grifador e botão de saída do foco respeitam viewport e safe-area.
- Material jurídico integral, trilha pedagógica e modos de estudo preservados.
- Mapas mentais continuam removidos.

## QA

- `node --check data/v29-patch.js`.
- `pytest -q tests/*.py`.
- Auditoria visual em Chromium para Foco 1366 px, Administração/Alto rendimento/Prepare-se 1024 px, Login 920 px, Questões 900 px e Ranking 360 px.

Detalhes: `QA_ENGENHARIA_v29.md`.

## Atualização do GitHub

Destino configurado:

```text
C:\Users\endoa\Documents\GitHub\OAB-FOCUS
```

1. Extraia o ZIP inteiro.
2. Abra `OAB_Focus_SUPER_v29_GITHUB`.
3. Execute `ATUALIZAR_GITHUB.cmd` ou use o `robocopy` habitual.
4. Confira `Changes` no GitHub Desktop.
5. Summary: `OAB Focus v29 - auditoria responsiva global`.
6. `Commit to main` → `Push origin`.
7. Atualize o site com `Ctrl + F5`.
