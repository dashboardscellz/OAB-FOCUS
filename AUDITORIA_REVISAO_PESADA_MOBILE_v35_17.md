# Auditoria pesada mobile — v35.17

## Evidências recebidas
1. Estudar: `hero-card` desktop mantinha `min-height:300px`, gerando grande vazio. A mesma tela removia o fundo do `study-hero` sem resetar `.metric-chip`, deixando texto branco quase invisível sobre fundo claro.
2. Prepare-se: navegação inferior fixa competia com conteúdo longo e reduzia a área útil; a correção exige reserva de rolagem inferior, não só padding visual.

## Classe de falha corrigida
- herança de geometria desktop em componentes mobile;
- herança de cor incompatível após troca de background;
- estados ativos residuais na bottom nav;
- conteúdo longo sem reserva explícita para barra fixa;
- containers flex/grid sem `min-width:0`/`max-width:100%`.

## Medidas v35.17
- neutralização global da altura mínima do `hero-card` no mobile;
- reset explícito de cores e chips do `study-hero`;
- remoção do pseudo-elemento decorativo desktop no mobile;
- `scroll-padding-bottom` global e reforço no Prepare-se;
- exatamente uma aba ativa na bottom nav;
- função `OAB_MOBILE_APP.auditMobileGeometry()` para auditoria geométrica em runtime/testes;
- prompt adversarial incorporado ao projeto.
