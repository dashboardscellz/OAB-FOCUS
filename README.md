# OAB Focus — Super v8.1

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
- foto da página de entrada em alta resolução;
- configuração de conexão com Firebase.

Não existe arquivo privado obrigatório para o conteúdo acadêmico funcionar. As credenciais de acesso não são exibidas no site nem documentadas no repositório.

## GitHub Pages
Settings → Pages → Deploy from a branch → `main` → `/(root)`.

## Firebase
O Firebase continua apenas para usuários e progresso. O conteúdo acadêmico está embutido no site.

Authentication: mantenha **E-mail/senha** ativado.

Realtime Database: mantenha as regras já configuradas. Se precisar reaplicá-las, use `database.rules.json`.

## Administrador
Usuário: `Manassés`
Senha do administrador: definida no Firebase Authentication e não publicada no repositório.

## v8.1
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

- login legado migrado automaticamente para o padrão atual sem publicar senha;
- credenciais removidas da tela e do README;
- retrato do fundador reposicionado e otimizado em alta resolução;
- texto do fundador revisado sem travessões.
