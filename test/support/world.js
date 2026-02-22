// support/world.js
const { setWorldConstructor, After, Before } = require('@cucumber/cucumber');
const { remote } = require('webdriverio');
const { AppScreen } = require('./screens/AppScreen');

class CustomWorld {
  constructor({ attach }) {
    this.attach = attach;
    this.driver = null;
    this.platform = process.env.PLATFORM || 'flutter';
    this.screen = null;
  }

  async init() {
    const capabilities = this.getCapabilities();
    this.driver = await remote({
      path: '/wd/hub',
      port: 4723,
      capabilities
    });

    // Initialize appropriate screen object based on platform
    const ScreenClass = require(`./screens/${this.platform}/AppScreen`).AppScreen;
    this.screen = new ScreenClass(this.driver);
  }

  getCapabilities() {
    const platform = this.platform;
    const isIOS = process.env.DEVICE_TYPE === 'ios';

    const baseCapabilities = {
      platformName: isIOS ? 'iOS' : 'Android',
      automationName: isIOS ? 'XCUITest' : 'UiAutomator2',
      deviceName: isIOS ? 'iPhone 14' : 'Pixel 6',
      ...(isIOS ? { platformVersion: '16.0' } : { platformVersion: '13' })
    };

    if (platform === 'flutter') {
      return {
        ...baseCapabilities,
        automationName: 'Flutter',
        app: isIOS 
          ? './flutter/build/ios/iphonesimulator/Runner.app'
          : './flutter/build/app/outputs/flutter-apk/app-debug.apk',
        retryBackoffTime: 500
      };
    } else if (platform === 'react-native') {
      return {
        ...baseCapabilities,
        app: isIOS
          ? './react_native/ios/build/Build/Products/Debug-iphonesimulator/LinkCleaner.app'
          : './react_native/android/app/build/outputs/apk/debug/app-debug.apk',
        newCommandTimeout: 300
      };
    }
  }

  async cleanup() {
    if (this.driver) {
      await this.driver.deleteSession();
    }
  }
}

setWorldConstructor(CustomWorld);

Before(async function() {
  await this.init();
});

After(async function(scenario) {
  if (scenario.result.status === 'FAILED') {
    const screenshot = await this.driver.takeScreenshot();
    this.attach(screenshot, 'image/png');
  }
  await this.cleanup();
});