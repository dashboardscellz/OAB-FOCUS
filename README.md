# OAB Focus SUPER v15

Versão consolidada a partir da **v14.3**, preservando o material integral e corrigindo o fluxo `estudar → praticar → revisar`.

## Principais mudanças da v15

- **Grifagem corrigida:** a seleção não é mais perdida ao clicar na cor.
- **Lápis flutuante:** a paleta de grifo acompanha a leitura no canto da tela, inclusive no celular e no modo foco.
- **Questões ligadas à unidade estudada:** capítulo e subassunto montam um caderno próprio de questões. Quando não há correspondência estreita, o sistema informa que está usando o caderno do capítulo.
- **Mais cobrados com destino real:** a lista de estudo mostra somente temas que possuem um capítulo confiável no material incorporado. Temas sem material correspondente não recebem botão “Estudar” artificial.
- **Prepare-se virou caminho diário:** cada sessão indica disciplina, capítulo, subassunto, tempo de leitura, questões do mesmo tema e revisão.
- **59 temas de alta recorrência mapeados** para capítulos reais do acervo atual.
- **Conteúdo-base transparente:** quando um tema possui apenas lei seca/súmulas no acervo, esse material pode ser usado como leitura principal, mas o site deixa claro que não existe bloco teórico separado — não inventa resumo.
- **Sidebar com rolagem da v14.3 preservada.**
- **Sem mapas mentais**, conforme decisão tomada na v14.2.
- `De onde parou`, progresso, Firebase, ranking, desempenho e demais recursos anteriores foram preservados.

## Pacote autossuficiente

A v14.3 havia sido empacotada sem os arquivos de dados externos. A v15 volta a incluir tudo o que o `index.html` precisa:

```text
index.html
data/
  integral-material.js
  highyield-static.js
  v15-study-map.js
  v15-patch.js
database.rules.json
.nojekyll
ATUALIZAR_GITHUB.cmd
```

Não publique somente o `index.html`.

## Atualização pelo GitHub Desktop

O atualizador está configurado para o repositório local:

```text
C:\Users\endoa\Documents\GitHub\OAB-FOCUS
```

1. Extraia o ZIP inteiro.
2. Abra a pasta `OAB_Focus_SUPER_v15_GITHUB`.
3. Execute `ATUALIZAR_GITHUB.cmd`.
4. Abra o GitHub Desktop e revise `Changes`.
5. Use o Summary:

```text
OAB Focus v15 - caminho diario e vinculo de questoes
```

6. `Commit to main`.
7. `Push origin`.

O atualizador também remove eventuais pastas antigas `maps/`, `maps-hd/` e `data/map-manifest.js` que ainda tenham ficado no repositório.

## Regra editorial

A v15 não cria “resuminhos” para preencher lacunas. Quando o acervo possui teoria, ela é a leitura principal. Quando existe apenas legislação/súmulas para um tema, a interface informa isso expressamente e preserva o conteúdo original disponível.
