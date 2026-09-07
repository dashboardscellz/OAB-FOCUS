# OAB Focus SUPER v16

Versão consolidada sobre a v15, com foco em **leitura profissional, correspondência estrita entre material e questões e revisão adaptativa pela curva do esquecimento**. O conteúdo jurídico do acervo permanece integral: a v16 reorganiza apresentação e navegação, sem criar resumos para substituir a matéria.

## Principais mudanças da v16

- **Novo leitor acadêmico:** largura de leitura controlada, tipografia mais confortável, hierarquia visual, índice lateral, progresso, breadcrumbs e navegação anterior/próximo.
- **Voltar de verdade:** as telas internas passam a manter histórico de navegação e oferecem `← Voltar`.
- **Modo foco, modo noturno e tamanho de fonte** dentro do leitor.
- **Grifagem reconstruída:** captura da seleção antes do clique, barra contextual próxima ao texto, lápis flutuante, persistência por unidade e recuperação por trecho/âncora textual.
- **Meus grifos e anotações** acessíveis durante a leitura.
- **Limpeza editorial:** referências órfãs como “tabela para não confundir”, “tabela abaixo”, mapas/figuras/quadro inexistentes foram auditadas. Nenhum conteúdo jurídico substantivo foi resumido para realizar essa limpeza.
- **Questões com vínculo estrito:** 2.336 questões preservadas; 1.448 possuem vínculo confiável de capítulo e 797 chegam também a vínculo confiável de subassunto. Se não houver correspondência segura, o sistema não apresenta a questão como “deste conteúdo”.
- **Mais cobrados reconstruído:** só encaminha para capítulos reais do material e usa questões classificadas com confiança suficiente.
- **Prepare-se recalibrado:** caminho diário parte de material realmente existente e encaminha para questões da mesma unidade validada.
- **Revisão inteligente / curva do esquecimento:** acompanha domínio, fragilidade, reincidência, variedade de acertos, tempo e intervalo de revisão. Erros recorrentes podem fazer uma questão do mesmo microtema retornar posteriormente na sessão.
- **Sem mapas mentais**, conforme decisão da v14.2.
- Sidebar rolável, Firebase, ranking, desempenho, progresso e recursos anteriores foram preservados.

## Pacote autossuficiente

Publique a pasta inteira. Os arquivos essenciais incluem:

```text
index.html
data/
  integral-material.js
  highyield-static.js
  v15-study-map.js
  v15-patch.js
  v16-question-map.js
  v16-patch.js
database.rules.json
.nojekyll
ATUALIZAR_GITHUB.cmd
```

## Atualização pelo GitHub Desktop

O atualizador está configurado para:

```text
C:\Users\endoa\Documents\GitHub\OAB-FOCUS
```

1. Extraia o ZIP inteiro.
2. Abra `OAB_Focus_SUPER_v16_GITHUB`.
3. Execute `ATUALIZAR_GITHUB.cmd`.
4. Confira `Changes` no GitHub Desktop.
5. Summary sugerido: `OAB Focus v16 - leitor profissional e revisão inteligente`.
6. `Commit to main`.
7. `Push origin`.
8. No site publicado, use `Ctrl + F5` na primeira abertura para eliminar cache da versão anterior.

## Regra de segurança pedagógica

Uma questão só é apresentada como vinculada a uma unidade quando a classificação atinge o nível de confiança exigido. Em um subassunto, o botão de questões usa somente vínculos específicos daquele subassunto; se o banco não tiver correspondência suficientemente segura, o OAB Focus informa isso em vez de misturar outro tema.
