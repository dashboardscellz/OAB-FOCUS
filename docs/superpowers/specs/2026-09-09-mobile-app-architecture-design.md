# OAB Focus v35.13 — Mobile App Architecture Design

## Goal
Transform the <=768px experience from a compressed desktop site into a mobile-first study application while preserving the existing desktop application, legal content, Firebase/progress, Prepare-se, question-bank independence, taxonomy, and reader behavior.

## Reference model
The mobile interaction model borrows the useful structural ideas of OAB de Bolso rather than its branding: direct access to Questions, study materials and coach/plan; Smart Coach separated from the free question bank; question filters by discipline/subject/exam/history; and support material attached to the question flow. OAB Focus keeps its own visual identity and existing content.

## Mobile navigation
Five persistent bottom destinations: Início, Estudar, Prepare-se, Questões, Mais. Each destination owns a single screen. No login or previous route may remain visually mounted above/below the authenticated screen.

## Início
Compact greeting, one prominent continue action, quick-action grid, today's study stats, and a Prepare-se summary. Desktop dashboard sections are not squeezed into mobile.

## Estudar
Mobile list architecture: search first, one discipline per row, concise metadata, then chapters/units as touch-friendly accordions. Reader remains full-width with readable measure and bottom-nav-safe padding.

## Prepare-se
Own coach screen. Today-first task list, clear actions for theory/questions/review, short exam countdown, then the next days. It must never mutate the free Question Bank state except when opening an explicitly contextual practice session.

## Questões
Free bank remains independent from Prepare-se. Mobile has a compact search bar and Filters button. Filters open in a bottom sheet and retain the real existing controls/IDs so legacy filtering logic continues to work. Support discipline, subject, exam, status and text search. Question content occupies the main width; secondary stats move below.

## Mais
Use the existing sheet for Revisar, Desempenho, Mais cobrados, Ranking, Perfil, Configurações and Admin when applicable.

## Login isolation
`#loginView.hidden` must always win over historical `display:block!important` login patches. Authenticated `#app` and login cannot be visible simultaneously.

## Mobile quality gates
Test 375x812, 390x844, 430x932 and 768x1024. No horizontal overflow; bottom nav does not cover controls; login is absent after showApp; every bottom destination is touchable; question filters are independently usable; reader remains readable.

## Desktop preservation
At widths >768px, new mobile markup and overrides must not change the desktop layout or route behavior.
