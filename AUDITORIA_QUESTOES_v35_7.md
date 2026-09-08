# OAB Focus v35.7 — Auditoria de qualidade das questões

Data: 08/09/2026

## Problemas que motivaram esta versão

1. Questões autorais podiam ser construídas a partir de linhas físicas quebradas do material, gerando alternativas truncadas, como frases terminadas em “são” / “não são” sem complemento.
2. O comentário autoral pós-resposta era genérico e não explicava o erro jurídico de cada alternativa.
3. Questões sem gabarito válido podiam entrar em treino/simulado.
4. O banco precisava de uma camada permanente de auditoria textual para impedir recorrência.

## Correções aplicadas

- Criado `data/v35-question-quality.js`.
- Geradores autorais v20/v34 agora recompõem parágrafos antes de extrair uma regra jurídica.
- Se não existir proposição jurídica completa, a questão autoral não é criada.
- Alternativas geradas passam por validador de completude antes de publicação.
- Comentário autoral ganhou estrutura: correta, fundamento detectado no material, análise A/B/C/D, pegadinha e regra de revisão.
- Questões sem índice de gabarito válido são excluídas das filas e dos simulados.
- Corrigidas corrupções textuais inequívocas encontradas no banco estático.
- Criado `PROMPT_MESTRE_QUALIDADE_QUESTOES_v35_7.md` como padrão editorial/jurídico.

## Auditoria automatizada do banco estático

O banco estático contém 2.336 questões. Após as correções desta versão, o scanner estrutural v35.7 não encontrou alternativa crítica truncada, opção duplicada exata ou gabarito estruturalmente inválido entre esses 2.336 itens.

Esse resultado significa **integridade estrutural automatizada**, e não revisão jurídica individual de cada questão.

## Comentários legados

Os comentários históricos antigos foram preservados quando não havia revisão jurídica individual suficiente para reescrevê-los com segurança. Muitos ainda seguem o padrão antigo “Gabarito + regra-chave + referências-base”. Eles não são convertidos automaticamente em comentário jurídico detalhado porque isso exigiria conferir, questão por questão, a legislação/jurisprudência vigente e o motivo de cada alternativa.

A partir da v35.7, novas questões autorais não podem usar o comentário genérico antigo. O Prompt Mestre determina que comentários futuros/revisados tragam fundamentação confirmada e análise individual das alternativas.

## Critério de segurança

A plataforma deve preferir **não publicar uma questão autoral** a publicar alternativa truncada, ambígua ou baseada em fundamento não confirmado.
