# Auditoria global de layout — OAB Focus v36.2

## Escopo

Correção sistêmica dos problemas apontados após a v36.1: quadros/tabelas desajustados em múltiplas disciplinas, filtros com dois estados verdes simultâneos e textos técnicos de manutenção aparecendo para o aluno.

## Correções aplicadas

- O renderizador do leitor passou a agrupar regiões tabulares reconhecíveis em uma única estrutura semântica (`table`) em vez de fragmentá-las em caixas independentes.
- Quadros cujo formato não pode ser inferido com segurança continuam preservados, sem reordenação jurídica automática, usando bloco monoespaçado com rolagem interna.
- O aviso público “Revisão estrutural pendente” foi removido da experiência do aluno; o estado editorial permanece apenas como metadado técnico (`data-review-status="source-layout"`).
- Tabelas semânticas usam rolagem horizontal interna em telas estreitas e não provocam overflow horizontal da página.
- A sincronização de filtros remove o estado visual anterior antes de aplicar o novo, impedindo dois botões verdes simultâneos.
- Foram removidos da interface pública textos de bastidor como “O que faz sentido aqui”, “O que não faz sentido aqui”, “Área otimizada”, “Plano otimizado”, “DIREÇÃO V36” e equivalentes técnicos.
- O espaço ocupado por explicações internas foi devolvido ao conteúdo de estudo.

## Preservação

Não houve intenção de alterar conteúdo jurídico, Firebase, autenticação, banco de questões, trilha pedagógica ou dados de progresso nesta rodada. A estratégia para conteúdo tabular incerto continua sendo preservar a fonte, nunca reordenar por heurística sem confiança estrutural.

## Verificação

A suíte final foi dividida em lotes por limite de execução do ambiente. Resultado consolidado: 270 testes aprovados e 0 falhas após a atualização do teste legado da v36.1 para refletir a nova regra editorial da v36.2.
