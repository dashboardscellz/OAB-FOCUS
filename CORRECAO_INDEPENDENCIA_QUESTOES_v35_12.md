# OAB Focus v35.12 — Independência entre Prepare-se e Banco de Questões

## Problema observado
O Prepare-se abre cadernos contextuais com `questionIds` e `studyContext` estritos para a unidade recomendada. Esse contexto permanecia em `qFilters` mesmo depois de o aluno sair do fluxo guiado. Ao tocar na aba principal **Questões**, o mesmo caderno continuava ativo e dava a impressão de que o banco inteiro estava preso ao plano do Prepare-se.

## Regra funcional
- **Prepare-se / leitor / trilha → prática contextual:** continua restrita às questões específicas da unidade.
- **Aba principal Questões:** é um banco independente. Nunca herda `questionIds` nem `studyContext` do Prepare-se.
- Os filtros escolhidos manualmente no banco (disciplina, assunto, prova, status e busca) são mantidos enquanto a sessão estiver aberta.
- Voltar ao Prepare-se e resolver a prática recomendada não apaga os filtros do banco.
- Ao retornar à aba Questões, os filtros independentes anteriores são restaurados.
- Alterar manualmente qualquer filtro enquanto um caderno contextual estiver aberto encerra o contexto guiado e passa a operar como banco livre.

## Implementação
Nova camada `data/v35-question-navigation.js`:
- mantém `bankFilters` separado da prática contextual;
- usa `mode = bank | context`;
- intercepta apenas a navegação principal para **Questões**;
- preserva `OAB_STATE.openQuestionContext()` para práticas estritas de trilha;
- restaura o banco no botão **Ver banco completo**;
- não persiste filtros em Firebase e não mistura filtros entre contas.

## Critério de regressão
O teste deve provar simultaneamente:
1. um caderno de Constitucional aberto pelo Prepare-se contém somente Constitucional;
2. o banco livre pode estar filtrado para Processo Penal / busca "inquérito";
3. depois de usar o Prepare-se, tocar na aba Questões restaura Processo Penal / "inquérito" sem `questionIds` e sem `studyContext`;
4. voltar à prática do Prepare-se continua restrito à unidade indicada.
