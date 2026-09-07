# Pesquisa aplicada — OAB Focus SUPER v27

## Decisão central

A trilha não usa uma nota mínima para impedir o aluno de prosseguir. O avanço exige:

1. **Exposição:** concluir a leitura integral da unidade.
2. **Recuperação ativa:** quando existirem questões FGV/OAB especificamente validadas para aquele microtema, responder uma amostra curta de até 3 questões.

Errar uma questão não bloqueia a próxima unidade. O erro é informação diagnóstica para a Revisão Inteligente.

Quando não existe questão real/específica validada, a plataforma não força uma questão de assunto parecido e não transforma questão autoral em requisito. A leitura concluída libera a próxima etapa e o reforço autoral continua opcional.

## Arquitetura de modos

- **Trilha guiada:** estudo inicial em sequência.
- **Prática da unidade:** questões estritamente vinculadas ao conteúdo recém-estudado.
- **Revisão inteligente:** retorno espaçado e adaptativo baseado em fragilidade/erros.
- **Banco livre:** exploração independente por disciplina/filtro.
- **Simulado:** experiência deliberada de prova.
- **Consulta livre:** material integral acessível sem interferir no estado da trilha.

Esses modos permanecem distintos para evitar mistura de intenção e excesso de controles contextualmente irrelevantes.

## Estados da unidade

- `Disponível`: próxima etapa liberada.
- `Em estudo`: unidade iniciada, leitura ainda não concluída.
- `Questões pendentes`: leitura concluída e amostra mínima ainda incompleta.
- `Concluído`: leitura + prática mínima concluídas, ou leitura concluída quando não existe questão específica validada.
- `Bloqueado`: etapa futura da sequência.

## Progressive disclosure

Disciplinas grandes podem possuir centenas de unidades. Por isso, a v27 não mostra todos os capítulos expandidos ao mesmo tempo:

- capítulo atual/primeiro incompleto: aberto;
- demais capítulos: recolhidos;
- busca: abre automaticamente capítulos com resultados;
- dentro do leitor, a view `Trilha` abre o capítulo da unidade atual.

Nenhum conteúdo é removido; apenas a apresentação é progressivamente revelada.
