@echo off
chcp 65001 >nul
setlocal
set "SRC=%~dp0"
set "DST=C:\Users\endoa\Documents\GitHub\OAB-FOCUS"

echo ==============================================
echo   OAB FOCUS v13 - ATUALIZACAO DO REPOSITORIO
echo ==============================================
echo.
echo Origem: %SRC%
echo Destino: %DST%
echo.

if not exist "%DST%\.git" (
  echo ERRO: A pasta de destino nao parece ser o repositorio OAB-FOCUS.
  echo Confira se o GitHub Desktop clonou o projeto em:
  echo %DST%
  pause
  exit /b 1
)

robocopy "%SRC%" "%DST%" /E /R:1 /W:1 /XD ".git" /XF "ATUALIZAR_GITHUB.cmd"
set "RC=%ERRORLEVEL%"

if %RC% GEQ 8 (
  echo.
  echo O Windows informou erro na copia. Codigo: %RC%
  pause
  exit /b %RC%
)

echo.
echo ==============================================
echo COPIA CONCLUIDA.
echo Agora abra o GitHub Desktop:
echo 1. Confira a aba Changes
echo 2. Summary: OAB Focus v13
echo 3. Commit to main
echo 4. Push origin
echo ==============================================
pause
endlocal
