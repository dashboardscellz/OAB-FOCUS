# QA DE ENGENHARIA — OAB Focus v26

Data da validação: 07/09/2026

## Escopo da v26

A v26 substitui a arquitetura permanente de três colunas do leitor (Índice + Material + Seu estudo) por uma leitura central ampla e telas internas próprias para Índice, Seu estudo, Grifos e Anotações. As telas internas permanecem dentro da SPA e retornam ao ponto anterior da leitura por `← Voltar à leitura`.

## Validações executadas

### 1. Sintaxe JavaScript

Comando:

```bash
node --check data/v26-patch.js
```

Resultado: exit code 0, sem erro de sintaxe.

### 2. Suíte automatizada v26

Comando:

```bash
python3 -m pytest tests/v26_reader_architecture.py -q
```

Resultado final:

```text
..................                                                       [100%]
18 passed in 8.04s
```

Cobertura dessa suíte:

- `v26-patch.js` carregado depois da v25;
- contrato `readerSession / setView / returnToReading`;
- remoção das laterais permanentes do leitor;
- origem real da leitura preservada;
- Índice como tela interna;
- Seu estudo como tela interna com cards largos;
- conclusão da unidade integrada ao progresso pedagógico legado;
- domínio/fragilidade quando existe amostra adaptativa;
- restauração de posição da leitura;
- grifador oculto nas telas internas;
- Grifos e Anotações como telas internas;
- origem exata ao abrir questões contextuais;
- Modo Foco como estado do leitor;
- responsividade em 360, 390, 430 e 768 px;
- banco com pelo menos 2.336 questões preservado;
- mapas continuam removidos.

### 3. Preservação estrutural

Verificação local executada sobre o pacote:

```text
PRESERVATION_OK 2336
```

Foi confirmado:

- 2.336 enunciados de questões presentes no `index.html`;
- `data/v26-patch.js` carregado após `data/v25-patch.js`;
- ausência de `maps/`;
- ausência de `maps-hd/`;
- ausência de `data/map-manifest.js`.

### 4. Smoke test com a aplicação completa em Chromium

Para evitar dependência de rede/Firebase no ambiente isolado, todos os scripts locais `data/*.js` foram incorporados em memória ao HTML e carregados no Chromium real (`/usr/bin/chromium`). Requisições externas foram bloqueadas durante o QA; os dados e patches locais foram carregados integralmente.

Rotas testadas e resultado:

- `prepare`: renderizou, 0 erros JavaScript;
- `review`: renderizou, 0 erros JavaScript;
- `highyield`: renderizou, 0 erros JavaScript;
- `questions`: renderizou, 0 erros JavaScript;
- `profile`: renderizou, 0 erros JavaScript;
- `reader`: 1 toolbar v26, 1 artigo, 0 TOCs laterais, 0 painéis laterais, 0 overflow, 0 erros JavaScript.

### 5. Largura mobile no leitor real

No mesmo carregamento completo em Chromium:

| Viewport | Overflow horizontal |
|---|---:|
| 360 px | 0 px |
| 390 px | 0 px |
| 430 px | 0 px |
| 768 px | 0 px |

## Arquitetura final validada

Fluxo principal:

```text
Leitura
├── Índice → ← Voltar à leitura
├── Seu estudo → ← Voltar à leitura
├── Grifos → ← Voltar à leitura
├── Anotações → ← Voltar à leitura
├── Questões desta unidade → Voltar ao material exato
└── Modo Foco → Sair do foco
```

A leitura deixa de dividir permanentemente a largura com Índice e Seu estudo. Esses recursos continuam disponíveis, mas em telas internas próprias.

## Observação do ambiente de QA

O navegador do ambiente bloqueia navegação direta para `localhost`/`file://` por política administrativa. Por isso o smoke test da aplicação completa foi realizado com `page.set_content()` e todos os scripts locais incorporados em memória. Isso testa o HTML, dados e JavaScript reais do pacote, sem depender da publicação no GitHub Pages ou do Firebase.
