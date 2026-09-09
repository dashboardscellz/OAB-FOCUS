# OAB Focus v35.14 — Análise do corpus real usado como referência de estilo

A revisão do gerador autoral foi feita sobre o banco real já incorporado ao projeto, não sobre exemplos inventados externamente. O `index.html` contém 2.336 questões e `data/v30-questions.js` contém mais 80 itens do 47º EOU, totalizando 2.416 questões disponíveis como referência estrutural.

No banco principal, a mediana do enunciado é de aproximadamente 81 palavras; 1.240 de 2.336 itens apresentam marcadores típicos de situação concreta, como contratação, ajuizamento, sociedade empresária, advogado, empregado, acusado ou consumidor. Em 1.650 itens aparece comando com “assinale”. O padrão recorrente é: fatos juridicamente relevantes primeiro, controvérsia ou consulta depois e, ao final, comando objetivo.

O 47º EOU reforça esse desenho: grande parte das questões começa por nomes, empresas, órgãos, atos profissionais ou sequências processuais e só então pergunta a consequência jurídica. O motor v35.14 usa essa estrutura como referência, sem copiar personagens ou narrativas do banco.

## Diferença para o gerador antigo
O gerador anterior partia de uma frase do material e perguntava qual alternativa “reproduzia corretamente” essa regra. Os distratores eram frequentemente negação, absolutização ou requisito inexistente. Isso produzia itens reconhecíveis como exercício de apostila, não como problema jurídico FGV.

A v35.14 passa a exigir: cenário ou controvérsia; quatro respostas juridicamente plausíveis; ausência total de referências a “material”, “unidade” ou “conteúdo estudado”; e comentário individualizado após a resposta.
