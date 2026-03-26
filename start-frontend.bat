@echo off
echo ========================================
echo KKings Jewellery - Frontend Startup
echo ========================================

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

:: Check if port 5173 is already in use
echo 🔍 Checking if port 5173 is available...
netstat -ano | findstr :5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Port 5173 is already in use. Killing existing processes...
    taskkill /F /IM node.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
)

:: Navigate to frontend directory
cd /d "%~dp0"

:: Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found. Creating default .env file...
    (
        echo VITE_API_URL=http://localhost:5000/api
        echo VITE_RAZORPAY_KEY=rzp_test_SITfLVVfxHyUDe
        echo VITE_CLOUDINARY_CLOUD_NAME=dkbxrhe1v
        echo VITE_CLOUDINARY_UPLOAD_PRESET=kkings_uploads
    ) > .env
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

:: Start the frontend
echo 🚀 Starting frontend server...
echo 📍 Frontend will be available at: http://localhost:5173
echo 📍 Backend API should be running at: http://localhost:5000/api
echo.
echo Press Ctrl+C to stop the server
echo ========================================

npm run dev

pause
