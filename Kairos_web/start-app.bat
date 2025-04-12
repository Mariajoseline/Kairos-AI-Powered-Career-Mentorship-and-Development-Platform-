@echo off
echo Starting Kairos AI Platform...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed or not in PATH. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm is not installed or not in PATH. Please install Node.js first.
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install
)

REM Install backend dependencies if needed
if not exist "Kairos_web\backend\node_modules" (
    echo Installing backend dependencies...
    cd Kairos_web\backend
    call npm install
    cd ..\..
)

REM Start the application
echo Starting the application...
call npm run dev

pause 