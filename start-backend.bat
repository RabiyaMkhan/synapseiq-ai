@echo off
title SynapseIQ AI - Backend
color 0A
echo ==========================================
echo   SynapseIQ AI - Backend Server
echo ==========================================
echo.
set PATH=C:\Users\Dell\AppData\Local\Temp\node-install\node-v20.18.0-win-x64;%PATH%
cd /d C:\Users\Dell\Documents\project3\synapseiq-ai\backend
node server.js
pause
