# OAB Focus v4 — GitHub Pages + Firebase Realtime Database

## O que esta versão faz
- Exibe **resumos, cronogramas, legislação e questões comentadas diretamente no site**, sem abrir PDF.
- Mede **tempo ativo de estudo** por material e **tempo ativo de resolução** de questões (pausa quando a guia fica em segundo plano).
- Estatísticas por matéria, melhores/piores matérias, caderno de erros, favoritas e anotações.
- **Level Up + XP + insígnias**.
- Simulados em modo prova.
- Multiusuário com **Manassés como administrador**, criação/desativação de alunos e ranking da turma.
- Para alunos: marca d’água nominal e bloqueios comuns de copiar/imprimir/selecionar.
- O conteúdo fica no Firebase, **não no GitHub**.

## Arquivos
- Este ZIP (`OAB_Focus_GitHub_v4.zip`) vai para o GitHub.
- `OAB_Focus_CONTEUDO_PRIVADO_v4.json` **NÃO vai para o GitHub**. Ele é importado pelo painel Admin do próprio site.

## 1. Firebase Authentication
Mantenha **E-mail/senha** ativado (já foi feito no projeto `oab-focus`).

## 2. Realtime Database — regras
Na aba **Realtime Database > Regras**, substitua as regras abertas pelo conteúdo de `database.rules.json` e publique.

## 3. GitHub Pages
Envie o conteúdo deste ZIP para a raiz do repositório. Em **Settings > Pages**:
- Source: Deploy from a branch
- Branch: main
- Folder: /(root)

## 4. Primeiro login do administrador
Abra o site e entre:
- Usuário: `Manassés`
- Senha: `12345`

Na primeira entrada, a conta administrativa é criada e vinculada ao Firebase Authentication.

## 5. Importar o conteúdo
Abra **Admin > Importar base privada** e selecione `OAB_Focus_CONTEUDO_PRIVADO_v4.json`.
A primeira importação pode levar algum tempo porque a base contém centenas de páginas transcritas e mais de 1.500 questões.

## 6. Criar outros usuários
Em **Admin > Cadastrar aluno**, defina nome, usuário e senha. O aluno recebe acesso somente enquanto o perfil estiver ativo.

## Observação importante sobre proteção contra cópia
Nenhuma página web consegue tornar conteúdo visualizado **absolutamente impossível** de capturar (por exemplo, fotografia da tela). Esta versão aplica barreiras práticas: conteúdo fora do GitHub, autenticação, perfil ativo, marca d’água nominal, bloqueio de seleção/cópia/impressão/menu de contexto e atalhos comuns.

## Arquivo chamado “PROVA OAB 47.pdf”
O arquivo enviado com esse nome identifica-se internamente como **45º Exame de Ordem Unificado** e foi cadastrado como 45º EOU para preservar a identificação do próprio documento.


## Novo caderno Gran OAB
A base privada v4 acrescenta 1.600 questões gabaritadas, do 18º ao 37º Exame de Ordem (20 provas completas de 80 questões).
