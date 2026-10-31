@echo off
set PATH=C:\Users\dell\mingit\cmd;%PATH%
git add .
git commit -m "update"
git pull --rebase origin main
git push origin main
del push_commit.bat
