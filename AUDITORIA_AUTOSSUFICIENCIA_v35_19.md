# OAB Focus v35.19 — Auditoria de autossuficiência das questões autorais

## Defeito reproduzido
A unidade “Tempo do Crime” continha a regra geral e, logo depois, um exemplo com Pedro e Matheus. O extrator considerava a frase normativa geral incompleta por causa de uma limitação na detecção do verbo acentuado “é” e acabava escolhendo a conclusão do exemplo: “Para fins penais, o crime foi praticado no momento da ação de Pedro”. O gerador, em seguida, combinava essa conclusão com um cenário genérico sobre Clara e Felipe. O resultado era uma alternativa correta com personagem ausente do enunciado.

## Correções v35.19
- correção do extrator para reconhecer proposições normativas com “é”/“são”;
- preferência pela regra geral do tópico em vez da conclusão individual de exemplo;
- cenário específico para Tempo do Crime com conduta e resultado em momentos distintos;
- distratores específicos de teoria da atividade, sem frases genéricas vazias;
- auditor de personagem órfão antes de liberar a questão;
- auditor de fatos operacionais mínimos para questões de Tempo do Crime;
- prompt-mestre de autossuficiência com rejeição obrigatória.
