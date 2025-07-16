@echo off
title Zaalimmm! Shawarma Dev Server
echo Starting the Zaalimmm! Shawarma Business Manager...

:: Start the Next.js development server
start "Zaalimmm! Dev Server" npm run dev

echo.
echo Waiting 5 seconds for the server to initialize...
timeout /t 5 /nobreak > nul

echo.
echo Opening the application in your default browser at http://localhost:9002
start http://localhost:9002

echo.
echo The development server is running in a separate window.
echo You can close this window now.
