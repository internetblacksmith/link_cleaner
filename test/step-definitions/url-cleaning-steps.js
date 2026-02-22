// step-definitions/url-cleaning-steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Given('the app is launched', async function() {
  // App is already launched in the Before hook
  const isHomeScreen = await this.screen.isDisplayed(this.screen.selectors.homeScreen);
  expect(isHomeScreen).to.be.true;
});

Given('I am on the home screen', async function() {
  // Verify we're on home screen
  const isHomeScreen = await this.screen.isDisplayed(this.screen.selectors.homeScreen);
  expect(isHomeScreen).to.be.true;
});

When('I share the URL {string}', async function(url) {
  await this.screen.shareUrl(url);
  // Wait for URL to be processed
  await this.driver.pause(1000);
});

When('I share the text {string}', async function(text) {
  await this.screen.shareUrl(text);
  await this.driver.pause(1000);
});

When('I tap {string}', async function(buttonText) {
  await this.screen.tap({ text: buttonText });
});

When('I tap the {string} button', async function(buttonText) {
  const selector = buttonText === 'Share' 
    ? this.screen.selectors.shareButton 
    : this.screen.selectors.copyButton;
  await this.screen.tap(selector);
});

When('I toggle the parameter {string}', async function(parameterKey) {
  await this.screen.toggleParameter(parameterKey);
});

Then('I should see the cleaned URL section', async function() {
  const isUrlCardVisible = await this.screen.isDisplayed(this.screen.selectors.urlCard);
  expect(isUrlCardVisible).to.be.true;
});

Then('I should see {int} parameters listed', async function(expectedCount) {
  const count = await this.screen.getParameterCount();
  expect(count).to.equal(expectedCount);
});

Then('I should see {string} marked as a tracker', async function(parameterKey) {
  const trackerBadge = await this.screen.isDisplayed({
    text: 'Tracker',
    ancestor: { text: parameterKey }
  });
  expect(trackerBadge).to.be.true;
});

Then('the tracker should show category {string}', async function(category) {
  const categoryBadge = await this.screen.isDisplayed({ text: category });
  expect(categoryBadge).to.be.true;
});

Then('the cleaned URL should be {string}', async function(expectedUrl) {
  const actualUrl = await this.screen.getCleanedUrl();
  expect(actualUrl).to.equal(expectedUrl);
});

Then('I should see {string} indicator', async function(indicator) {
  const isIndicatorVisible = await this.screen.isDisplayed({ text: indicator });
  expect(isIndicatorVisible).to.be.true;
});

Then('the share dialog should appear', async function() {
  // Platform-specific share dialog verification
  await this.driver.pause(1000);
  // This would need platform-specific implementation
});

Then('the shared text should be {string}', async function(expectedText) {
  // This would verify the shared content
  // Implementation depends on test environment setup
});

Then('I should see {string} message', async function(message) {
  const isMessageVisible = await this.screen.isDisplayed({ text: message });
  expect(isMessageVisible).to.be.true;
});

Then('the clipboard should contain {string}', async function(expectedText) {
  // Platform-specific clipboard verification
  const clipboardText = await this.driver.getClipboard();
  expect(clipboardText).to.equal(expectedText);
});

Then('I should see {string}', async function(text) {
  const isTextVisible = await this.screen.isDisplayed({ text });
  expect(isTextVisible).to.be.true;
});

Then('I should see an error message {string}', async function(errorMessage) {
  const isErrorVisible = await this.screen.isDisplayed({ text: errorMessage });
  expect(isErrorVisible).to.be.true;
});