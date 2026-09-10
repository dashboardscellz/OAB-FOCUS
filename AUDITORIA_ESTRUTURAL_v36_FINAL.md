# OAB Focus v36 — Relatório final de consolidação

Base: v35.20 Mobile Hardening.

## JavaScript
- 37 nomes de função apresentavam duplicidade top-level no script principal.
- 45 declarações duplicadas foram removidas com parser sintático (TypeScript AST), preservando a última declaração efetivamente ativa de cada nome.
- Funções críticas consolidadas incluem setRoute, renderRoute, renderHome, renderReader, renderDiscipline, renderStudy, renderPrepare, renderAdmin, renderProfile, renderHighYield, saveProgress, restoreSession, mergeProgress, defaultProgress, logout e completeLogin.
- A cadeia histórica de patches externos foi mantida na mesma ordem.

## CSS / mobile
- data/v35-mobile-app.css passa a ser a fonte canônica do comportamento phone/landscape.
- data/v35-shell.css não mantém mais overrides específicos de 360/390/430/768 px.
- Escala responsiva documentada: 390 / 560 / 768 / 950 / 1120.
- !important: index.html 35 -> 26; v35-mobile-app.css 406 -> 6; v35-shell.css 366 -> 0.
- Mantidos os hardenings de safe-area, leitor, bottom-nav, teclado virtual, filtros, quebra de enunciados e overflow.
- Corrigida a reaplicação destrutiva da enhancement de questões: o painel real de filtros não é mais removido quando a rotina mobile roda novamente.

## Conquistas
- progress.seenBadges persistido no progresso do usuário.
- checkAchievements(prevLevel) reaproveita o toast existente para nova badge e level up.
- Notificações múltiplas recebem pequeno intervalo entre si.
- aria-live="polite" preservado no toast-root e posição mobile respeita bottom-nav/safe-area.

## Conteúdo / OCR
- O scanner tools/audit_ocr_suspects.py apenas sinaliza suspeitas; não altera conteúdo jurídico automaticamente.
- 6 ocorrências foram sinalizadas na execução desta versão e registradas em AUDITORIA_OCR_SUSPEITOS_v36.md.

## Verificação executada
- 53 testes específicos/visuais da v36 e fluxos mobile/browser passaram.
- 92 testes históricos de regressão passaram.
- Total confirmado nesta rodada: 145 testes aprovados.
- Todos os arquivos data/*.js passaram em node --check.
- O teste full-real-app mais pesado excedeu o tempo do ambiente e, por isso, não foi contabilizado como aprovado.
