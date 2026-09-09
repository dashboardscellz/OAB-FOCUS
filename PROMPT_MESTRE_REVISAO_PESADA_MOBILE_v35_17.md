# PROMPT MESTRE — REVISÃO PESADA / AUDITORIA ADVERSARIAL MOBILE v35.17

## Missão
Audite o OAB Focus como um QA humano adversarial, designer mobile, engenheiro frontend e aluno real. Não corrija apenas o print recebido. Cada falha encontrada deve gerar uma busca por **bugs irmãos** em todos os componentes, rotas, estados, viewports e regras CSS/JS equivalentes.

## Regra central
Um screenshot é apenas um sintoma. A unidade de correção é a **classe de falha**. Se um `hero-card` herdou `min-height` do desktop em Estudar, audite todos os heróis/cards mobile. Se um texto ficou branco sobre fundo claro, procure todas as combinações de cor herdada + fundo substituído. Se uma barra fixa cobriu conteúdo, audite todas as barras `fixed`/`sticky` e todos os finais de tela.

## Classificação de severidade
- **P0 bloqueante:** quebra de navegação/autenticação, erro JS fatal, conteúdo inacessível, tela impossível de usar, filtro ou questão inviável.
- **P1 alta:** overflow, clipping, sobreposição, texto essencial invisível/truncado, bottom nav cobrindo ação, modal inacessível, safe-area ignorada, alvo de toque crítico inadequado.
- **P2 média:** densidade, espaçamento, hierarquia, contraste não crítico, inconsistência de estados, microinterações.
Nenhuma versão pode receber o rótulo **FINAL** com P0/P1 aberto, teste inconclusivo ou falha não reproduzida.

## Taxonomia obrigatória de bugs
Procure: overflow horizontal/vertical; clipping; z-index; `position:fixed`; `position:sticky`; `100vh`/`100dvh`; safe-area; teclado virtual; viewport dinâmica; landscape; zoom/font scaling; `min-width`; largura/altura fixa; `overflow:hidden`; `white-space`; `text-overflow`; line-clamp; transform; margens negativas; grids/flex sem `min-width:0`; tabelas; scroll aninhado; bottom sheets; modais; estados loading/empty/error/salvando; conteúdo residual de outra rota; login visível autenticado; filtros; leitor; questões; comentários; ranking; revisão; perfil; admin.

## Auditoria de código perigoso
Varra todo o projeto por `!important`, CSS injetado via JS, `<style>` dinâmico, media queries sobrepostas, seletores duplicados, `position:fixed`, `position:sticky`, `min-width`, `100vh`, `overflow:hidden`, z-index arbitrário, transforms e patches v16/v18/v19/v28/v29/v35. Compare ordem real de carregamento no `index.html`. CSS injetado depois deve ser considerado capaz de vencer a folha mobile.

## Invariantes geométricos
Em cada rota e estado:
1. `document.documentElement.scrollWidth <= innerWidth + 1`.
2. Elemento relevante não pode sair da viewport; validar com `getBoundingClientRect()`.
3. Conteúdo principal/ação final deve poder ser rolado para uma posição acima da bottom nav.
4. Use `elementsFromPoint()` para detectar fixed/sticky interceptando ações.
5. Nenhum texto essencial pode ocupar espaço com `opacity≈0`, cor transparente ou contraste equivalente a invisível.
6. Nenhum modal/bottom sheet pode ultrapassar a área útil sem scroll próprio.
7. Nenhum conteúdo autenticado pode coexistir visualmente com login.
8. Alvos primários devem buscar ≥44px no iOS e ≥48dp no Android quando aplicável.
9. Texto jurídico essencial não pode depender de ellipsis/line-clamp.

## Matriz obrigatória
Teste 320, 360, 375, 390, 412 e 430px de largura; iPhone com notch/home indicator; Android; 844×390 landscape; tablet 768×1024 e landscape. Repetir com teclado virtual aberto, textos longos, nome de usuário longo, nível/progresso extremos, muitos filtros, questão longa, comentário longo, tabela jurídica larga, conteúdo OCR e falha de salvamento.

## Rotas/estados
Login, cadastro, Início, Estudar (lista, disciplina e capítulo), leitor, Prepare-se (sem plano e com plano), Questões (banco livre, filtros, questão respondida, comentário), Revisão, Desempenho, Mais cobrados, Ranking, Perfil, Configurações e Admin quando autorizado.

## Teste do aplicativo real
Não aceite apenas testes de módulo. Execute o `index.html` completo com os scripts e folhas de estilo na ordem real. Simule autenticação e navegue entre rotas. Registre erros de console/pageerror.

## Bugs irmãos
Ao encontrar um bug:
1. identifique o seletor/componente e a propriedade causal;
2. pesquise seletores irmãos e componentes que herdaram a mesma regra;
3. pesquise outras regras com a mesma propriedade perigosa;
4. reproduza em pelo menos dois viewports e dois estados;
5. escreva teste que falha antes;
6. corrija na camada mais baixa e estável, preferindo neutralizar legado a empilhar patches;
7. execute regressão de todos os irmãos.

## Revisão visual
Faça screenshot antes/depois e visual regression quando possível. Não considere corrigido se somente o screenshot original passou. Verifique também scroll intermediário e final, foco, teclado, modal, orientação e retorno de rota.

## Release gate
Antes de entregar:
- P0 = 0; P1 = 0.
- testes geométricos e funcionais conclusivos;
- sem pageerror nos fluxos críticos;
- ZIP final extraído e testado;
- sintaxe JS validada;
- cache/versionamento atualizado;
- relatório de achados com evidência, causa, correção e teste.
