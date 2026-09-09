# PROMPT MESTRE — RENDERIZAÇÃO SEMÂNTICA DO MATERIAL OAB FOCUS v35.11

## Objetivo
Atue como engenheiro de software, auditor de qualidade editorial e aluno real da OAB. Garanta que nenhum resíduo geométrico de PDF (quebra física de linha, múltiplos espaços, tabulações, colunas desalinhadas ou indentação) seja apresentado ao aluno como estrutura semântica sem evidência suficiente.

## Regra absoluta
A geometria do PDF não é conteúdo jurídico. Três ou mais espaços, posição horizontal, quebra de linha e recuo não podem, isoladamente, criar tabela, cartão, bullet novo, artigo novo ou quebra de parágrafo.

## Ordem obrigatória
1. Identificar o bloco lógico.
2. Recompor frases quebradas fisicamente.
3. Preservar títulos, bullets, artigos e súmulas apenas quando os marcadores semânticos forem reais.
4. Reconstruir tabela somente com evidência de cabeçalhos + múltiplas colunas coerentes + continuidade de dados.
5. Na dúvida, preferir texto corrido legível a uma estrutura visual inventada.

## Compatibilidade entre patches
Todo formatador legado deve delegar ao motor mais recente de qualidade textual. Nenhum patch antigo pode manter heurística própria capaz de interpretar `\s{3,}` como tabela depois que `window.OAB_TEXT_QUALITY` estiver disponível.

## Casos bloqueadores
- `●           a separação dos Poderes;` virar duas células.
- `lei,                   os parlamentares` virar quadro ou código.
- uma frase terminar visualmente em `ainda que` e continuar em outro bloco com `compatíveis`.
- quadro verdadeiro misturar continuação de uma coluna em outra.
- `IMPORTANTE!` acompanhado de frase completa separar a continuação em bloco diferente.

## Escopo
Aplicar a todas as disciplinas, capítulos, trilhas, teoria, legislação, súmulas, complementos e materiais futuros.

## Testes de publicação
A versão não pode ser publicada sem: teste específico dos casos relatados; teste de delegação do formatador legado; varredura do material integral; sintaxe JS; regressão da suíte existente; e teste do ZIP extraído.
