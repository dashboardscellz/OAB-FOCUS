# OAB Focus SUPER v17

A v17 consolida as funções da v16 e refaz especificamente a **experiência de leitura** e a **grifagem**, sem resumir ou reduzir o conteúdo jurídico.

## O que mudou na v17

- **Leitor documental redesenhado:** visual menos “card de site” e mais próximo de um leitor acadêmico/documentação profissional.
- Coluna central de leitura controlada, maior respiro, hierarquia tipográfica e menor sensação de “parede de texto”.
- Índice lateral mais discreto, com indicação do ponto atual da leitura.
- Painel lateral de progresso simplificado.
- Cabeçalho compacto com `← Voltar`, busca, índice, anotações, grifos, tamanho de fonte, modo noturno e modo foco.
- Navegação anterior/próximo e questões validadas continuam preservadas.
- **Grifagem v17 reconstruída:** a seleção é capturada antes do clique, não é perdida quando o botão recebe foco e o trecho é salvo com âncoras textuais resilientes.
- Paleta de cores aparece perto da seleção e uma barra de grifo acompanha o aluno durante toda a leitura.
- Grifos que atravessam mais de um parágrafo da mesma seção são suportados.
- Grifos são reaplicados quando a unidade é reaberta.
- Persistência é disparada imediatamente ao criar, recolorir ou remover o destaque.
- Compatibilidade com grifos já salvos nas versões anteriores.
- Limpeza editorial adicional para títulos/instruções visuais órfãs, sem eliminar menções jurídicas legítimas a tabelas normativas.
- **Revisão inteligente, Prepare-se, Mais cobrados e vínculo estrito material ↔ questões da v16 permanecem ativos.**
- **2.336 questões permanecem no banco.**
- Mapas mentais continuam removidos.

## Arquivos essenciais

```text
index.html
data/
  integral-material.js
  highyield-static.js
  v15-study-map.js
  v15-patch.js
  v16-question-map.js
  v16-patch.js
  v17-patch.js
database.rules.json
.nojekyll
ATUALIZAR_GITHUB.cmd
```

## Atualização do GitHub

O atualizador usa como destino:

```text
C:\Users\endoa\Documents\GitHub\OAB-FOCUS
```

1. Extraia o ZIP inteiro.
2. Entre na pasta `OAB_Focus_SUPER_v17_GITHUB`.
3. Execute `ATUALIZAR_GITHUB.cmd`.
4. Confira a aba `Changes` no GitHub Desktop.
5. Faça commit com `OAB Focus v17 - novo leitor e grifagem definitiva`.
6. `Push origin`.
7. No site publicado, use `Ctrl + F5` na primeira abertura.
