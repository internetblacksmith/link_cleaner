// support/screens/react-native/AppScreen.js
class AppScreen {
  constructor(driver) {
    this.driver = driver;
  }

  // Element selectors using accessibility IDs or XPath
  get selectors() {
    return {
      homeScreen: '//android.widget.TextView[@text="Link Cleaner"]',
      shareButton: '~Share',
      copyButton: '~Copy',
      clearAllButton: '//android.widget.TextView[@text="Clear All"]',
      historyIcon: '//android.widget.TextView[@text="📜"]',
      settingsIcon: '//android.widget.TextView[@text="⚙️"]',
      urlCard: '~url-card',
      parameterItem: '~parameter-item',
      emptyState: '~empty-state',
      snackbar: '//android.widget.TextView[contains(@text, "copied")]'
    };
  }

  async waitForElement(selector, timeout = 10000) {
    return await this.driver.$(selector).waitForExist({ timeout });
  }

  async tap(selector) {
    const element = await this.driver.$(selector);
    await element.click();
  }

  async getText(selector) {
    const element = await this.driver.$(selector);
    return await element.getText();
  }

  async isDisplayed(selector) {
    try {
      const element = await this.driver.$(selector);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async shareUrl(url) {
    // React Native specific implementation
    // This would simulate the share intent
    await this.driver.execute('mobile: shareIntent', {
      action: 'android.intent.action.SEND',
      type: 'text/plain',
      extras: {
        'android.intent.extra.TEXT': url
      }
    });
  }

  async getParameterCount() {
    const parameters = await this.driver.$$('~parameter-item');
    return parameters.length;
  }

  async toggleParameter(parameterKey) {
    const parameter = await this.driver.$(`//android.widget.TextView[@text="${parameterKey}"]/..`);
    await parameter.click();
  }

  async getCleanedUrl() {
    const urlText = await this.driver.$('~cleaned-url-text');
    return await urlText.getText();
  }

  async navigateToHistory() {
    await this.tap(this.selectors.historyIcon);
  }

  async navigateToSettings() {
    await this.tap(this.selectors.settingsIcon);
  }
}

module.exports = { AppScreen };