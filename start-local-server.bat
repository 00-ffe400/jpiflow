@echo off
chcp 65001 >nul
title ExamVue 365 Flow - Local Server
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\local-server.ps1" %*
pause
