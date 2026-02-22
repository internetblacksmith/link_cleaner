# Link Cleaner - Master Makefile
# Handles building, testing, and deployment for both Flutter and React Native apps

.PHONY: help
help: ## Show this help message
	@echo "Link Cleaner - Available Commands"
	@echo "================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# Variables
FLUTTER_DIR = flutter
RN_DIR = react_native
TEST_DIR = test
TIMESTAMP := $(shell date +%Y%m%d_%H%M%S)

# Platform detection
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
    PLATFORM = macos
else ifeq ($(UNAME_S),Linux)
    PLATFORM = linux
else
    PLATFORM = windows
endif

# ==================== Setup & Dependencies ====================

.PHONY: setup
setup: ## Setup development environment for both platforms
	@echo "🚀 Setting up development environment..."
	@$(MAKE) setup-flutter
	@$(MAKE) setup-react-native
	@$(MAKE) setup-tests

.PHONY: setup-flutter
setup-flutter: ## Setup Flutter development environment
	@echo "📱 Setting up Flutter..."
	@cd $(FLUTTER_DIR) && flutter pub get
	@cd $(FLUTTER_DIR) && flutter pub run flutter_launcher_icons:main
	@echo "✅ Flutter setup complete"

.PHONY: setup-react-native
setup-react-native: ## Setup React Native development environment
	@echo "⚛️  Setting up React Native..."
	@cd $(RN_DIR) && npm install
ifeq ($(PLATFORM),macos)
	@cd $(RN_DIR)/ios && pod install
endif
	@cd $(RN_DIR) && [ -f .env.example ] && cp -n .env.example .env || true
	@echo "✅ React Native setup complete"

.PHONY: setup-tests
setup-tests: ## Setup testing environment
	@echo "🧪 Setting up test environment..."
	@cd $(TEST_DIR) && npm install
	@command -v appium >/dev/null 2>&1 || npm install -g appium@next
	@appium driver list --installed | grep flutter || appium driver install flutter
	@appium driver list --installed | grep uiautomator2 || appium driver install uiautomator2
ifeq ($(PLATFORM),macos)
	@appium driver list --installed | grep xcuitest || appium driver install xcuitest
endif
	@echo "✅ Test environment setup complete"

# ==================== Development ====================

.PHONY: dev-flutter
dev-flutter: ## Start Flutter in development mode
	@echo "🚀 Starting Flutter development server..."
	@cd $(FLUTTER_DIR) && flutter run

.PHONY: dev-rn
dev-rn: ## Start React Native in development mode
	@echo "⚛️  Starting React Native development server..."
	@cd $(RN_DIR) && npm start

.PHONY: dev-rn-android
dev-rn-android: ## Start React Native on Android
	@cd $(RN_DIR) && npm run android

.PHONY: dev-rn-ios
dev-rn-ios: ## Start React Native on iOS
	@cd $(RN_DIR) && npm run ios

# ==================== Linting & Formatting ====================

.PHONY: lint
lint: ## Lint both Flutter and React Native code
	@$(MAKE) lint-flutter
	@$(MAKE) lint-rn

.PHONY: lint-flutter
lint-flutter: ## Lint Flutter code
	@echo "🔍 Linting Flutter code..."
	@cd $(FLUTTER_DIR) && flutter analyze

.PHONY: lint-rn
lint-rn: ## Lint React Native code
	@echo "🔍 Linting React Native code..."
	@cd $(RN_DIR) && npm run lint

.PHONY: format
format: ## Format code for both platforms
	@$(MAKE) format-flutter
	@$(MAKE) format-rn

.PHONY: format-flutter
format-flutter: ## Format Flutter code
	@echo "✨ Formatting Flutter code..."
	@cd $(FLUTTER_DIR) && flutter format lib test

.PHONY: format-rn
format-rn: ## Format React Native code
	@echo "✨ Formatting React Native code..."
	@cd $(RN_DIR) && npx prettier --write "src/**/*.{js,jsx,ts,tsx}"

# ==================== Testing ====================

.PHONY: test
test: ## Run all tests (unit + integration)
	@$(MAKE) test-unit
	@$(MAKE) test-integration

.PHONY: test-unit
test-unit: ## Run unit tests for both platforms
	@echo "🧪 Running unit tests..."
	@$(MAKE) test-unit-flutter
	@$(MAKE) test-unit-rn

.PHONY: test-unit-flutter
test-unit-flutter: ## Run Flutter unit tests
	@echo "🧪 Running Flutter unit tests..."
	@cd $(FLUTTER_DIR) && flutter test --coverage
	@echo "📊 Coverage report: $(FLUTTER_DIR)/coverage/lcov.info"

.PHONY: test-unit-rn
test-unit-rn: ## Run React Native unit tests
	@echo "🧪 Running React Native unit tests..."
	@cd $(RN_DIR) && npm test -- --coverage

.PHONY: test-integration
test-integration: build-debug ## Run integration tests on both platforms
	@echo "🧪 Running cross-platform integration tests..."
	@cd $(TEST_DIR) && ./run-tests.sh --platform all --tags "@core"

.PHONY: test-integration-flutter
test-integration-flutter: build-debug-flutter ## Run integration tests on Flutter only
	@cd $(TEST_DIR) && ./run-tests.sh --platform flutter --tags "@core"

.PHONY: test-integration-rn
test-integration-rn: build-debug-rn ## Run integration tests on React Native only
	@cd $(TEST_DIR) && ./run-tests.sh --platform react-native --tags "@core"

.PHONY: test-e2e
test-e2e: build-debug ## Run full E2E test suite
	@cd $(TEST_DIR) && ./run-tests.sh --platform all --tags "@core and @history and @settings"

.PHONY: test-compare
test-compare: ## Compare test results between platforms
	@echo "📊 Comparing platform test results..."
	@cd $(TEST_DIR) && node tools/compare-platforms.js

# ==================== Building ====================

.PHONY: build
build: ## Build both apps for all platforms
	@$(MAKE) build-flutter
	@$(MAKE) build-rn

.PHONY: build-debug
build-debug: ## Build debug versions for testing
	@$(MAKE) build-debug-flutter
	@$(MAKE) build-debug-rn

.PHONY: build-debug-flutter
build-debug-flutter: ## Build Flutter debug APK
	@echo "🔨 Building Flutter debug APK..."
	@cd $(FLUTTER_DIR) && flutter build apk --debug
ifeq ($(PLATFORM),macos)
	@cd $(FLUTTER_DIR) && flutter build ios --debug --simulator
endif

.PHONY: build-debug-rn
build-debug-rn: ## Build React Native debug APK
	@echo "🔨 Building React Native debug APK..."
	@cd $(RN_DIR)/android && ./gradlew assembleDebug
ifeq ($(PLATFORM),macos)
	@cd $(RN_DIR)/ios && xcodebuild -workspace LinkCleaner.xcworkspace -scheme LinkCleaner -configuration Debug -sdk iphonesimulator -derivedDataPath build
endif

.PHONY: build-flutter
build-flutter: ## Build Flutter for production
	@echo "📦 Building Flutter apps..."
	@cd $(FLUTTER_DIR) && flutter build apk --release
	@cd $(FLUTTER_DIR) && flutter build appbundle --release
ifeq ($(PLATFORM),macos)
	@cd $(FLUTTER_DIR) && flutter build ios --release
endif
	@echo "✅ Flutter builds complete"
	@echo "📁 APK: $(FLUTTER_DIR)/build/app/outputs/flutter-apk/app-release.apk"
	@echo "📁 AAB: $(FLUTTER_DIR)/build/app/outputs/bundle/release/app-release.aab"

.PHONY: build-rn
build-rn: ## Build React Native for production
	@echo "📦 Building React Native apps..."
	@cd $(RN_DIR) && npm run build:android
ifeq ($(PLATFORM),macos)
	@cd $(RN_DIR) && npm run build:ios
endif
	@echo "✅ React Native builds complete"

.PHONY: build-rn-android
build-rn-android: ## Build React Native Android release
	@cd $(RN_DIR)/android && ./gradlew bundleRelease

.PHONY: build-rn-ios
build-rn-ios: ## Build React Native iOS release
	@cd $(RN_DIR)/ios && xcodebuild -workspace LinkCleaner.xcworkspace -scheme LinkCleaner -configuration Release

# ==================== Release Management ====================

.PHONY: release
release: ## Create a new release for both platforms
	@echo "🚀 Creating release $(VERSION)..."
	@test -n "$(VERSION)" || (echo "VERSION is required. Usage: make release VERSION=1.0.1" && exit 1)
	@$(MAKE) release-flutter VERSION=$(VERSION)
	@$(MAKE) release-rn VERSION=$(VERSION)
	@git tag -a "v$(VERSION)" -m "Release v$(VERSION)"
	@echo "✅ Release v$(VERSION) created. Don't forget to push tags!"

.PHONY: release-flutter
release-flutter: ## Update Flutter version
	@echo "📝 Updating Flutter version to $(VERSION)..."
	@sed -i.bak 's/version: .*/version: $(VERSION)+$$(date +%s)/' $(FLUTTER_DIR)/pubspec.yaml
	@rm $(FLUTTER_DIR)/pubspec.yaml.bak

.PHONY: release-rn
release-rn: ## Update React Native version
	@echo "📝 Updating React Native version to $(VERSION)..."
	@cd $(RN_DIR) && npm version $(VERSION) --no-git-tag-version

# ==================== Deployment ====================

.PHONY: deploy-android
deploy-android: ## Deploy to Google Play Store (both apps)
	@echo "🚀 Deploying to Google Play Store..."
	@echo "Flutter AAB: $(FLUTTER_DIR)/build/app/outputs/bundle/release/app-release.aab"
	@echo "React Native AAB: $(RN_DIR)/android/app/build/outputs/bundle/release/app-release.aab"
	@echo "Upload these files to Google Play Console"

.PHONY: deploy-ios
deploy-ios: ## Deploy to App Store (both apps)
ifeq ($(PLATFORM),macos)
	@echo "🍎 Deploying to App Store..."
	@cd $(FLUTTER_DIR)/ios && fastlane release
	@cd $(RN_DIR)/ios && fastlane release
else
	@echo "❌ iOS deployment requires macOS"
endif

# ==================== Dependency Management ====================

.PHONY: deps-check
deps-check: ## Check for outdated dependencies in both platforms
	@echo "🔍 Checking for outdated dependencies..."
	@$(MAKE) deps-check-flutter
	@$(MAKE) deps-check-rn

.PHONY: deps-check-flutter
deps-check-flutter: ## Check Flutter dependencies
	@echo "📱 Checking Flutter dependencies..."
	@cd $(FLUTTER_DIR) && flutter pub outdated

.PHONY: deps-check-rn
deps-check-rn: ## Check React Native dependencies
	@echo "⚛️  Checking React Native dependencies..."
	@cd $(RN_DIR) && npm outdated || true

.PHONY: deps-update
deps-update: ## Update all dependencies to latest versions
	@echo "📦 Updating all dependencies..."
	@$(MAKE) deps-update-flutter
	@$(MAKE) deps-update-rn
	@$(MAKE) deps-pin

.PHONY: deps-update-flutter
deps-update-flutter: ## Update Flutter dependencies
	@echo "📱 Updating Flutter dependencies..."
	@cd $(FLUTTER_DIR) && flutter pub upgrade --major-versions
	@cd $(FLUTTER_DIR) && flutter pub get

.PHONY: deps-update-rn
deps-update-rn: ## Update React Native dependencies
	@echo "⚛️  Updating React Native dependencies..."
	@cd $(RN_DIR) && npm update --save
	@cd $(RN_DIR) && npm audit fix || true

.PHONY: deps-pin
deps-pin: ## Pin all dependencies to exact versions
	@echo "📌 Pinning dependencies to exact versions..."
	@./scripts/pin-dependencies.sh

.PHONY: deps-install
deps-install: ## Install all dependencies with exact versions
	@echo "📦 Installing pinned dependencies..."
	@cd $(FLUTTER_DIR) && flutter pub get
	@cd $(RN_DIR) && npm ci

.PHONY: deps-security
deps-security: ## Check for security vulnerabilities
	@echo "🔒 Checking for security vulnerabilities..."
	@cd $(RN_DIR) && npm audit
	@echo "Note: Flutter doesn't have built-in security audit. Check pub.dev for advisories."

# ==================== Utilities ====================

.PHONY: clean
clean: ## Clean build artifacts for both platforms
	@echo "🧹 Cleaning build artifacts..."
	@$(MAKE) clean-flutter
	@$(MAKE) clean-rn
	@rm -rf $(TEST_DIR)/reports/*

.PHONY: clean-flutter
clean-flutter: ## Clean Flutter build artifacts
	@cd $(FLUTTER_DIR) && flutter clean

.PHONY: clean-rn
clean-rn: ## Clean React Native build artifacts
	@cd $(RN_DIR) && rm -rf node_modules
	@cd $(RN_DIR)/android && ./gradlew clean
ifeq ($(PLATFORM),macos)
	@cd $(RN_DIR)/ios && rm -rf build Pods
endif

.PHONY: deep-clean
deep-clean: clean ## Deep clean including dependencies
	@echo "🧹 Deep cleaning..."
	@rm -rf $(FLUTTER_DIR)/.dart_tool
	@rm -rf $(FLUTTER_DIR)/pubspec.lock
	@rm -rf $(RN_DIR)/package-lock.json
	@rm -rf $(RN_DIR)/yarn.lock
	@rm -rf $(TEST_DIR)/node_modules
	@rm -rf $(TEST_DIR)/package-lock.json

.PHONY: doctor
doctor: ## Check development environment health
	@echo "🏥 Running health checks..."
	@echo "\n📱 Flutter Doctor:"
	@flutter doctor -v
	@echo "\n⚛️  React Native Doctor:"
	@cd $(RN_DIR) && npx react-native doctor
	@echo "\n🧪 Appium Doctor:"
	@appium driver doctor flutter || true
	@appium driver doctor uiautomator2 || true
ifeq ($(PLATFORM),macos)
	@appium driver doctor xcuitest || true
endif

.PHONY: logs
logs: ## Show logs for running apps
	@echo "📜 Showing device logs..."
ifeq ($(PLATFORM),macos)
	@xcrun simctl spawn booted log stream --level debug --predicate 'subsystem == "com.example.link_cleaner" OR subsystem == "com.linkcleaner"'
else
	@adb logcat -s ReactNative:V ReactNativeJS:V flutter:V
endif

.PHONY: screenshot
screenshot: ## Take a screenshot of the current screen
	@echo "📸 Taking screenshot..."
	@mkdir -p screenshots
ifeq ($(PLATFORM),macos)
	@xcrun simctl io booted screenshot "screenshots/screenshot_$(TIMESTAMP).png"
else
	@adb shell screencap -p /sdcard/screenshot.png
	@adb pull /sdcard/screenshot.png "screenshots/screenshot_$(TIMESTAMP).png"
	@adb shell rm /sdcard/screenshot.png
endif
	@echo "✅ Screenshot saved to screenshots/screenshot_$(TIMESTAMP).png"

# ==================== CI/CD Commands ====================

.PHONY: ci-test
ci-test: ## Run tests in CI environment
	@$(MAKE) lint
	@$(MAKE) test-unit
	@$(MAKE) build-debug
	@$(MAKE) test-integration

.PHONY: ci-build
ci-build: ## Build apps in CI environment
	@$(MAKE) clean
	@$(MAKE) setup
	@$(MAKE) build

# ==================== Development Shortcuts ====================

.PHONY: f
f: dev-flutter ## Shortcut for Flutter development

.PHONY: r
r: dev-rn ## Shortcut for React Native development

.PHONY: t
t: test ## Shortcut for running all tests

.PHONY: b
b: build ## Shortcut for building all apps