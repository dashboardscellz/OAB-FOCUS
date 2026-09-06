# QA de Engenharia — OAB Focus v14

Data da revisão: 06/09/2026

## Objetivo

Reduzir travamentos e desorganização sem remover conteúdo jurídico, questões, mapas mentais ou recursos de acompanhamento.

## Correções estruturais

### 1. Navegação de estudo
- Disciplina organizada em capítulos e subassuntos.
- Subassunto abre isoladamente, sem carregar visualmente todos os demais subassuntos do capítulo.
- Capítulo inteiro e disciplina inteira continuam disponíveis como modos opcionais.
- Breadcrumb e anterior/próximo mantêm contexto.

### 2. Material explicado x legislação
- Material explicado é a camada principal.
- Mapas mentais relacionados aparecem imediatamente após a teoria da unidade.
- Lei seca/súmulas ficam em seção de consulta recolhida por padrão.

### 3. Mapas mentais
- 465 miniaturas leves mantidas para navegação.
- 465 versões HD regeneradas a partir dos PDFs originais.
- Dimensão validada das versões HD: aproximadamente 1788 × 2529 px.
- HD só é solicitado quando o mapa é aberto.
- Visualizador possui zoom de 50% a 300% e comando Ajustar.
- `loading="lazy"` e `decoding="async"` nas miniaturas.

### 4. Mais cobrados
- Estatística histórica pré-calculada em `data/highyield-static.js`.
- Evita recalcular milhares de cruzamentos toda vez que a tela abre.
- 70 entradas de prioridade histórica no índice estático.
- Mapeamento revisado de "Execução na Justiça do Trabalho" para o capítulo `EXECUÇÃO`.

### 5. Prepare-se
- Prioridades reutilizam a base histórica em cache.
- Desempenho do usuário é recalculado separadamente.
- Resultado de prioridade é memoizado por atualização do progresso.
- Geração mostra overlay de carregamento para evitar impressão de clique ignorado.

### 6. Busca
- Índice de questões criado uma vez por sessão.
- Material integral é normalizado em pequenos lotes durante tempo ocioso.
- Durante a primeira indexação, a interface mostra estado de carregamento em vez de executar uma varredura gigante síncrona.

### 7. De onde parou
- Posição continua gravada por capítulo.
- Subassunto ativo passa a ser preservado em `currentStudy`.
- Retorno usa `subtopicTitle` quando disponível.
- Scroll atualiza posição periodicamente sem salvar a cada pixel.

### 8. Grifos
- Subassunto isolado usa chave própria de highlights.
- Isso evita conflito entre offsets de um recorte e offsets do capítulo inteiro.

### 9. Tela Estudar
- Com a busca vazia, a tela não cria a taxonomia completa de todas as disciplinas apenas para renderizar os cards.
- A construção de capítulos ocorre quando a disciplina é aberta ou quando uma pesquisa realmente exige seus subassuntos.

## Testes automatizados / estáticos executados

- `node --check` no script principal: OK.
- manifesto de mapas: 465 entradas: OK.
- `src` das 465 miniaturas: presentes.
- `hdSrc` das 465 versões HD: presentes.
- contagem low-res: 465.
- contagem HD: 465.
- índice `Mais cobrados`: 70 entradas.
- todos os `targetTitle` do índice histórico correspondem a títulos existentes na disciplina correspondente.
- arquivos essenciais do pacote são verificados pelo `ATUALIZAR_GITHUB.cmd` antes de orientar commit.

## Observação sobre teste headless

O Chromium disponível no ambiente de geração não concluiu o carregamento completo da página por dependências externas/Firebase no modo headless isolado. Isso não foi usado como evidência de falha do site. A sintaxe JavaScript e a integridade dos arquivos locais foram verificadas separadamente.

## Critério da v14

Nenhuma otimização de performance foi feita pela remoção de conteúdo jurídico. As mudanças atuam em cache, indexação, renderização progressiva, carregamento tardio e redução de cálculos repetidos.
