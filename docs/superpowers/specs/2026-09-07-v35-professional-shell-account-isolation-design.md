# OAB Focus v35 — Professional Shell + Isolamento de Contas

Data: 2026-09-07
Base: OAB Focus v34
Status: design aprovado em conversa; aguardando revisão deste documento antes do plano de implementação.

## 1. Objetivos

A v35 tem dois objetivos inseparáveis:

1. elevar a interface do OAB Focus a um padrão visual profissional de plataforma educacional, usando como referência de composição a linguagem enviada pelo usuário (barra superior global, navegação horizontal, hierarquia tipográfica, densidade e espaçamento), sem copiar identidade, marca, cores ou conteúdo de terceiros;
2. eliminar qualquer possibilidade de uma conta carregar, exibir ou salvar dados de outra conta, com atenção especial a cadastro e troca de sessão em celular.

A mudança deve preservar material jurídico integral, 2.416+ questões, trilha v34, progresso, Firebase, ranking, administração, revisão, temporizador, grifos, questões da 47ª OAB, login legado e mapas mentais removidos.

## 2. Diagnóstico do bug de contas

### 2.1 Colisão de identidade técnica

Na v34, `technicalEmail(username)` usa `slug(username)` e transforma variantes diferentes no mesmo e-mail técnico. Exemplos como `joao.silva`, `joao-silva`, `joao_silva` e `joao silva` podem convergir para a mesma identidade de autenticação. A autenticação então pode abrir o UID correto para aquela identidade técnica, mas `completeLogin()` não valida se o `profile.username` encontrado corresponde ao nome de usuário realmente digitado.

### 2.2 Cadastro altera a sessão global

`submitRegistration()` chama `keepSession(created, username)` apenas para conseguir gravar o perfil do novo usuário. Isso substitui `authSession` e `localStorage` da conta corrente pela sessão da conta recém-criada. Depois a sessão é removida, mas variáveis e fluxos do usuário anterior podem continuar vivos em memória. Em celular, onde a mesma aba tende a permanecer aberta por mais tempo, isso amplia o risco de estado visual cruzado.

### 2.3 Estado em memória não é zerado de forma centralizada

Logout/login limpam parte do estado, mas não existe um único `resetAccountRuntimeState()` responsável por interromper timers/streams e zerar fila de questões, resposta selecionada, estudo atual, payload de rota, scroll handler, filtros temporários e outras referências de sessão antes de carregar outra conta.

## 3. Arquitetura de identidade v35

### 3.1 Chave canônica

Criar `canonicalUsernameKey(username)` com estas regras:

- `trim`;
- Unicode normalizado;
- comparação sem diferença de maiúsculas/minúsculas;
- acentos equivalentes para login humano;
- preservar pontuação significativa (`.`, `_`, `-`) para não transformar usuários diferentes na mesma chave;
- espaços não serão aceitos em novos nomes de usuário, mas contas legadas continuam suportadas.

Assim, `Manassés` e `manasses` continuam equivalentes, mas `joao.silva`, `joao-silva` e `joao_silva` deixam de ser a mesma identidade.

### 3.2 E-mail técnico v35 sem colisão por slug

Novos cadastros não usarão mais `slug(username)@oabfocus.app`. A chave canônica será transformada por SHA-256 e o digest hexadecimal de 64 caracteres será usado como local-part do e-mail técnico. Isso preserva determinismo de login sem expor o nome e torna colisões práticas desprezíveis.

`signInUser()` tentará na ordem:

1. identidade técnica v35;
2. identidade técnica legada da v34 e anteriores.

Contas antigas continuam entrando normalmente.

### 3.3 Validação obrigatória após autenticação

Depois de autenticar, antes de carregar `progress`, o sistema deve comparar:

- chave canônica do usuário digitado;
- chave canônica de `profile.username`.

Se não coincidirem, o login é rejeitado, a sessão é apagada e nenhum progresso é carregado. Essa barreira impede que uma colisão legada abra o perfil de outro usuário.

Perfis v35 terão `identityVersion: 35` e `usernameKey`. Perfis antigos poderão receber esses campos por migração segura depois de um login válido.

## 4. Cadastro sem tocar na sessão atual

Criar `dbRequestWithToken(path, idToken, options)` para operações explicitamente autenticadas com o token retornado pelo cadastro.

Novo fluxo:

1. validar nome, usuário e senha;
2. criar conta via `signUp` com e-mail técnico v35;
3. usar `created.idToken` diretamente para gravar `users/{created.localId}/profile`;
4. nunca chamar `keepSession()` durante cadastro;
5. nunca substituir a sessão do usuário atualmente logado;
6. se gravação do perfil falhar, excluir a conta recém-criada usando o token retornado;
7. encerrar com mensagem de cadastro pendente.

## 5. Isolamento de runtime por conta

Criar `resetAccountRuntimeState({preserveTheme:true})` e executá-lo:

- antes de completar qualquer login;
- no logout;
- quando `restoreSession()` falhar;
- antes de trocar para um UID diferente;
- após exclusão de conta.

A função deve:

- parar `studyTicker`, `saveTicker`, timer de questão e guard de conta;
- fechar/reiniciar stream de ranking;
- remover `readerScrollHandler`;
- zerar `currentStudy`, `currentQuestionId`, `qQueue`, `qIndex`, `selectedAnswer`, `routePayload`, flags móveis e dados temporários;
- zerar `user`, `profile`, `progress` somente no momento apropriado;
- nunca apagar tema/aparência global;
- impedir `saveProgress()` se o UID ativo não for o mesmo UID que carregou o objeto `progress`.

Introduzir `progressOwnerUid`. Ao carregar progresso: `progressOwnerUid = user.uid`. Antes de qualquer PUT de progresso: exigir `user.uid === progressOwnerUid`; caso contrário, abortar e registrar erro de segurança.

## 6. Professional Shell v35

### 6.1 Navegação global

Substituir a sidebar fixa como navegação principal por uma barra superior em dois níveis no desktop:

**Linha 1 — utilitária**
- marca OAB Focus;
- busca global;
- sessão de estudo;
- acesso rápido a perfil/conta.

**Linha 2 — navegação horizontal**
- Início;
- Estudar;
- Prepare-se;
- Questões;
- Revisar;
- Desempenho;
- Mais cobrados;
- menu `Mais` para Ranking, Perfil, Configurações e Administração quando aplicável.

A sidebar deixa de existir globalmente. Ela só aparece como navegação contextual em fluxos onde agrega orientação, principalmente Trilha/Estudar, área administrativa e eventualmente índice do leitor.

### 6.2 Linguagem visual

Padronizar a aplicação com:

- uma única família sans-serif para UI e conteúdo principal;
- Georgia removida de títulos operacionais e do leitor;
- escala tipográfica enxuta e previsível;
- largura de conteúdo central de aproximadamente 1180–1240 px em páginas de dashboard;
- leitor com coluna de texto legível independente do dashboard;
- fundo claro neutro;
- bordas de 1 px e sombras mínimas;
- raio menor e consistente;
- cards usados apenas quando existe agrupamento semântico real;
- seções separadas por whitespace/divisórias em vez de caixas excessivas;
- vinho/azul do OAB Focus como acentos, não como preenchimento constante;
- menos emojis em navegação; preferir símbolos/ícones consistentes;
- estados hover/focus/active visíveis e acessíveis.

### 6.3 Página inicial

A home deve se aproximar do padrão estrutural profissional da referência:

- cabeçalho de boas-vindas compacto;
- busca/ação de estudo central;
- blocos horizontais de acesso rápido;
- painel de progresso e recomendações com densidade controlada;
- sem hero gigante;
- sem mosaico de cards com alturas aleatórias.

### 6.4 Telas de estudo

Em `Estudar` e `Trilha`, sidebar contextual pode ocupar 260–300 px no desktop, mas sem competir com a barra global. O conteúdo principal deve seguir grade rígida. No leitor, foco é a leitura: tipografia sans-serif, largura confortável, toolbar reduzida e índice contextual opcional.

### 6.5 Mobile

No celular:

- uma única topbar compacta;
- navegação principal em bottom bar com no máximo cinco destinos;
- destinos secundários em menu `Mais`;
- sidebar contextual vira drawer/bottom sheet;
- nenhuma navegação horizontal desktop deve produzir overflow;
- modais de cadastro/login ocupam largura útil sem elementos fora da tela;
- safe areas respeitadas;
- testes específicos para 360, 390, 430 e 768 px.

## 7. Migração e compatibilidade

- nenhuma questão/material é removido;
- nenhuma chave de progresso remoto existente é renomeada sem migração;
- contas legadas continuam autenticando pelo fallback antigo;
- login legado só é aceito quando o `profile.username` corresponde ao usuário digitado segundo a nova chave canônica;
- cadastro novo usa exclusivamente identidade v35;
- progresso remoto é sempre lido de `users/{uid}/progress` e guardado com `progressOwnerUid`;
- tema permanece preferência global do dispositivo;
- mapas mentais continuam ausentes.

## 8. Testes obrigatórios

### Conta e segurança

1. `joao.silva`, `joao-silva` e `joao_silva` geram identidades técnicas v35 distintas.
2. `Manassés` e `manasses` produzem a mesma chave humana canônica.
3. login legado continua funcionando para conta antiga válida.
4. colisão legada + username de perfil diferente deve resultar em rejeição, nunca carregamento de dados.
5. cadastro durante sessão da Conta A não pode alterar `authSession`, `user`, `profile`, `progress` ou `progressOwnerUid` da Conta A.
6. falha ao salvar perfil do cadastro apaga a conta recém-criada e preserva sessão atual.
7. Conta B nunca consegue salvar um objeto `progress` cujo `progressOwnerUid` pertence à Conta A.
8. logout e troca de conta zeram fila de questões, estudo atual, resposta selecionada, handlers e timers.
9. restoreSession com UID inválido não deixa estado residual.

### Layout desktop

10. 1366×768, 1440×900 e 1920×1080 sem overflow horizontal.
11. barra superior em dois níveis permanece íntegra e navegação ativa visível.
12. sidebar global não ocupa espaço nas rotas comuns.
13. sidebar contextual aparece apenas nas rotas definidas.
14. conteúdo não ultrapassa largura máxima nem fica excessivamente estreito.

### Mobile

15. 360×800, 390×844, 430×932 e 768×1024 sem overflow horizontal.
16. menu móvel e bottom navigation não se sobrepõem ao conteúdo.
17. cadastro e login continuam completamente utilizáveis.
18. troca de conta no mesmo navegador não reaproveita dados visuais da anterior.

### Regressão funcional

19. trilha v34, questões, revisão, grifos, timer e Prepare-se continuam acessíveis.
20. 47ª OAB permanece no banco.
21. mapas mentais continuam ausentes.
22. Firebase config e regras existentes permanecem compatíveis ou recebem alteração explicitamente testada.

## 9. Critérios de aceitação

A v35 só pode ser entregue se:

- nenhum teste de isolamento de conta falhar;
- o cenário de colisão de slug for reproduzido na v34 e bloqueado na v35;
- o cenário de cadastro durante sessão ativa for reproduzido na v34 e preservado na v35;
- desktop e mobile forem validados com browser real, não apenas inspeção de CSS;
- suíte anterior continuar verde;
- ZIP passar em teste de integridade;
- o pacote final for baseado em v34, sem reintroduzir v31 ou mapas mentais.
