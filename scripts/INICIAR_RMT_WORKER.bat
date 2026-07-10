@echo off
title L2 Versus - RMT Worker (escrow/deliver/restore)
REM ============================================================
REM  Mantem o worker do RMT rodando: consome rmt_item_ops e move
REM  itens com seguranca (so com o personagem OFFLINE).
REM  Deixe esta janela aberta junto com o site/servidor.
REM  Reinicia sozinho se cair.
REM ============================================================
cd /d "%~dp0.."
:loop
echo.
echo [%date% %time%] iniciando RMT worker...
node scripts\rmt-worker.mjs
echo.
echo [%date% %time%] worker caiu (exit %errorlevel%). Reiniciando em 5s...
timeout /t 5 /nobreak >nul
goto loop
