# Auditoria jurídica focalizada — OAB Focus v36

**Data:** 08/09/2026  
**Escopo:** bloqueios encontrados na auditoria comparativa externa e regressões necessárias para transformar o OAB Focus em ferramenta principal de preparação para a 1ª fase.

## 1. Direito Civil — Contrato de Seguro

**Status: CORRIGIDO.**

O bloco que ensinava como legislação vigente os arts. 757, 760, 766, 772, 776, 782, 785, 786 e 798 do Código Civil foi substituído, no carregamento da v36, por conteúdo baseado na **Lei 15.040/2024**. A nova lei revogou os arts. 757 a 802 do Código Civil e passou a produzir efeitos em 11/12/2025.

A v36 destaca: âmbito da lei; risco e cláusulas; proposta e dever de informação; prova/interpretação; deveres no sinistro; prazo de manifestação sobre cobertura; seguro de vida/suicídio; prescrição; foro; título executivo; e regra de transição para questões históricas.

**Bloqueio automatizado:** `tests/v36_legal_content.py` falha se os dispositivos revogados voltarem a ser apresentados no bloco de Seguro como legislação atual.

## 2. Contradição conhecida em vícios redibitórios

**Status: CORRIGIDO.**

A frase que qualificava genericamente a ação redibitória com “prazo prescricional de 3 anos” foi saneada. O material passa a indicar os prazos decadenciais do art. 445 do Código Civil, evitando contradição interna com o próprio bloco posterior do acervo.

## 3. Direito Empresarial

**Status: APROFUNDADO.**

Os cinco capítulos criados na v35.9 foram ampliados para que a profundidade não fique materialmente inferior ao peso de Empresarial na 1ª fase:

- Direito Societário;
- Direito Falimentar e Recuperacional;
- Títulos de Crédito;
- Teoria Geral do Direito Empresarial;
- Contratos Empresariais.

Cada capítulo teórico passa a superar o piso de 800 palavras verificado pelo teste da v36. Foram priorizadas regras de alta utilidade para prova e fontes oficiais, incluindo SLU/EIRELI, requisitos e efeitos da recuperação judicial, títulos de crédito, empresário/estabelecimento, franquia e representação comercial.

## 4. Questões autorais curadas

A v36 adiciona 18 questões autorais revisadas, todas marcadas `authorial-reviewed`, excluídas das estatísticas históricas e acompanhadas de fundamento, armadilha, regra de revisão e análise A/B/C/D. Elas cobrem Seguro e os cinco núcleos reforçados de Empresarial.

## 5. Limites desta auditoria

Esta rodada **não equivale a revisão humana individual de todas as questões e de todas as linhas do acervo legado**. O release acrescenta governança, testes de regressão e correções verificadas. Conteúdo legado que não recebeu revisão individual continua devendo ser identificado como legado/em revisão onde aplicável.

## 6. Bloqueadores permanentes de release

A partir da v36, deve bloquear publicação qualquer ocorrência comprovada de:

1. legislação revogada ensinada como vigente;
2. divergência jurídica atual não documentada;
3. questão autoral apresentada como oficial;
4. perda de questão/conteúdo útil sem justificativa explícita;
5. quebra de progressão ou de isolamento de conta;
6. disciplina de peso relevante com profundidade materialmente inferior à exigência da prova;
7. falha responsiva crítica nas rotas principais.
