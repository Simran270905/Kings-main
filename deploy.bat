@echo off
echo 🚀 KKings Jewellery - Payment Tracking System Deployment
echo ==================================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the frontend root directory
    echo    Expected: KKings_Jewellery-main\
    pause
    exit /b 1
)

echo ✅ Frontend directory confirmed

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

echo ✅ Vercel CLI ready

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed

REM Build for production
echo 🔨 Building for production...
npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Build failed
    pause
    exit /b 1
)

echo ✅ Build successful

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Deployment failed
    pause
    exit /b 1
)

echo ✅ Deployment successful!
echo.
echo 🎉 Your payment tracking system is now live!
echo.
echo 📋 Next Steps:
echo 1. Visit your Vercel URL
echo 2. Login to admin panel  
echo 3. Navigate to Payment Tracking
echo 4. Verify all features working
echo.
echo 🔗 Admin Panel: https://your-vercel-url.vercel.app/admin/login
echo 🔗 Payment Tracking: https://your-vercel-url.vercel.app/admin/payment-tracking
echo.
echo 📊 For enhanced features, deploy the enhanced backend:
echo    1. Push backend changes to GitHub
echo    2. Deploy to Render  
echo    3. Update environment variables
echo.
echo 🎯 Happy tracking! 🚀
pause
