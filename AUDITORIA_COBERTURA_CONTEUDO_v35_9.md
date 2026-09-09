# OAB Focus v35.9 — Auditoria de Cobertura Pedagógica

Data: 08/09/2026

## Objetivo

Fechar os achados CONT-01 e CONT-02 da auditoria v35.7 sem apagar o conteúdo legado: Filosofia passa a ter material integral real e Financeiro, Internacional, Ambiental, Direitos Humanos e Empresarial deixam de depender de um único bloco de legislação crua.

## Resultado

- 20/20 disciplinas anunciadas no menu possuem pelo menos uma seção de teoria no material efetivo após os patches.
- 30/30 tópicos das seis disciplinas reparadas possuem capítulo de `Teoria completa` com título correspondente ao tópico mostrado ao aluno.
- Cada um desses 30 capítulos possui mais de 250 palavras; na versão empacotada, todos superam aproximadamente 280 palavras.
- As cinco disciplinas jurídicas reparadas recebem também 25 blocos normativos específicos (`Lei seca e súmulas`), um por tópico.
- Os cinco blocos antigos de `Legislação integral` foram preservados como `Legislação de referência`, mas deixaram de ser tratados como conteúdo principal repetido em qualquer tópico.
- Filosofia recebeu cinco capítulos próprios: Filosofia do Direito Contemporânea, Hermenêutica Jurídica, Conceito de Direito, Positivismo e Immanuel Kant.
- O gerador autoral foi exercitado estruturalmente sobre os 30 novos tópicos: todos conseguem produzir quatro alternativas completas e feedback estruturado sem frase truncada.

## Disciplinas reparadas

### Filosofia
1. Filosofia do Direito Contemporânea
2. Hermenêutica Jurídica
3. Conceito de Direito
4. Positivismo
5. Immanuel Kant

### Financeiro
1. Orçamento Público
2. PPA, LDO e LOA
3. Créditos Adicionais
4. Responsabilidade Fiscal
5. Regime Fiscal Sustentável

### Internacional
1. Direito Civil Internacional
2. Condição Jurídica do Estrangeiro
3. Competência Internacional
4. Sentença Estrangeira
5. Nacionalidade

### Ambiental
1. Política, Instrumentos e Sistema Nacional do Meio Ambiente
2. Flora e Direito Ambiental
3. Federação e Competências em Matéria Ambiental
4. Teoria Objetiva da Responsabilidade Ambiental
5. Tutela do Meio Ambiente Artificial

### Direitos Humanos
1. Pacto de San José da Costa Rica
2. Política Nacional de Direitos Humanos
3. Pacto Internacional sobre Direitos Civis e Políticos
4. Comissão Interamericana de Direitos Humanos
5. Estatuto da Pessoa com Deficiência

### Empresarial
1. Direito Societário
2. Direito Falimentar e Recuperacional
3. Títulos de Crédito
4. Teoria Geral do Direito Empresarial
5. Contratos Empresariais

## Proteções de regressão

`tests/v35_content_coverage.py` bloqueia publicação se:
- o patch de cobertura deixar de carregar imediatamente após o material integral;
- qualquer uma das 20 disciplinas do menu ficar sem teoria;
- algum dos 30 tópicos reparados perder o capítulo correspondente;
- algum capítulo reparado voltar a ser apenas um fragmento curto;
- o bloco integral antigo voltar a ser injetado como legislação principal em todos os tópicos;
- o conteúdo novo deixar de fornecer proposições completas ao gerador autoral;
- as alternativas/feedback autorais deixarem de ser estruturalmente completos.

## Validação automatizada

A regressão foi executada em três grupos estáveis para evitar falsos negativos por timeout do ambiente:
- grupo 1: 81 testes aprovados;
- grupo 2: 48 testes aprovados;
- grupo 3: 89 testes aprovados.

Total: **218 testes aprovados**.

## Limite de validação

A v35.9 corrige a ausência e a estrutura pedagógica do conteúdo. Isso não equivale a declarar que todas as 2.336 questões históricas foram juridicamente revistas uma a uma. O sistema mantém a distinção entre comentário revisado e comentário legado introduzida na v35.8 e preserva o Prompt Mestre de Qualidade das Questões para evitar a falsa impressão de revisão individual inexistente.
