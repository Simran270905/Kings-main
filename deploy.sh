#!/bin/bash

echo "🚀 KKings Jewellery - Payment Tracking System Deployment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend root directory"
    echo "   Expected: KKings_Jewellery-main/"
    exit 1
fi

echo "✅ Frontend directory confirmed"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Build for production
echo "🔨 Building for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed"
    exit 1
fi

echo "✅ Build successful"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ Error: Deployment failed"
    exit 1
fi

echo "✅ Deployment successful!"
echo ""
echo "🎉 Your payment tracking system is now live!"
echo ""
echo "📋 Next Steps:"
echo "1. Visit your Vercel URL"
echo "2. Login to admin panel"
echo "3. Navigate to Payment Tracking"
echo "4. Verify all features working"
echo ""
echo "🔗 Admin Panel: https://your-vercel-url.vercel.app/admin/login"
echo "🔗 Payment Tracking: https://your-vercel-url.vercel.app/admin/payment-tracking"
echo ""
echo "📊 For enhanced features, deploy the enhanced backend:"
echo "   1. Push backend changes to GitHub"
echo "   2. Deploy to Render"
echo "   3. Update environment variables"
echo ""
echo "🎯 Happy tracking! 🚀"
