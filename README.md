# OAB Focus — Super Material v12

Versão com foco em estabilidade, leitura robusta e gestão de usuários.

## Estrutura do estudo

A ordem de leitura agora é intencional:

1. **Material explicado** — base principal, com os blocos completos dos materiais explicativos incorporados.
2. **Mapas mentais** — revisão visual, com páginas dos mapas renderizadas diretamente no site.
3. **Legislação e súmulas** — consulta complementar, separada e recolhida por padrão.
4. **Questões** — prática relacionada ao assunto.

O conteúdo acadêmico integral já incorporado não é substituído por resumos. Cabeçalhos repetitivos, marcas técnicas e dados pessoais presentes nos PDFs não fazem parte da experiência de estudo.

## Mapas mentais

A pasta `maps/` contém 465 páginas visuais, otimizadas em WebP e carregadas sob demanda (`loading="lazy"`).
O arquivo `data/map-manifest.js` relaciona as páginas às disciplinas e assuntos.

## Navegação

A navegação possui uma camada delegada de segurança para evitar botões sem ação. Isso cobre:

- menu Estudar;
- continuar/retomar assunto;
- trilha inteligente da home;
- cards de disciplina/assunto;
- navegação desktop e mobile.

## Usuários

- cadastro próprio pelo botão **Criar minha conta**;
- novos cadastros ficam pendentes até aprovação;
- administrador aprova/recusa, ativa/desativa e pode promover outro usuário a ADM;
- configurações para alterar nome e senha;
- RESET do progresso;
- exclusão definitiva da própria conta com confirmação e senha atual.

## Ranking

Ranking compartilhado com atualização em tempo real pelo Firebase Realtime Database:

- posição;
- nome;
- level;
- horas estudadas;
- questões respondidas.

## Administração

Painel com:

- total de contas;
- pendentes;
- contas ativas nos últimos 30 dias;
- contas sem atividade há 30 dias ou mais;
- novos cadastros nos últimos 30 dias;
- desativados;
- alteração de permissão de aluno/ADM.

## Compartilhamento

A home possui **Compartilhar com amigos** com WhatsApp, Facebook e Instagram/Web Share.

## Publicação no GitHub Pages

Envie todo o conteúdo desta pasta para a raiz do repositório. A pasta `data/` e a pasta `maps/` são obrigatórias.

Estrutura principal:

```text
index.html
data/
  integral-material.js
  map-manifest.js
maps/
database.rules.json
.nojekyll
```

Em GitHub Pages:

`Settings → Pages → Deploy from a branch → main → /(root)`

## Firebase

Publique também as regras de `database.rules.json` no Realtime Database. O site continua usando Firebase Authentication + Realtime Database para contas, permissões, progresso e ranking.
