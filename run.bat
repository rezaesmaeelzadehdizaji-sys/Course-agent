@echo off
powershell -ExecutionPolicy Bypass -NonInteractive -File "D:\Course agent\generate.ps1"
echo Exit code: %ERRORLEVEL%
