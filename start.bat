@echo off
title SynapseIQ AI
color 0B
cls
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║       SynapseIQ AI - Starting...             ║
echo  ╚══════════════════════════════════════════════╝
echo.

echo  [1/2] Starting Backend Server (port 5000)...
start "SynapseIQ-Backend" /min cmd /c "set PATH=C:\Users\Dell\AppData\Local\Temp\node-install\node-v20.18.0-win-x64;%PATH% && cd /d C:\Users\Dell\Documents\project3\synapseiq-ai\backend && node server.js"
timeout /t 3 /nobreak >nul

echo  [2/2] Starting Frontend Server (port 3000)...
start "SynapseIQ-Frontend" /min cmd /c "set PATH=C:\Users\Dell\AppData\Local\Temp\node-install\node-v20.18.0-win-x64;%PATH% && cd /d C:\Users\Dell\Documents\project3\synapseiq-ai\frontend && npx vite --host"
timeout /t 4 /nobreak >nul

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║   Both servers are running!                  ║
echo  ║                                              ║
echo  ║   Open in Chrome:  http://localhost:3000     ║
echo  ║                                              ║
echo  ║   To stop: Close the CMD windows             ║
echo  ╚══════════════════════════════════════════════╝
echo.
timeout /t 5 /nobreak >nul
