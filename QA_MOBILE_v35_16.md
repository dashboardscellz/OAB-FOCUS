# QA Mobile v35.16

## Suítes principais
- `tests/v35_mobile_final.py` — regressões das capturas reais + conflito de CSS dinâmico.
- `tests/v35_mobile_app.py` — shell, Home, Estudar, Prepare-se e leitor em viewports móveis/tablet.
- `tests/v35_mobile_questions.py` — busca e bottom sheet do Banco de Questões.

## Casos obrigatórios
1. Home não possui overflow em 320/360/375/390/412/430 px.
2. `LV 1 Calouro` fica dentro da viewport.
3. `Hoje` e `0% de acerto geral` permanecem legíveis.
4. Topbar e bottom nav respeitam safe-area.
5. Controles principais >=44 px.
6. `Salvo` desaparece visualmente após confirmação breve.
7. Dock de grifos fica pelo menos 6 px acima da bottom nav.
8. Simulação da regra legada `bottom:10px!important` não quebra o leitor.
9. Question text e reader body usam tamanho mobile adequado.
10. 844×390 continua em modo mobile.
11. 768×1024 continua sem overflow.
12. Banco de Questões mantém busca e filtros independentes do Prepare-se.

## Critério de liberação
Não empacotar se qualquer teste mobile falhar. Após criar o ZIP, extrair em pasta limpa e repetir as suítes críticas a partir do pacote extraído.

## Teste da aplicação completa
- `tests/v35_mobile_real_app.py` executa o `index.html` real com scripts locais na ordem de produção.
- Verifica `OAB_MOBILE_APP.VERSION === 35.16`.
- Autentica estado de teste, abre Home e Questões em 390×844.
- Falha se houver `pageerror`, overflow, pill fora da viewport ou ausência das ferramentas mobile do Banco de Questões.
