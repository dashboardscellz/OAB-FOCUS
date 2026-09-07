# QA de Engenharia — OAB Focus SUPER v17

## Escopo

A v17 não reduz o material jurídico. O foco desta revisão foi o leitor e a grifagem.

## Grifagem

- A seleção válida passa a ser capturada e armazenada **antes** do clique na cor.
- Uma seleção recolhida pelo clique do mouse não apaga o último snapshot válido.
- Foram adicionados ouvintes redundantes para `selectionchange`, `mouseup`, `keyup` e `touchend`.
- O grifo é ancorado por: unidade de leitura + seção + offsets + trecho literal + prefixo + sufixo.
- O mecanismo relocaliza o trecho pelo texto e pelo contexto antes de aplicar o destaque.
- Seleções que atravessam mais de um parágrafo da mesma seção são divididas em fragmentos visuais, mas continuam sendo **um único grifo salvo**.
- O mesmo grifo é reaplicado depois da reconstrução do DOM.
- Grifos antigos continuam compatíveis com o esquema de `progress.highlights`.
- Persistência é solicitada imediatamente após criar, alterar cor ou remover um grifo.

### Teste automatizado isolado do mecanismo

Executado em Chromium headless com DOM controlado:

- seleção de `estabilidade após três anos`;
- clique na cor depois da seleção;
- 1 grifo persistido e 1 marca renderizada;
- seleção cruzando dois parágrafos;
- 1 registro persistido e 2 fragmentos visuais renderizados;
- remoção do HTML de destaque + reaplicação pelo estado salvo;
- os 2 fragmentos foram restaurados corretamente.

## Leitor v17

- Layout documental com largura central de aproximadamente 760 px.
- Corpo do material limitado a cerca de 68 caracteres tipográficos por linha.
- Corpo jurídico em tipografia serifada; controles e títulos em tipografia de interface.
- Cabeçalho da leitura reduzido e hierarquia visual mais sóbria.
- Índice lateral sem cartões; item atual indicado por barra vertical.
- Painel de progresso simplificado.
- Ferramentas antigas duplicadas de grifo ficam ocultas.
- Nova barra superior contém Voltar, Buscar, Índice, Anotar, Grifos, tamanho da fonte, modo noturno e Foco.
- Barra fixa de grifo acompanha a leitura no desktop e no mobile.
- Paleta contextual surge perto do texto selecionado.
- Mobile usa leitura em coluna única e mantém os controles fora do corpo do texto.
- Modo foco continua preservando navegação essencial do leitor.

## Limpeza editorial

A camada v17 oculta somente referências visuais que sejam, por si só, títulos/instruções órfãs, como `Tabela abaixo`, `Quadro abaixo`, `Veja a figura abaixo` etc. Frases jurídicas que mencionem tabela normativa real não entram nessa regra.

## Verificações estáticas

- `node --check data/v17-patch.js`: aprovado.
- `node --check data/v16-patch.js`: aprovado.
- `data/v17-patch.js` carregado depois da v16.
- Nenhuma pasta de mapas é reintroduzida.
- `integral-material.js`, `highyield-static.js`, mapas de estudo e mapas de questões permanecem no pacote.
