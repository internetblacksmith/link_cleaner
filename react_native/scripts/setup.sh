#!/bin/bash

# Setup script for React Native Link Cleaner development

echo "🚀 Setting up Link Cleaner React Native development environment..."

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment files
if [ ! -f .env.development ]; then
    echo "📝 Creating .env.development from .env.example..."
    cp .env.example .env.development
fi

if [ ! -f .env.production ]; then
    echo "📝 Creating .env.production from .env.example..."
    cp .env.example .env.production
fi

# iOS specific setup
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Setting up iOS environment..."
    
    # Check if CocoaPods is installed
    if ! command -v pod &> /dev/null; then
        echo "📦 Installing CocoaPods..."
        sudo gem install cocoapods
    fi
    
    # Install iOS dependencies
    cd ios
    pod install
    cd ..
    
    echo "✅ iOS setup complete"
fi

# Android specific setup
echo "🤖 Setting up Android environment..."

# Create local.properties if it doesn't exist
if [ ! -f android/local.properties ]; then
    echo "📝 Creating android/local.properties..."
    if [ -n "$ANDROID_HOME" ]; then
        echo "sdk.dir=$ANDROID_HOME" > android/local.properties
        echo "✅ Android SDK path set"
    else
        echo "⚠️  ANDROID_HOME not set. Please set it manually in android/local.properties"
    fi
fi

# Setup git hooks
echo "🔧 Setting up git hooks..."
npx husky install

# Setup pre-commit hook
npx husky add .husky/pre-commit "npm run lint-staged"

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.development with your configuration"
echo "2. Run 'npm start' to start Metro bundler"
echo "3. Run 'npm run android' or 'npm run ios' to start the app"
echo ""
echo "For more information, see DEVELOPMENT_DEPLOYMENT_GUIDE.md"