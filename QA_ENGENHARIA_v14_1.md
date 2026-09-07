# QA Engenharia — OAB Focus v14.1

## Bug corrigido

A v14 agrupava teoria e lei por igualdade literal do título. Isso criava capítulos separados para materiais equivalentes, por exemplo:

- `DAS PARTES E DOS PROCURADORES` (lei)
- `Partes e Procuradores` (teoria)

Ao abrir o capítulo proveniente da lei, a interface dizia que o material explicado não estava incorporado, embora ele existisse em outro bloco da mesma disciplina.

## Correção

1. A teoria passa a ser a espinha dorsal da árvore de estudo.
2. Blocos legais semanticamente equivalentes são associados ao capítulo teórico.
3. IDs antigos ficam registrados como aliases para não quebrar `Mais cobrados`, `Prepare-se` e links salvos.
4. Subassuntos numerados têm prioridade sobre cabeçalhos visuais em caixa alta.
5. O recorte hierárquico respeita níveis: `1.` inclui `1.1`, `1.2` etc.; `1.1` inclui seus filhos até o próximo título de mesmo nível ou superior.

## Validações executadas

- sintaxe dos blocos JavaScript: OK (`node --check`);
- `Processo Civil / Partes e Procuradores`: teoria + lei associadas;
- alias `chapter-das-partes-e-dos-procuradores`: resolvível para `Partes e Procuradores`;
- `Intervenção de Terceiros` + `Litisconsórcio`: associados ao capítulo teórico combinado;
- recorte `1. Partes`: mantém `1.1 Incapacidade` e encerra antes de `2. Procuradores`;
- nenhum conteúdo jurídico foi removido.
