# OAB Focus — GitHub + Firebase Realtime Database

Plataforma pessoal de estudos da 1ª fase da OAB construída a partir dos materiais enviados.

## O que já está dentro

- 13 semanas / 91 dias de cronograma.
- 1.000 questões gabaritadas extraídas da apostila enviada.
- 3 simulados completos de 80 questões cada (240 questões extras).
- Filtros por disciplina, exame, status e busca textual.
- Caderno de erros, favoritas, notas por questão e revisão inteligente.
- Estatísticas por disciplina, aproveitamento, tentativas e tempo médio.
- Biblioteca com todos os PDFs enviados, inclusive o arquivo de artigos mais cobrados.
- Login visual: `Manassés Oliveira` / `12345`.
- Progresso salvo localmente e sincronizado no Firebase Realtime Database.

## Firebase já configurado

Projeto: `oab-focus`

Database URL: `https://oab-focus-default-rtdb.firebaseio.com`

As regras usadas neste projeto são propositalmente simples e abertas, conforme solicitado. O login do site não é uma autenticação de segurança real; ele é apenas uma barreira visual.

## Publicar no Firebase Hosting

Instale Node.js e Firebase CLI. Depois, dentro desta pasta:

```bash
npm install -g firebase-tools
firebase login
firebase use oab-focus
firebase deploy --only database,hosting
```

O endereço deverá ficar parecido com:

`https://oab-focus.web.app`

## Subir no GitHub

Recomendação: use um repositório **privado**, pois este pacote contém os PDFs fornecidos por você.

```bash
git init
git add .
git commit -m "OAB Focus"
git branch -M main
git remote add origin SEU_REPOSITORIO_GITHUB
git push -u origin main
```

## Observação sobre integridade das questões

A plataforma não cria questões genéricas. O gabarito exibido é o gabarito da fonte enviada. A questão global nº 167 da apostila tinha uma quebra de formatação no PDF/OCR; as quatro alternativas foram reconstruídas somente separando os próprios trechos que estavam fundidos na fonte, mantendo o gabarito indicado no material. A questão nº 143 aparece na própria fonte com três alternativas e foi preservada assim.
