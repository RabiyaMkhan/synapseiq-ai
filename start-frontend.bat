@echo off
title SynapseIQ AI - Frontend
color 0B
echo ==========================================
echo   SynapseIQ AI - Frontend Server  
echo ==========================================
echo.
set PATH=C:\Users\Dell\AppData\Local\Temp\node-install\node-v20.18.0-win-x64;%PATH%
cd /d C:\Users\Dell\Documents\project3\synapseiq-ai\frontend
npx vite --host
pause
