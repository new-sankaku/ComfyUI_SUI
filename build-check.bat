@echo off
setlocal

echo ============================================
echo   ComfyUI_SUI Build Check
echo ============================================
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo [INFO] node_modules not found. Running npm install...
    call npm install
    if errorlevel 1 (
        echo [FAIL] npm install failed.
        exit /b 1
    )
    echo.
)

echo [1/3] Running ESLint...
call npx eslint js/
if errorlevel 1 (
    echo [FAIL] ESLint found errors.
    exit /b 1
)
echo [PASS] ESLint: no errors
echo.

echo [2/3] Running Prettier check...
call npx prettier --check "js/**/*.js" "css/**/*.css" "*.html"
if errorlevel 1 (
    echo [FAIL] Prettier found formatting issues. Run: npm run format
    exit /b 1
)
echo [PASS] Prettier: all files formatted
echo.

echo [3/3] Running tests...
call npx vitest run
if errorlevel 1 (
    echo [FAIL] Tests failed.
    exit /b 1
)
echo [PASS] Tests: all passed
echo.

echo ============================================
echo   All checks passed!
echo ============================================
exit /b 0
