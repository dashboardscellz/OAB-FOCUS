# OAB Focus SUPER v28

A v28 mantém a arquitetura ampla da v26 e a Trilha Guiada Progressiva da v27, corrigindo o leitor em viewports intermediárias e saneando falsos subassuntos gerados por tabelas extraídas de PDF.

## Principais mudanças

- Toolbar do leitor reconstruída: navegação principal separada de ajustes de leitura.
- Menu `Leitura` para A−, A+, tema e Modo Foco.
- Breadcrumb único, semântico e navegável.
- Títulos longos e muito longos recebem escala tipográfica própria.
- Card do leitor mais largo, mantendo o texto corrido em largura confortável.
- Linhas tabulares de PDF deixam de virar unidades da Trilha.
- Rotas antigas com falsos subassuntos são saneadas para o capítulo.
- Grifador não invade a última parte do material e respeita mobile.
- Foco por teclado reforçado.
- Conclusão da unidade e domínio adaptativo aparecem como conceitos distintos.
- Erros continuam sem bloquear avanço; alimentam a Revisão Inteligente.
- Material jurídico integral e banco de questões preservados.
- Mapas mentais continuam removidos.

## QA

- `node --check data/v28-patch.js`: aprovado.
- **53 testes automatizados** v26+v27+v28: aprovados.
- v28 testada em 1041×595 e reflow em 320/360/390/430/768 px.

Detalhes: `PESQUISA_APLICADA_v28.md` e `QA_ENGENHARIA_v28.md`.

## Atualização do GitHub

Destino configurado:

```text
C:\Users\endoa\Documents\GitHub\OAB-FOCUS
```

1. Extraia o ZIP inteiro.
2. Abra `OAB_Focus_SUPER_v28_GITHUB`.
3. Execute `ATUALIZAR_GITHUB.cmd` ou use o `robocopy` habitual.
4. Confira `Changes` no GitHub Desktop.
5. Summary: `OAB Focus v28 - leitor resiliente e trilha limpa`.
6. `Commit to main` → `Push origin`.
7. Atualize o site com `Ctrl + F5`.
