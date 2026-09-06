@echo off
chcp 65001 >nul
setlocal

rem Usa SEMPRE a pasta onde este .cmd esta salvo como origem.
rem Isso evita copiar C:\Users ou outra pasta por engano.
set "SRC=%~dp0"
set "DST=C:\Users\endoa\Documents\GitHub\OAB-FOCUS"

echo ==============================================
echo   OAB FOCUS v14 - ATUALIZACAO DO REPOSITORIO
echo ==============================================
echo.
echo Origem: %SRC%
echo Destino: %DST%
echo.

if not exist "%SRC%index.html" (
  echo ERRO: index.html nao foi encontrado ao lado deste arquivo.
  echo Extraia o ZIP inteiro e execute este .cmd de dentro da pasta v14.
  pause
  exit /b 2
)

if not exist "%SRC%data\integral-material.js" (
  echo ERRO: a pasta data da v14 nao foi encontrada.
  pause
  exit /b 3
)

if not exist "%SRC%maps-hd" (
  echo ERRO: a pasta maps-hd nao foi encontrada.
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

echo Copiando a v14. Os mapas HD somam centenas de arquivos e podem levar alguns minutos...
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

echo.
echo Verificando arquivos essenciais no destino...
if not exist "%DST%\index.html" goto :verify_error
if not exist "%DST%\data\integral-material.js" goto :verify_error
if not exist "%DST%\data\highyield-static.js" goto :verify_error
if not exist "%DST%\maps-hd" goto :verify_error

echo OK: arquivos essenciais encontrados.
echo.
echo ==============================================
echo COPIA CONCLUIDA.
echo Agora abra o GitHub Desktop:
echo 1. Confira se Changes contem apenas arquivos do OAB Focus.
echo 2. Summary: OAB Focus v14
echo 3. Commit to main
echo 4. Push origin
echo ==============================================
pause
endlocal
exit /b 0

:verify_error
echo ERRO: a verificacao final encontrou arquivo essencial ausente.
echo Nao faca commit. Confira a copia.
pause
exit /b 6
