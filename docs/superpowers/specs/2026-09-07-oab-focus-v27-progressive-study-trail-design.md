# OAB Focus v27 — Trilha de Estudo Progressiva

Data: 07/09/2026
Base: v26

## Objetivo

Aplicar evidências de aprendizagem e UX sem reconstruir o leitor amplo da v26. A v27 transforma o antigo “Índice” em uma **Trilha de Estudo** com progressão pedagógica clara, preservando consulta livre ao material integral e mantendo separados estudo inicial, prática contextual, revisão inteligente, banco livre e simulado.

## Princípios aplicados

1. **Recuperação ativa após a exposição**: questões específicas entram depois que a unidade foi estudada.
2. **Prática distribuída e revisão em modo separado**: erros e acertos alimentam a Revisão inteligente, mas não travam o primeiro avanço.
3. **Sem barreira por percentual de acerto**: o desbloqueio exige exposição + uma amostra mínima de questões validadas, não uma nota mínima.
4. **Progressive disclosure**: o leitor continua com uma tarefa por tela; Trilha, Seu estudo, Grifos e Anotações continuam em telas internas.
5. **Preservação jurídica integral**: nenhum conteúdo é resumido ou substituído.

## Unidade pedagógica

Estrutura visual e de progresso:

`Disciplina → Capítulo → Unidade/Subassunto → Material → Questões contextuais → Conclusão → Próxima unidade`

Quando um capítulo não tem subassuntos confiáveis, o próprio capítulo vira a unidade.

## Estados

- **Disponível**: primeira unidade ainda não concluída e liberada para início.
- **Em estudo**: unidade aberta/iniciada, porém exposição ainda não marcada como concluída.
- **Questões pendentes**: exposição concluída; falta atingir a amostra mínima de prática validada.
- **Concluído**: exposição concluída + amostra mínima respondida, ou exposição concluída quando não existe questão específica validada.
- **Bloqueado**: unidade futura cuja precedente ainda não concluiu o ciclo mínimo.

Unidades já concluídas em versões anteriores nunca voltam a aparecer como bloqueadas.

## Regra de liberação

Para uma unidade com questões FGV/OAB especificamente validadas no mapa estrito:

- 1 questão disponível → responder 1;
- 2 questões → responder 2;
- 3 ou mais → responder 3.

Acerto ou erro contam como tentativa para desbloqueio. Erros continuam sendo sinais de fragilidade para Revisão inteligente e não criam um bloqueio artificial.

Quando não existem questões específicas validadas, basta concluir a exposição. Questões autorais de reforço permanecem opcionais e claramente rotuladas; elas não são usadas como requisito obrigatório de progressão.

## Acesso livre versus trilha

A trilha é sequencial. A **Disciplina completa** continua disponível como consulta livre e não é tratada como atalho de conclusão. O Banco da disciplina também permanece um modo livre.

## Trilha interna do leitor

O botão “Índice” da v26 passa a exibir “Trilha”. A tela interna mostra:

- progresso da disciplina;
- capítulos agrupados;
- estado de cada unidade;
- número de questões específicas e quantidade já respondida;
- ação principal somente na unidade liberada;
- unidades futuras visualmente bloqueadas.

O leitor continua amplo, sem colunas laterais.

## Seu estudo

A tela recebe um bloco pedagógico no topo com:

- estado atual;
- leitura concluída ou pendente;
- amostra de questões `respondidas / exigidas`;
- explicação explícita de que nota não bloqueia avanço;
- próxima ação contextual.

## Rodapé do leitor

A navegação “próximo” da trilha é controlada pela regra acima. Antes da conclusão, o próximo conteúdo aparece bloqueado com orientação objetiva. Após cumprir os requisitos, o botão “Próxima unidade” atravessa inclusive a fronteira entre capítulos.

## Mobile

- uma coluna real;
- estados e contadores sem texto espremido;
- botões de unidade com área de toque adequada;
- nenhuma lateral reaparece;
- zero overflow horizontal em 360, 390, 430 e 768 px.

## Não fazer

- não exigir 100% das questões de um tema;
- não exigir percentual mínimo de acerto para avançar;
- não contar questão autoral como requisito obrigatório quando não há questão real validada;
- não misturar revisão adaptativa com estudo inicial;
- não reintroduzir mapas;
- não resumir o material jurídico;
- não voltar ao layout de três colunas.
