# OAB Focus v36 — Preparação Principal para a 1ª Fase

## Objetivo
Transformar a v35.9 de ferramenta complementar forte em uma plataforma de preparação autônoma muito mais robusta para a 1ª fase, sem prometer aprovação e sem esconder limitações. A versão deve priorizar atualização jurídica, cobertura proporcional ao peso da FGV, direção diária, retenção, prática e transparência de origem.

## Princípios de produto
1. **Atualização jurídica antes de estética.** Conteúdo revogado ou desatualizado bloqueia release.
2. **Cobertura proporcional à prova.** O peso é derivado da prova oficial mais recente disponível no banco (47º EOU) e nunca tratado como previsão absoluta.
3. **FGV real em primeiro lugar.** Questões oficiais têm prioridade; autorais são complementares e sempre identificadas.
4. **Retenção + cobertura + direção.** O sistema deve dizer o que estudar agora, por quê, quando revisar e como medir domínio.
5. **Preservação.** Não apagar banco, progresso, grifos, caderno de erros, trilha, responsividade, Firebase ou material útil existente.

## Arquitetura
A v36 é uma camada aditiva carregada após a v35.9. Ela cria três módulos separados: `v36-content-governance.js` para correções e metadados jurídicos; `v36-primary-prep.js` para prioridade adaptativa, diagnóstico e simulado ponderado; `v36-curated-questions.js` para questões autorais revisadas de áreas que foram aprofundadas. O HTML existente continua sendo a espinha dorsal; a v36 apenas substitui comportamentos pontuais e adiciona dados.

## Correções jurídicas obrigatórias
### Seguro em Direito Civil
O bloco legado dos arts. 757 a 802 do Código Civil deixa de aparecer como legislação vigente. A v36 substitui esse trecho por uma seção própria da Lei 15.040/2024 e registra explicitamente que os arts. 757–802 do CC foram revogados pelo art. 133 da nova lei, vigente desde 11/12/2025. O conteúdo destaca, sem reproduzir a lei inteira, objeto e âmbito, formação e interpretação, risco/prêmio, sinistro, seguros de pessoas, prescrição, foro e título executivo de seguro de vida.

### Empresarial
Os cinco capítulos criados na v35.9 deixam de ser mínimos e passam a ter profundidade de preparação: teoria, pontos de prova, pegadinhas, base normativa e revisão ativa. Meta mínima de 800 palavras por capítulo teórico após a aplicação da v36.

## Motor de prioridade v36
O motor calcula prioridade por tópico com seis sinais:
- peso da disciplina na 47ª OAB (derivado do banco oficial de 80 questões, com fallback explícito);
- recorrência histórica no banco completo;
- fraqueza individual do aluno;
- retenção/revisão vencida;
- cobertura ainda não estudada;
- proximidade da prova.

Nenhum sinal sozinho decide a trilha. O resultado deve expor ao aluno a justificativa da prioridade.

## Diagnóstico inicial
Usuários com baixa amostra recebem opção de diagnóstico ponderado por disciplina. O diagnóstico usa questões válidas e tenta respeitar a distribuição da prova mais recente, sem usar questões autorais quando houver questões oficiais/históricas suficientes.

## Simulado de 80 questões
O simulado v36 monta uma prova de 80 itens seguindo a distribuição por disciplina observada na 47ª OAB, com preferência por questões oficiais/históricas, evitando itens anulados/sem gabarito válido e reduzindo repetição de questões já vistas quando houver alternativas suficientes.

## Questões autorais
Autorais novas da v36 devem ter:
- caso concreto curto;
- quatro alternativas plausíveis;
- uma única resposta juridicamente sustentável;
- comentário por alternativa;
- fundamento normativo;
- `sourceType: 'authorial-reviewed'`;
- `excludeFromHistoricalStats: true`;
- data e versão de revisão.

A v36 não converte questão autoral em “oficial” nem mistura autorais nas estatísticas históricas da FGV.

## Transparência
A v36 cria registro de proveniência por bloco corrigido: fonte normativa, órgão, data de revisão, status e observações. Questões mantêm rótulos de oficial/autoral e comentário revisado/legado.

## Critérios de bloqueio
O release falha se ocorrer qualquer um dos seguintes:
- arts. 757–802 do CC ainda aparecem como legislação vigente no trecho de Seguro;
- Lei 15.040/2024 não aparece no material de Seguro;
- algum dos cinco capítulos de Empresarial ficar com menos de 800 palavras de teoria;
- quantidade do banco cair abaixo da baseline da v35.9;
- a 47ª OAB deixar de conter 80 itens;
- simulado ponderado não somar 80 questões;
- questão autoral v36 perder identificação/proveniência;
- scripts v36 não carregarem depois da v35;
- testes anteriores estáveis sofrerem regressão.

## Não-objetivos
- Não prometer aprovação.
- Não criar 2ª fase.
- Não substituir conteúdo oficial por resumo superficial.
- Não copiar conteúdo protegido de concorrentes.
- Não reescrever integralmente a arquitetura legada nesta versão.
