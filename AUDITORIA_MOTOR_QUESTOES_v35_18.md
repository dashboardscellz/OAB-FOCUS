# Auditoria do motor de questões — v35.18

## Falha reproduzida
O caso reportado combinava um enunciado de tentativa penal com alternativas sobre lei penal posterior mais favorável. As alternativas ainda continham `OBS:` e `CAIU NA OAB`, além de versões quase idênticas da mesma frase.

## Causas-raiz
- o gerador escolhia cenários por uma família ampla da disciplina (`criminal`, `consumer`, etc.), sem exigir aderência ao tópico/regra concreta;
- a regra extraída mantinha anotações editoriais do material;
- a mutação numérica podia alterar o número da prova em vez de um prazo jurídico;
- regex de palavra curta acentuada podia substituir `é` dentro de `réu`, corrompendo a alternativa;
- o gate verificava duplicação literal, mas não opções quase idênticas.

## Correções
- sanitização das regras antes de gerar qualquer campo da questão;
- cenários específicos quando a semântica é reconhecível e fallback centrado no tópico;
- filtro de similaridade entre alternativas;
- mutação numérica limitada a dias, meses, anos e percentuais;
- substituição de expressões com fronteiras seguras;
- cache dos módulos atualizado para 35.18;
- teste de regressão baseado no print reportado.
