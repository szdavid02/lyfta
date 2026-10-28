@echo off
rem Feltolti a valtozasokat a GitHubra. Futtatas: dupla katt.
cd /d "%~dp0"
git add -A
git commit -m "Frissites"
git pull --rebase
git push
echo.
echo Kesz. Par perc mulva frissul az oldal.
pause
