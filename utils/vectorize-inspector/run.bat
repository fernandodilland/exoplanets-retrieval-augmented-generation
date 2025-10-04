@echo off
REM Script to manage Vectorize Inspector

echo.
echo ======================================
echo   Vectorize Inspector - Menu
echo ======================================
echo.
echo 1. Install dependencies
echo 2. Login to Cloudflare (required)
echo 3. Start development server
echo 4. View index info
echo 5. List vectors (100)
echo 6. Export vectors via Wrangler CLI
echo 7. Progressive export via Node.js (Worker must be running)
echo 8. Deploy to Cloudflare
echo 9. Exit
echo.

set /p choice="Select an option (1-9): "

if "%choice%"=="1" goto install
if "%choice%"=="2" goto login
if "%choice%"=="3" goto dev
if "%choice%"=="4" goto info
if "%choice%"=="5" goto list
if "%choice%"=="6" goto export
if "%choice%"=="7" goto progressive
if "%choice%"=="8" goto deploy
if "%choice%"=="9" goto end

echo Invalid option
pause
goto end

:install
echo.
echo Installing dependencies...
cd utils\vectorize-inspector
call npm install
echo.
echo Installation completed!
pause
goto end

:login
echo.
echo Starting Cloudflare login...
echo Your browser will open for authentication
echo.
cd utils\vectorize-inspector
call wrangler login
echo.
echo Login completed!
pause
goto end

:dev
echo.
echo Starting development server...
echo Server will be available at http://localhost:8787
echo Press Ctrl+C to stop
echo.
cd utils\vectorize-inspector
call npm run dev
pause
goto end

:info
echo.
echo Getting index information...
cd utils\vectorize-inspector
call wrangler vectorize info autorag-rag-exoplanets
echo.
pause
goto end

:list
echo.
echo Listing vectors (first 100)...
cd utils\vectorize-inspector
call wrangler vectorize list-vectors autorag-rag-exoplanets --count=100
echo.
pause
goto end

:export
echo.
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
set filename=exports\vectorize-export-%timestamp%.json
echo Exporting vectors via Wrangler CLI to %filename%...
cd utils\vectorize-inspector
call wrangler vectorize list-vectors autorag-rag-exoplanets --count=1000 > %filename%
echo.
echo Export completed: %filename%
pause
goto end

:progressive
echo.
echo Progressive Export via Node.js
echo.
echo IMPORTANT: Make sure the Worker is running in another terminal!
echo Run this first: npm run dev
echo.
pause
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
set filename=exports\progressive-export-%timestamp%.json
cd utils\vectorize-inspector
call node export-all.js %filename%
echo.
pause
goto end

:deploy
echo.
echo Deploying to Cloudflare...
cd utils\vectorize-inspector
call npm run deploy
echo.
echo Deployment completed!
pause
goto end

:end
echo.
echo Thank you for using Vectorize Inspector!
pause
