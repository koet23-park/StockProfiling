@echo off
cd /d "D:\0. AI\Claude\Stock Profiling ver2"
start "" /b pythonw -m http.server 5500
timeout /t 1 /nobreak > nul
start "" "http://localhost:5500/dashboard.html"
