#!/bin/bash

# Android Release Build Script

echo "📱 Building Android Release..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Bundle JavaScript
echo "📦 Bundling JavaScript..."
npx react-native bundle \
    --platform android \
    --dev false \
    --entry-file index.js \
    --bundle-output android/app/src/main/assets/index.android.bundle \
    --assets-dest android/app/src/main/res

# Remove duplicate resources
echo "🔧 Removing duplicate resources..."
rm -rf android/app/src/main/res/drawable-*
rm -rf android/app/src/main/res/raw

# Build AAB (Android App Bundle)
echo "🏗️ Building AAB..."
cd android
./gradlew bundleRelease

# Build APK for testing
echo "🏗️ Building APK..."
./gradlew assembleRelease

cd ..

echo "✅ Build complete!"
echo ""
echo "📦 Outputs:"
echo "AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo "APK: android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "Next steps:"
echo "1. Test the APK on a device"
echo "2. Upload the AAB to Google Play Console"