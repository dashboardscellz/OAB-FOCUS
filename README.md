# OAB Focus SUPER v14

Versão focada em **organização granular, mapas mentais em alta resolução e performance**, sem reduzir o conteúdo jurídico incorporado.

## O que mudou

- disciplina → capítulo → subassunto clicável;
- ao abrir um subassunto, a leitura mostra **somente a unidade integral escolhida**, sem despejar o restante do capítulo na mesma tela;
- material explicado permanece como **base principal**;
- mapa mental relacionado aparece logo após a unidade estudada;
- legislação e súmulas permanecem como **consulta secundária**, recolhidas por padrão;
- 465 mapas mentais foram regenerados a partir dos PDFs em versão HD (aprox. 1788 × 2529 px) e carregam em alta resolução somente quando o usuário abre o visualizador;
- zoom de mapa: diminuir, aumentar e ajustar;
- "De onde parou" preserva capítulo/subassunto e posição de leitura;
- grifos de subassuntos usam espaços próprios para não colidir com offsets do capítulo inteiro;
- `Mais cobrados` usa um índice histórico pré-calculado em vez de reconstruir toda a estatística a cada clique;
- `Prepare-se` reutiliza dados estáticos e recalcula apenas a parte ligada ao progresso do aluno;
- busca integral é indexada em lotes ociosos para evitar congelamento da interface;
- operações potencialmente demoradas exibem feedback de carregamento;
- imagens usam carregamento tardio e decodificação assíncrona;
- layout continua responsivo para computador, tablet e celular.

## Estrutura obrigatória no GitHub

Não envie somente `index.html`. A pasta inteira deve permanecer no repositório:

```text
index.html
data/
maps/
maps-hd/
database.rules.json
.nojekyll
```

`maps/` contém miniaturas leves. `maps-hd/` contém as versões de alta resolução carregadas sob demanda.

## Atualização pelo GitHub Desktop

Se o repositório local estiver em:

```text
C:\Users\endoa\Documents\GitHub\OAB-FOCUS
```

extraia o ZIP inteiro e execute `ATUALIZAR_GITHUB.cmd` **de dentro da pasta extraída da v14**.

O script usa `%~dp0` como origem. Assim, ele não depende da pasta atual do CMD e evita repetir o problema de copiar arquivos do perfil do Windows para o repositório.

Depois:

1. abra o GitHub Desktop;
2. revise `Changes`;
3. use `Summary: OAB Focus v14`;
4. `Commit to main`;
5. `Push origin`.

## Observação de conteúdo

A reorganização em capítulos/subassuntos não transforma o material em resumo. Os trechos exibidos são recortes das unidades integrais já incorporadas. O capítulo e a disciplina completos continuam acessíveis quando desejado.

## Correção v14.1 — associação de material explicado

- corrige capítulos duplicados criados por títulos semanticamente iguais em fontes diferentes;
- exemplo corrigido: `DAS PARTES E DOS PROCURADORES` agora é associado a `Partes e Procuradores`, preservando o bloco teórico e anexando a legislação correspondente;
- `Litisconsórcio` e `Intervenção de Terceiros` passam a ser associados ao capítulo teórico combinado `Intervenção de Terceiros e Litisconsórcio`;
- links antigos de capítulos continuam funcionando por aliases internos;
- subassuntos numerados são priorizados sobre chamadas visuais em caixa alta, reduzindo itens falsos como títulos de tabela/alerta;
- ao abrir um subassunto de nível superior, seus subtópicos internos permanecem dentro do recorte; o conteúdo não é mais interrompido no primeiro subtítulo filho.


## v14.2 — remoção dos mapas mentais

Por decisão do projeto, os mapas mentais foram removidos integralmente da plataforma.

- removidas as pastas `maps/` e `maps-hd/`;
- removido `data/map-manifest.js`;
- removidos 32 blocos textuais derivados de mapas do acervo integral;
- removidos contadores, abas, galerias e mensagens de mapas na área de estudo;
- mantidos sem redução o material explicado, legislação/súmulas, questões, progresso, grifos, Prepare-se e Mais cobrados.
