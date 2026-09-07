# OAB Focus SUPER v27

A v27 mantém o leitor amplo da v26 e adiciona uma **Trilha Guiada Progressiva** para organizar o estudo da 1ª fase da OAB sem reduzir o material jurídico.

## O que muda na v27

- Estrutura de progressão: **Disciplina → Capítulo → Unidade/Subtema**.
- Estados claros: Disponível, Em estudo, Questões pendentes, Concluído e Bloqueado.
- Liberação da próxima unidade por **leitura concluída + até 3 questões especificamente validadas**, quando existirem.
- Erros não bloqueiam o avanço; alimentam o histórico/revisão.
- Unidade sem questão FGV/OAB específica não recebe questão de outro tema como requisito.
- Capítulos extensos ficam recolhidos por padrão; somente o capítulo ativo é expandido.
- Busca na trilha abre automaticamente os capítulos correspondentes.
- `Índice` do leitor passa a funcionar como `Trilha` interna.
- Consulta livre, banco livre, revisão inteligente e simulado continuam modos separados.
- Leitor amplo da v26 e sistema de grifagem permanecem preservados.

## Preservação

- Material jurídico integral preservado.
- **2.336 questões** preservadas.
- Mapas mentais continuam removidos.
- Patches v15–v26 continuam carregados antes da v27.

## QA

- `node --check data/v27-patch.js`: aprovado.
- `37` testes automatizados v26+v27: aprovados.
- Chromium real: sem erros JavaScript no fluxo auditado.
- Mobile 360/390/430/768 px: sem overflow horizontal no leitor.

Detalhes: `QA_ENGENHARIA_v27.md` e `PESQUISA_APLICADA_v27.md`.

## Atualização do GitHub

Destino configurado no atualizador:

```text
C:\Users\endoa\Documents\GitHub\OAB-FOCUS
```

1. Extraia o ZIP inteiro.
2. Abra a pasta `OAB_Focus_SUPER_v27_GITHUB`.
3. Execute `ATUALIZAR_GITHUB.cmd`.
4. Confira `Changes` no GitHub Desktop.
5. Use o resumo `OAB Focus v27 - trilha progressiva por dominio`.
6. `Commit to main` → `Push origin`.
7. No site publicado, use `Ctrl + F5`.
