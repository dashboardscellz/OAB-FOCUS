@echo off
chcp 65001 >nul
setlocal

rem Usa SEMPRE a pasta onde este .cmd esta salvo como origem.
set "SRC=%~dp0"
set "DST=C:\Users\endoa\Documents\GitHub\OAB-FOCUS"

echo ==============================================
echo   OAB FOCUS v16 - ATUALIZACAO DO REPOSITORIO
echo ==============================================
echo.
echo Origem: %SRC%
echo Destino: %DST%
echo.

if not exist "%SRC%index.html" (
  echo ERRO: index.html nao foi encontrado ao lado deste arquivo.
  echo Extraia o ZIP inteiro e execute este .cmd de dentro da pasta v16.
  pause
  exit /b 2
)

if not exist "%SRC%data\integral-material.js" (
  echo ERRO: a pasta data da v16 nao foi encontrada.
  pause
  exit /b 3
)

if not exist "%DST%\.git" (
  echo ERRO: a pasta de destino nao parece ser o repositorio OAB-FOCUS.
  echo O destino esperado e:
  echo %DST%
  pause
  exit /b 5
)

echo Copiando a v16...
echo.
robocopy "%SRC%" "%DST%" /E /R:1 /W:1 /XD ".git" /XF "ATUALIZAR_GITHUB.cmd"
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

echo.
echo Verificando arquivos essenciais no destino...
if not exist "%DST%\index.html" goto :verify_error
if not exist "%DST%\data\integral-material.js" goto :verify_error
if not exist "%DST%\data\highyield-static.js" goto :verify_error
if not exist "%DST%\data\v15-study-map.js" goto :verify_error
if not exist "%DST%\data\v15-patch.js" goto :verify_error
if not exist "%DST%\data\v16-question-map.js" goto :verify_error
if not exist "%DST%\data\v16-patch.js" goto :verify_error
if exist "%DST%\maps" goto :verify_error
if exist "%DST%\maps-hd" goto :verify_error
if exist "%DST%\data\map-manifest.js" goto :verify_error

echo OK: v16 copiada e arquivos essenciais validados.
echo.
echo ==============================================
echo COPIA CONCLUIDA.
echo Agora abra o GitHub Desktop:
echo 1. Confira a aba Changes.
echo 2. Summary: OAB Focus v16 - leitor profissional e revisao inteligente
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
