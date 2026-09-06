# OAB Focus — Super Material v10

Esta versão substitui a lógica de “resumir os materiais” por uma lógica de **conteúdo integral organizado**.

## Material de estudo

O conteúdo principal da área Estudar agora vem de blocos integrais incorporados ao site:

- Resumos Semana 01 a 06, separados por disciplina e assunto;
- cadernos legislativos enviados, com artigos, súmulas e observações;
- compilação ampla de legislação, separada por disciplina;
- materiais aprofundados de Ética, Licitações e Improbidade;
- camada textual disponível dos mapas mentais;
- cronogramas enviados preservados para planejamento/trilhas.

O processamento **não reescreve nem resume os blocos integrais**. Ele remove somente itens que não pertencem ao conteúdo acadêmico, como cabeçalhos repetitivos, marcas técnicas e dados pessoais presentes nos PDFs.

Os antigos resumos rápidos continuam no sistema somente como apoio opcional e não substituem o material completo.

## Leitor

- a barra superior e a busca não ficam mais “grudadas” acompanhando a rolagem;
- cada assunto mostra os blocos completos relacionados;
- o botão `Material integral` abre todos os blocos da disciplina;
- busca interna por palavra, artigo, súmula ou conceito;
- blocos podem ser recolhidos/expandidos;
- o tempo de estudo continua sendo registrado.

## Arquivos obrigatórios

Na publicação, envie tudo desta pasta para a raiz do repositório, inclusive:

- `index.html`
- `data/integral-material.js`
- `.nojekyll`
- `database.rules.json`
- `AUDITORIA_JURIDICA_2026.md`

## GitHub Pages

`Settings → Pages → Deploy from a branch → main → /(root)`

## Firebase

O Firebase continua sendo usado para contas e progresso. O material acadêmico é entregue pelo próprio site.


## Engenharia v10

- busca refeita com correspondência por termos e ranking de relevância;
- busca global também alcança o conteúdo integral;
- correção do menu móvel e navegação do ADM no celular;
- layout responsivo para desktop, tablet e celular;
- áreas de toque ampliadas em dispositivos touch;
- controles internos do leitor não acompanham mais a rolagem;
- remoção de microcopy técnica desnecessária;
- auditoria estrutural documentada em `QA_ENGENHARIA_v10.md`.
