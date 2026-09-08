# OAB Focus v35.5 — Taxonomia Pedagógica Global

Data: 2026-09-08
Base: v35.4
Status: aprovado em conversa pelo comando do usuário para aplicar o critério a todos os assuntos.

## Objetivo

Substituir a regra implícita “todo heading/subheading vira uma unidade” por uma taxonomia pedagógica que produza unidades juridicamente coerentes e suficientemente completas, sem reduzir o material-fonte.

## Regras

1. O conteúdo jurídico integral permanece intacto.
2. Headings hierarquicamente subordinados (1.1, 1.2, 1.2.1 etc.) ficam dentro da unidade-mãe por padrão.
3. Linhas numeradas que sejam itens de lista, frases, datas, exemplos ou marcações “CAIU NA OAB” não viram unidades.
4. Capítulos coerentes e curtos podem ser uma única unidade.
5. Capítulos longos são agrupados em macrounidades por hierarquia e densidade; microblocos dependentes como conceito, características, requisitos, modalidades, efeitos e limites não são tratados isoladamente quando o conjunto é o verdadeiro objeto de estudo.
6. Séries de institutos juridicamente autônomos podem permanecer separadas (ex.: remédios constitucionais, crimes contra a vida, contratos em espécie).
7. Unidades enormes podem ser subdivididas apenas em fronteiras hierárquicas confiáveis.
8. Questões strict de antigos microtópicos são agregadas à nova unidade correspondente; nunca se puxa questão apenas por pertencer à mesma disciplina.
9. Progresso antigo é compatível: uma nova unidade só é considerada concluída por legado quando os microtópicos que ela agregou estavam concluídos; novas conclusões recebem marcador de taxonomia v35.5.
10. Grifos, notas, posições de leitura, Firebase, ranking, revisão, Prepare-se e banco livre permanecem.

## Exemplo obrigatório — Teoria da Constituição

A unidade “Poder Constituinte” deve abranger, em uma única leitura pedagógica, conceito, originário, derivado, modalidades e limites correlatos. “Poder Constituinte Originário” e “Poder Constituinte Derivado” não aparecem como unidades independentes só porque são headings 1.1 e 1.2.

Outros fenômenos da Teoria da Constituição podem formar macrounidades próprias quando juridicamente distintos, como revogação/recepção/mutação e eficácia das normas constitucionais.

## Estratégias por capítulo

- `whole`: capítulo inteiro é uma unidade.
- `top`: cada heading principal representa instituto autônomo.
- `cluster`: headings principais são agrupados por hierarquia, densidade e dependência semântica.
- `custom`: agrupamentos jurídicos explícitos para capítulos em que a estrutura-fonte não reflete bem o estudo.

A estratégia padrão é `cluster`; capítulos sem teoria confiável não são artificialmente fatiados.
