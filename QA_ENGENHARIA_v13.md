# QA de Engenharia — OAB Focus v13

## Mudanças estruturais

- A área **Estudar** passou de assuntos gigantes para navegação em **disciplina → capítulo → subassunto**.
- A categorização é derivada dos títulos reais existentes no material integral. O texto jurídico não foi resumido para criar os subassuntos; os itens de navegação apenas apontam para o ponto correspondente dentro do conteúdo completo.
- Quando uma disciplina ainda não possui material explicativo específico, o site informa isso e mantém legislação/mapas como consulta, sem fingir que existe teoria explicada.
- **Mapas mentais** continuam separados como revisão visual.
- **Legislação e súmulas** permanecem como consulta secundária.

## Retomada de leitura

A posição de leitura é salva por:

- disciplina;
- capítulo/unidade;
- seção do material;
- bloco textual;
- subtítulo mais próximo;
- posição relativa de rolagem.

Isso evita depender apenas de pixels e melhora a retomada ao alternar entre computador e celular.

## Grifos

- Seleção de texto no material explicado.
- Três cores: amarelo, verde e azul.
- Persistência por usuário no Firebase dentro do objeto de progresso.
- Clique em um grifo para removê-lo.
- O texto original do material não é alterado.

## Mais cobrados

O ranking usa o banco atual somente nas 12 edições com cobertura suficiente definidas para a análise:

30º, 31º, 32º, 33º, 34º, 35º, 36º, 37º, 43º, 44º, 45º e 46º EOU.

A pontuação de apresentação cruza:

1. presença do tema nessas provas;
2. quantidade de questões no recorte;
3. marcações do tipo “Caiu na OAB” encontradas no material correspondente.

A interface deixa explícito que recorrência histórica não é previsão da próxima prova.

## Prepare-se

Foram implementados somente quatro modelos-base:

- 30 dias;
- 60 dias;
- 90 dias;
- 180 dias.

O plano considera:

- prova-alvo;
- tempo disponível por dia;
- dias de estudo por semana;
- recorrência histórica;
- desempenho do próprio usuário;
- conteúdo ainda pouco estudado;
- erros acumulados;
- grifos salvos.

O planejador aponta para o **material integral**; não cria resumos substitutos.

## Responsividade

- O mesmo site atende desktop, tablet e celular.
- Capítulos e subassuntos passam para uma coluna em telas estreitas.
- O “Prepare-se” troca de quatro colunas para duas e depois uma.
- Botões de subassuntos e ferramentas de grifo recebem alvos maiores em telas móveis.
- A barra inferior móvel inclui o acesso direto ao Prepare-se.

## Validações executadas

- JavaScript verificado com `node --check` nos blocos inline.
- Estrutura de pastas preservada (`data/`, `maps/`).
- Regras do Firebase não precisaram ser alteradas, pois os novos dados ficam dentro do progresso individual já permitido pelas regras da v12.
