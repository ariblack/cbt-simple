@echo off
title CBT Offline Server
echo.
echo  ============================
echo    CBT OFFLINE SMK PEMBANGUNAN
echo  ============================
echo.
echo  Server berjalan di http://localhost:3001
echo  Tekan Ctrl+C untuk menghentikan server
echo.
start "" http://localhost:3001
node server.js