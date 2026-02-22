// support/screens/flutter/AppScreen.js
class AppScreen {
  constructor(driver) {
    this.driver = driver;
  }

  // Element selectors using Flutter finder
  get selectors() {
    return {
      homeScreen: { text: 'Link Cleaner' },
      shareButton: { text: 'Share' },
      copyButton: { text: 'Copy' },
      clearAllButton: { text: 'Clear All' },
      historyIcon: { tooltip: 'History' },
      settingsIcon: { tooltip: 'Settings' },
      urlCard: { type: 'UrlCard' },
      parameterItem: { type: 'ParameterItem' },
      emptyState: { type: 'EmptyState' },
      snackbar: { type: 'SnackBar' }
    };
  }

  async waitForElement(selector, timeout = 10000) {
    return await this.driver.flutter.waitFor(selector, timeout);
  }

  async tap(selector) {
    const element = await this.waitForElement(selector);
    await this.driver.flutter.tap(element);
  }

  async getText(selector) {
    const element = await this.waitForElement(selector);
    return await this.driver.flutter.getText(element);
  }

  async isDisplayed(selector) {
    try {
      await this.waitForElement(selector, 3000);
      return true;
    } catch {
      return false;
    }
  }

  async shareUrl(url) {
    // Flutter-specific implementation to simulate sharing
    // This would need to be implemented based on your test setup
    await this.driver.flutter.injectUrl(url);
  }

  async getParameterCount() {
    const parameters = await this.driver.flutter.find.byType('ParameterItem');
    return parameters.length;
  }

  async toggleParameter(parameterKey) {
    const parameter = await this.driver.flutter.find.descendant({
      of: { type: 'ParameterItem' },
      matching: { text: parameterKey }
    });
    await this.driver.flutter.tap(parameter);
  }

  async getCleanedUrl() {
    const urlText = await this.driver.flutter.find.descendant({
      of: { type: 'UrlCard' },
      matching: { type: 'SelectableText' }
    });
    return await this.driver.flutter.getText(urlText);
  }

  async navigateToHistory() {
    await this.tap(this.selectors.historyIcon);
  }

  async navigateToSettings() {
    await this.tap(this.selectors.settingsIcon);
  }
}

module.exports = { AppScreen };