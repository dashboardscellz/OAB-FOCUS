# OAB Focus — Super v8

Versão pronta para GitHub Pages.

## O que vai para o GitHub
Envie **estes arquivos diretamente para a raiz do repositório**:

- `index.html`
- `.nojekyll`
- `database.rules.json`
- `AUDITORIA_JURIDICA_2026.md`

O `index.html` já contém internamente:
- CSS;
- JavaScript;
- Super Material;
- banco ativo de questões;
- foto da página de entrada;
- configuração de conexão com Firebase.

Não existe mais pasta `data/`, `assets/` ou arquivo privado obrigatório para o site funcionar.

## GitHub Pages
Settings → Pages → Deploy from a branch → `main` → `/(root)`.

## Firebase
O Firebase continua apenas para usuários e progresso. O conteúdo acadêmico está embutido no site.

Authentication: mantenha **E-mail/senha** ativado.

Realtime Database: mantenha as regras já configuradas. Se precisar reaplicá-las, use `database.rules.json`.

## Administrador
Usuário: `Manassés`
Senha inicial: `12345`

## v8
- correção da tela presa em “Preparando seu ambiente de estudos”;
- Firebase sem dependência do SDK modular externo na inicialização;
- watchdog de carregamento;
- tela de entrada com foto/apresentação;
- Home profissional com plano diário e trilha recomendada;
- Estudar com apenas 8 disciplinas inicialmente e expansão sob demanda;
- buscas que mantêm o foco enquanto o usuário digita;
- leitor de assunto refeito em blocos claros;
- 85 insígnias comuns/raras;
- metadados de fontes editoriais removidos do banco exibido/embutido;
- questões continuam auditadas e desatualizadas removidas conservadoramente.
