# OAB Focus v35.2 — Auditoria e redesenho do leitor

## Problema observado

O leitor da v35.1 apresentava composição fragmentada: excesso de espaço morto, cronômetros visualmente separados do cabeçalho, coluna útil estreita, material explicado com aparência de card dentro de card e barra de grifo deslocada para o canto inferior.

## Causa técnica

O leitor atual é resultado da composição de camadas v18, v26, v34 e v35. A v26 reconstrói o shell de leitura e a v34 injeta o temporizador depois da renderização; estilos herdados de versões anteriores continuavam determinando larguras, bordas e posição da barra de grifo.

## Correções v35.2

- superfície central de leitura com frame de até 1000 px;
- medida textual principal de 760 px;
- cabeçalho, tempos, metadados e material alinhados na mesma arquitetura;
- temporizador movido para antes dos metadados do cabeçalho;
- material explicado plano, sem card dentro de card;
- tipografia e espaçamento refinados;
- barra de grifo centralizada e reserva de espaço inferior para não cobrir o texto;
- toolbar alinhada à largura do artigo;
- mobile em coluna única, cronômetros 2x2 e grifo acima da bottom navigation;
- cache-bust dos assets v35 atualizado para `?v=35.2`.

## Preservação funcional

Não foram alterados conteúdo jurídico, Firebase, isolamento de contas, progresso, banco de questões, trilha, lógica de revisão, persistência de grifos ou 47ª OAB.

## Validação

A regressão foi executada por suítes independentes, incluindo testes do leitor, trilha, login, auditoria v34, isolamento de contas e layout v35.
