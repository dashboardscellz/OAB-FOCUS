@echo off
chcp 65001 >nul
setlocal

rem Usa SEMPRE a pasta onde este .cmd esta salvo como origem.
set "SRC=%~dp0"
set "DST=C:\Users\endoa\Documents\GitHub\OAB-FOCUS"

echo ==============================================
echo   OAB FOCUS v35.13 - ARQUITETURA MOBILE
echo ==============================================
echo.
echo Origem: %SRC%
echo Destino: %DST%
echo.

if not exist "%SRC%index.html" (
  echo ERRO: index.html nao foi encontrado ao lado deste arquivo.
  echo Extraia o ZIP inteiro e execute este .cmd de dentro da pasta v35.
  pause
  exit /b 2
)

if not exist "%SRC%data\integral-material.js" (
  echo ERRO: a pasta data da v35 nao foi encontrada.
  pause
  exit /b 3
)

if not exist "%SRC%data\v20-patch.js" (
  echo ERRO: o patch principal da v20 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v21-patch.js" (
  echo ERRO: o patch principal da v21 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v22-patch.js" (
  echo ERRO: o patch principal da v22 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v23-patch.js" (
  echo ERRO: o patch principal da v23 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v24-patch.js" (
  echo ERRO: o patch principal da v24 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v25-patch.js" (
  echo ERRO: o patch principal da v25 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v26-patch.js" (
  echo ERRO: o patch principal da v26 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v27-patch.js" (
  echo ERRO: o patch principal da v27 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v28-patch.js" (
  echo ERRO: o patch principal da v28 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v29-patch.js" (
  echo ERRO: o patch principal da v29 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v30-questions.js" (
  echo ERRO: as questoes da 47a OAB nao foram encontradas.
  pause
  exit /b 4
)

if not exist "%SRC%data\v30-patch.js" (
  echo ERRO: o patch principal da v30 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v32-patch.js" (
  echo ERRO: o patch principal da v32 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v33-patch.js" (
  echo ERRO: o patch principal da v33 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v34-research.js" (
  echo ERRO: a pesquisa juridica da v34 nao foi encontrada.
  pause
  exit /b 4
)

if not exist "%SRC%data\v34-patch.js" (
  echo ERRO: o patch principal da v34 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v35-auth.js" (
  echo ERRO: o isolamento de contas da v35 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v35-shell.js" (
  echo ERRO: o shell da v35 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v35-shell.css" (
  echo ERRO: o CSS profissional da v35 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v35-state.js" (
  echo ERRO: o estado compartilhado da v35.8 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v35-question-quality.js" (
  echo ERRO: o motor de qualidade de questoes da v35.8 nao foi encontrado.
  pause
  exit /b 4
)

if not exist "%SRC%data\v35-content-coverage.js" (
  echo ERRO: a cobertura pedagogica da v35.9 nao foi encontrada.
  pause
  exit /b 4
)

if not exist "%SRC%data\v35-taxonomy.js" (
  echo ERRO: a taxonomia pedagogica global da v35.5 nao foi encontrada.
  pause
  exit /b 4
)

if not exist "%SRC%data\v35-text-quality.js" (
  echo ERRO: a camada de higienizacao textual da v35.11 nao foi encontrada.
  pause
  exit /b 4
)

if not exist "%SRC%data\v35-question-navigation.js" (
  echo ERRO: a separacao entre banco de questoes e Prepare-se da v35.12 nao foi encontrada.
  pause
  exit /b 4
)

if not exist "%SRC%data\v35-mobile-app.js" (
  echo ERRO: a arquitetura mobile JS da v35.13 nao foi encontrada.
  pause
  exit /b 4
)

if not exist "%SRC%data\v35-mobile-app.css" (
  echo ERRO: a arquitetura mobile CSS da v35.13 nao foi encontrada.
  pause
  exit /b 4
)

if not exist "%DST%\.git" (
  echo ERRO: a pasta de destino nao parece ser o repositorio OAB-FOCUS.
  echo O destino esperado e:
  echo %DST%
  pause
  exit /b 5
)

echo Copiando a v35...
echo.
robocopy "%SRC%" "%DST%" /E /R:1 /W:1 /XD ".git" /XF "ATUALIZAR_GITHUB.cmd" "_qa_inline.html"
set "RC=%ERRORLEVEL%"

if %RC% GEQ 8 (
  echo.
  echo ERRO na copia. Codigo Robocopy: %RC%
  echo Nao faca commit antes de revisar a aba Changes.
  pause
  exit /b %RC%
)

rem Mapas continuam removidos desde a v14.2.
if exist "%DST%\maps" rmdir /s /q "%DST%\maps"
if exist "%DST%\maps-hd" rmdir /s /q "%DST%\maps-hd"
if exist "%DST%\data\map-manifest.js" del /q "%DST%\data\map-manifest.js"
if exist "%DST%\_qa_inline.html" del /q "%DST%\_qa_inline.html"

echo.
echo Verificando arquivos essenciais no destino...
if not exist "%DST%\index.html" goto :verify_error
if not exist "%DST%\data\integral-material.js" goto :verify_error
if not exist "%DST%\data\highyield-static.js" goto :verify_error
if not exist "%DST%\data\v15-study-map.js" goto :verify_error
if not exist "%DST%\data\v15-patch.js" goto :verify_error
if not exist "%DST%\data\v16-question-map.js" goto :verify_error
if not exist "%DST%\data\v16-patch.js" goto :verify_error
if not exist "%DST%\data\v17-patch.js" goto :verify_error
if not exist "%DST%\data\v18-patch.js" goto :verify_error
if not exist "%DST%\data\v20-patch.js" goto :verify_error
if not exist "%DST%\data\v21-patch.js" goto :verify_error
if not exist "%DST%\data\v22-patch.js" goto :verify_error
if not exist "%DST%\data\v23-patch.js" goto :verify_error
if not exist "%DST%\data\v24-patch.js" goto :verify_error
if not exist "%DST%\data\v25-patch.js" goto :verify_error
if not exist "%DST%\data\v26-patch.js" goto :verify_error
if not exist "%DST%\data\v27-patch.js" goto :verify_error
if not exist "%DST%\data\v28-patch.js" goto :verify_error
if not exist "%DST%\data\v29-patch.js" goto :verify_error
if not exist "%DST%\data\v30-questions.js" goto :verify_error
if not exist "%DST%\data\v30-patch.js" goto :verify_error
if not exist "%DST%\data\v32-patch.js" goto :verify_error
if not exist "%DST%\data\v33-patch.js" goto :verify_error
if not exist "%DST%\data\v34-research.js" goto :verify_error
if not exist "%DST%\data\v34-patch.js" goto :verify_error
if not exist "%DST%\data\v35-auth.js" goto :verify_error
if not exist "%DST%\data\v35-shell.js" goto :verify_error
if not exist "%DST%\data\v35-shell.css" goto :verify_error
if not exist "%DST%\data\v35-state.js" goto :verify_error
if not exist "%DST%\data\v35-question-quality.js" goto :verify_error
if not exist "%DST%\data\v35-content-coverage.js" goto :verify_error
if not exist "%DST%\data\v35-taxonomy.js" goto :verify_error
if not exist "%DST%\data\v35-text-quality.js" goto :verify_error
if not exist "%DST%\data\v35-question-navigation.js" goto :verify_error
if not exist "%DST%\data\v35-mobile-app.js" goto :verify_error
if not exist "%DST%\data\v35-mobile-app.css" goto :verify_error
if exist "%DST%\maps" goto :verify_error
if exist "%DST%\maps-hd" goto :verify_error
if exist "%DST%\data\map-manifest.js" goto :verify_error

echo OK: v35.13 copiada e arquivos essenciais validados.
echo.
echo ==============================================
echo COPIA CONCLUIDA.
echo Agora abra o GitHub Desktop:
echo 1. Confira a aba Changes.
echo 2. Summary: OAB Focus v35.13 - arquitetura mobile
echo 3. Commit to main
echo 4. Push origin
echo ==============================================
pause
endlocal
exit /b 0

:verify_error
echo ERRO: a verificacao final encontrou inconsistencias.
echo Nao faca commit. Confira a copia.
pause
exit /b 6
