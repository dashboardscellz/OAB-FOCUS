# PROMPT MESTRE — AVALIAÇÃO FINAL DO MOTOR DE QUESTÕES — v35.18

## Objetivo
Auditar e corrigir o motor autoral do OAB Focus para que cada questão tenha **coerência real entre enunciado, tópico, regra jurídica e alternativas**, sem repetição mecânica e sem carregar anotações internas do material para a prova.

## Regras obrigatórias
1. O enunciado deve tratar do mesmo instituto jurídico que fundamenta a alternativa correta. Um cenário de tentativa, legítima defesa, contrato, licitação ou qualquer outro instituto não pode ser usado apenas porque pertence à mesma disciplina.
2. As alternativas devem responder ao problema narrado. É proibido combinar um enunciado sobre um tema com opções retiradas de regra diversa.
3. Remover de qualquer questão autoral expressões editoriais como `OBS:`, `CAIU NA OAB`, `NA OAB` e números de prova. Essas marcações podem existir no material-fonte, mas não podem aparecer no enunciado, alternativas, comentário ou pesquisa da questão.
4. Não usar a própria marcação de prova como número jurídico para gerar distratores. Números só podem ser alterados quando forem claramente prazo, percentual ou quantidade juridicamente relevante.
5. Evitar alternativas repetidas e também **quase repetidas**. Se duas opções diferirem apenas por uma palavra, número de prova ou negação mínima e preservarem praticamente todo o texto, a questão deve ser refeita.
6. A diversidade não pode ser obtida trocando somente nome, cidade ou data. Variar abertura, estrutura e comando, preservando pertinência semântica.
7. Quando não houver cenário específico seguro para a regra, usar um caso neutro centrado no próprio tópico, em vez de inventar fatos de outro instituto.
8. Distratores devem alterar requisito, efeito, alcance, modalidade ou condição da própria regra. Não criar fatos ou fundamentos externos desnecessários.
9. A memória antirrepetição deve comparar novas questões com as recentes do mesmo campo e rejeitar similaridade excessiva de enunciados.
10. Antes de liberar a versão, reproduzir o caso reportado pelo usuário, executar testes de coerência, diversidade e similaridade, além das suítes de regressão existentes.

## Critério de aprovação
A versão só pode ser entregue quando o caso reportado não reproduzir o defeito, nenhuma questão autoral testada contiver `CAIU NA OAB`, as alternativas forem distintas e relacionadas ao mesmo problema jurídico, e os testes existentes continuarem verdes.
