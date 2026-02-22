# Cross-Platform Integration Testing

This directory contains integration tests that can run on both Flutter and React Native implementations of Link Cleaner using Cucumber and Appium.

## Overview

The testing framework uses:
- **Cucumber**: For BDD-style test definitions
- **Appium**: For mobile automation
- **WebdriverIO**: As the Appium client
- **Platform-specific drivers**:
  - Flutter Driver for Flutter apps
  - UiAutomator2 (Android) and XCUITest (iOS) for React Native

## Setup

### Prerequisites

1. **Install Appium**:
```bash
npm install -g appium@next
```

2. **Install Appium drivers**:
```bash
# For Flutter
appium driver install flutter

# For React Native
appium driver install uiautomator2  # Android
appium driver install xcuitest      # iOS
```

3. **Install test dependencies**:
```bash
cd test
npm install
```

### Build Apps for Testing

#### Flutter
```bash
cd flutter

# Android
flutter build apk --debug

# iOS
flutter build ios --simulator --debug
```

#### React Native
```bash
cd react_native

# Android
cd android && ./gradlew assembleDebug
cd ..

# iOS
cd ios && xcodebuild -workspace LinkCleaner.xcworkspace -scheme LinkCleaner -configuration Debug -sdk iphonesimulator -derivedDataPath build
```

## Running Tests

### Run all tests on both platforms:
```bash
npm test
```

### Run tests on specific platform:
```bash
# Flutter only
npm run test:flutter

# React Native only
npm run test:react-native
```

### Run specific test tags:
```bash
CUCUMBER_TAGS="@core" npm test
CUCUMBER_TAGS="@history" npm test
CUCUMBER_TAGS="@settings and @theme" npm test
```

### Run on specific device:
```bash
# iOS
DEVICE_TYPE=ios npm run test:flutter

# Android (default)
npm run test:flutter
```

## Test Structure

```
test/
├── features/              # Gherkin feature files
│   ├── url_cleaning.feature
│   ├── history.feature
│   └── settings.feature
├── step-definitions/      # Step implementations
│   ├── url-cleaning-steps.js
│   ├── history-steps.js
│   └── settings-steps.js
├── support/              # Test framework setup
│   ├── world.js          # Test context
│   └── screens/          # Page objects
│       ├── flutter/      # Flutter-specific selectors
│       └── react-native/ # RN-specific selectors
└── reports/              # Test reports
```

## Writing Tests

### Feature Files

Write tests in Gherkin syntax:
```gherkin
Feature: URL Cleaning
  Scenario: Clean a URL
    Given I am on the home screen
    When I share the URL "https://example.com?utm_source=test"
    Then the cleaned URL should be "https://example.com"
```

### Page Objects

Platform-specific implementations handle UI differences:

**Flutter** (`support/screens/flutter/AppScreen.js`):
```javascript
async tap(selector) {
  await this.driver.flutter.tap(selector);
}
```

**React Native** (`support/screens/react-native/AppScreen.js`):
```javascript
async tap(selector) {
  const element = await this.driver.$(selector);
  await element.click();
}
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest
    strategy:
      matrix:
        platform: [flutter, react-native]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install Appium
      run: |
        npm install -g appium@next
        appium driver install flutter
        appium driver install xcuitest
    
    - name: Build App
      run: |
        if [ "${{ matrix.platform }}" = "flutter" ]; then
          cd flutter && flutter build ios --simulator
        else
          cd react_native && npm install
          cd ios && pod install
          xcodebuild -workspace LinkCleaner.xcworkspace -scheme LinkCleaner -configuration Debug -sdk iphonesimulator
        fi
    
    - name: Run Tests
      run: |
        cd test
        npm install
        npm run test:${{ matrix.platform }}
```

## Debugging

### Enable Appium logs:
```bash
APPIUM_LOG_LEVEL=debug npm test
```

### Take screenshots on failure:
Screenshots are automatically captured on test failure and attached to the report.

### View HTML report:
```bash
open reports/cucumber-report.html
```

### Common Issues

1. **Flutter Driver not finding elements**:
   - Ensure you're using debug/profile builds (not release)
   - Add `await driver.flutter.waitFor()` before interactions

2. **React Native element not found**:
   - Add accessibility IDs to components
   - Use proper wait strategies

3. **Share intent not working**:
   - Platform-specific implementation needed
   - May require additional permissions

## Best Practices

1. **Use semantic selectors**: Prefer text and accessibility IDs over XPath
2. **Add waits**: Mobile apps need time to render
3. **Keep tests atomic**: Each scenario should be independent
4. **Use tags**: Organize tests for selective execution
5. **Platform abstraction**: Keep platform differences in page objects

## Extending Tests

### Add new feature:
1. Create feature file in `features/`
2. Run tests to generate step snippets
3. Implement steps in `step-definitions/`
4. Add page object methods if needed

### Add new platform:
1. Create new directory in `support/screens/`
2. Implement AppScreen class with platform-specific selectors
3. Update `world.js` to handle new platform
4. Add configuration in `appium.config.js`