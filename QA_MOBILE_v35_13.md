# QA Mobile — OAB Focus v35.13

## Escopo
Validação da nova camada mobile carregada por `data/v35-mobile-app.css` e `data/v35-mobile-app.js`, sem alterar a experiência desktop.

## Casos específicos validados
- login oculto de forma efetiva após autenticação, mesmo contra regras antigas com `display:block!important`;
- Home mobile própria em <=768 px e Home desktop preservada acima desse breakpoint;
- navegação inferior com cinco destinos e safe-area;
- matrizes de viewport: 375×812, 390×844, 430×932 e 768×1024 sem overflow horizontal estrutural;
- Estudar em lista de uma coluna;
- Prepare-se empilhado em uma coluna;
- Banco de Questões com campo de busca e bottom sheet de filtros;
- painel real de filtros é **movido**, não clonado, preservando listeners/estado;
- busca mobile encaminha o valor ao `#fSearch` original;
- prática contextual continua contextual; Banco de Questões continua independente;
- leitor em largura integral com safe-area e alvos de toque mínimos.

## Resultados desta construção
- `tests/v35_mobile_app.py`: 13 aprovados.
- `tests/v35_mobile_questions.py`: 5 aprovados.
- regressões de login/shell: 52 aprovados.
- taxonomia/cobertura/qualidade de questões: 37 aprovados.
- texto: 6 aprovados.
- isolamento de conta/layout browser: 28 aprovados.
- teste estático de independência do Banco de Questões: 1 aprovado.
- regressões de leitor/trilha/layout v26–v29: 70 aprovados.
- auditoria pesada v34 + hardening v35.8: 18 aprovados.
- importação/consistência da 47ª OAB: 11 aprovados.

Total conclusivo executado nesta etapa: **241 testes aprovados**.

## Limite honesto
Dois testes integrais antigos de `v35_question_independence.py` inlinam o aplicativo inteiro (vários MB de scripts) e ultrapassaram o limite de 120 s deste ambiente antes de concluir. Não houve falha de asserção reportada, mas timeout não é contado como aprovação. A independência entre Banco e Prepare-se permanece coberta diretamente pelos testes mobile e pelo teste estático concluído, além da suíte v35.12 previamente existente.
