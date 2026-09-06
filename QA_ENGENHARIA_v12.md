# QA de Engenharia — OAB Focus v12

## Navegação

- navegação centralizada por delegação de eventos;
- fallback `safeRoute()` com captura de erro;
- menu lateral e menu mobile usam o mesmo roteador;
- `Retomar assunto` também possui rota declarativa;
- leitor remove o listener de scroll ao trocar de rota.

## Conteúdo

- material explicado aparece antes da legislação;
- legislação fica em blocos de consulta recolhidos por padrão;
- mapas mentais visuais foram restaurados;
- páginas dos mapas usam carregamento preguiçoso para reduzir custo inicial;
- blocos explicativos continuam integrais no arquivo de conteúdo.

## Responsividade

- desktop: sidebar, layout amplo, múltiplas colunas quando cabem;
- tablet: colunas reduzidas e controles adaptados;
- celular: coluna única, barra inferior, menu móvel e alvos de toque maiores;
- imagens dos mapas usam largura fluida e não estouram o viewport.

## Contas

- cadastro autônomo com estado `pending`;
- aprovação administrativa antes do acesso;
- permissões de ADM separadas de aluno;
- nome editável pelo usuário;
- senha alterável com confirmação da senha atual;
- reset do progresso sem apagar a conta;
- exclusão da conta com confirmação textual + senha atual.

## Ranking

- Realtime Database com stream SSE;
- atualização junto ao salvamento do progresso;
- exibe level, tempo estudado e questões respondidas;
- contas desativadas podem ser retiradas do leaderboard pelo administrador.

## Regras

- usuário pendente não pode ler ranking nem gravar progresso;
- administrador precisa estar ativo para usar privilégios de escrita/leitura administrativa;
- usuário comum só altera o próprio perfil sem modificar `role`, `active` ou `approvalStatus`.

## Busca

Mantida a busca semântica leve da v10:

- normalização de acentos;
- palavras inteiras e stems simples;
- aliases jurídicos (HC, MS, CPC, CPP, CF, CLT, CDC, ECA etc.);
- ranking de relevância por disciplina, assunto, enunciado e material integral;
- clique em resultado de questão abre o ID exato.

## Verificação final desta entrega

- `index.html`: JavaScript validado com `node --check`;
- referências locais de `script`, `img` e `link`: nenhuma referência ausente;
- Material Integral: 19 disciplinas, 261 blocos integrais;
- Mapas Mentais: 20 disciplinas, 465 páginas visuais renderizadas;
- Banco de questões embutido: 2.336 questões ativas;
- `database.rules.json`: JSON válido e atualizado para cadastro pendente, autogestão da conta, ranking e administração;
- cabeçalhos internos do leitor: sem comportamento `sticky`;
- `data/`, `maps/`, `.nojekyll` e regras do Firebase incluídos no pacote final.
