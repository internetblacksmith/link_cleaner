// appium.config.js - Appium server configuration
module.exports = {
  server: {
    port: 4723,
    host: 'localhost',
    basePath: '/wd/hub'
  },
  
  // Flutter-specific settings
  flutter: {
    android: {
      appPackage: 'com.example.link_cleaner',
      appActivity: '.MainActivity',
      automationName: 'Flutter',
      platformName: 'Android',
      platformVersion: '13',
      deviceName: 'Pixel_6_API_33',
      app: '../flutter/build/app/outputs/flutter-apk/app-debug.apk'
    },
    ios: {
      automationName: 'Flutter',
      platformName: 'iOS',
      platformVersion: '16.0',
      deviceName: 'iPhone 14',
      app: '../flutter/build/ios/iphonesimulator/Runner.app',
      bundleId: 'com.example.linkCleaner'
    }
  },
  
  // React Native-specific settings
  reactNative: {
    android: {
      appPackage: 'com.linkcleaner',
      appActivity: '.MainActivity',
      automationName: 'UiAutomator2',
      platformName: 'Android',
      platformVersion: '13',
      deviceName: 'Pixel_6_API_33',
      app: '../react_native/android/app/build/outputs/apk/debug/app-debug.apk'
    },
    ios: {
      automationName: 'XCUITest',
      platformName: 'iOS',
      platformVersion: '16.0',
      deviceName: 'iPhone 14',
      app: '../react_native/ios/build/Build/Products/Debug-iphonesimulator/LinkCleaner.app',
      bundleId: 'com.linkcleaner'
    }
  },
  
  // Common capabilities
  common: {
    newCommandTimeout: 300,
    noReset: false,
    fullReset: false,
    eventTimings: true,
    printPageSourceOnFindFailure: true
  }
};