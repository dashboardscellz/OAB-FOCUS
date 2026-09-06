# OAB Focus — Super Material v7

Plataforma estática para GitHub Pages com conteúdo consolidado no próprio repositório e Firebase apenas para usuários/progresso.

## Publicação no GitHub Pages

Envie **o conteúdo desta pasta** para a raiz do repositório `OAB-FOCUS`:

- `index.html`
- `assets/`
- `data/`
- `AUDITORIA_JURIDICA_2026.md`
- `audit-report.json`
- `.nojekyll`
- `database.rules.json`
- `firebase.json`
- `.firebaserc`

Em **Settings → Pages**: `Deploy from a branch` → `main` → `/(root)`.

## Firebase

O conteúdo de estudo **não fica no Firebase**. Ele está nos arquivos `data/` e é igual para todos os usuários.

O Firebase Realtime Database guarda apenas:
- perfis/controle de acesso;
- respostas;
- tempo de estudo;
- favoritos e anotações;
- XP, nível, insígnias e estatísticas.

### Regras

No Realtime Database, substitua as regras pelas de `database.rules.json`.

### Primeiro acesso do administrador

- Usuário: `Manassés`
- Senha: `12345`

No primeiro acesso, se a conta técnica ainda não existir, o site cria a conta ADM automaticamente. A senha digitada é transformada internamente para atender ao mínimo do Firebase Auth.

Depois: **Administração → Novo usuário**.

## Auditoria jurídica

A base original tinha 3.174 questões. A versão atual aplica deduplicação e uma auditoria conservadora até 05/09/2026. Questões atingidas por reformas ou pertencentes a coortes históricas de alto risco em disciplinas profundamente reformadas foram **removidas**, e não adaptadas artificialmente.

Consulte `AUDITORIA_JURIDICA_2026.md` e `audit-report.json`.


## Novidades da v7

- página de entrada com foto e apresentação do criador;
- visual refinado com paleta azul-marinho + vinho;
- área **Estudar** reorganizada, com busca estável e trilha por disciplina/assunto;
- leitura do material em blocos mais limpos e confortáveis;
- busca dentro do assunto sem perder foco no campo;
- mais de 70 insígnias, separadas entre comuns e raras;
- interface de questões sem exibir fontes editoriais;
- manutenção da auditoria jurídica conservadora sobre questões desatualizadas.
