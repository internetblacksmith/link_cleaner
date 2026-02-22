#!/bin/bash
# fix-environment.sh - Fix development environment issues

echo "🔧 Fixing development environment..."

# Set Java 17 from Android Studio
export JAVA_HOME=/home/paolo/android/android-studio/jbr
export PATH=$JAVA_HOME/bin:$PATH

# Android SDK
export ANDROID_HOME=/home/paolo/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

echo "✅ Environment variables set:"
echo "   JAVA_HOME=$JAVA_HOME"
echo "   ANDROID_HOME=$ANDROID_HOME"
echo ""
echo "📝 Add these lines to your ~/.bashrc or ~/.zshrc:"
echo ""
echo "# Android development"
echo "export JAVA_HOME=/home/paolo/android/android-studio/jbr"
echo "export PATH=\$JAVA_HOME/bin:\$PATH"
echo "export ANDROID_HOME=/home/paolo/Android/Sdk"
echo "export PATH=\$PATH:\$ANDROID_HOME/emulator"
echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
echo "export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin"
echo ""
echo "Then run: source ~/.bashrc"