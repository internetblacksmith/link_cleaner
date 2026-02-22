// step-definitions/history-steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Given('I have cleaned the following URLs:', async function(dataTable) {
  const urls = dataTable.hashes();
  for (const urlData of urls) {
    await this.screen.shareUrl(urlData.original_url);
    await this.driver.pause(500);
  }
  // Return to home screen
  await this.driver.back();
});

When('I tap the history icon', async function() {
  await this.screen.navigateToHistory();
  await this.driver.pause(500);
});

When('I tap the first history item', async function() {
  const firstItem = await this.driver.$('(//android.view.ViewGroup[@content-desc="history-item"])[1]');
  await firstItem.click();
});

When('I confirm the clear action', async function() {
  // Platform-specific alert handling
  if (this.platform === 'react-native') {
    await this.driver.acceptAlert();
  } else {
    await this.screen.tap({ text: 'Clear' });
  }
});

Then('I should be on the history screen', async function() {
  const isHistoryScreen = await this.screen.isDisplayed({ text: 'History' });
  expect(isHistoryScreen).to.be.true;
});

Then('I should see {int} history items', async function(expectedCount) {
  const items = await this.driver.$$('~history-item');
  expect(items.length).to.equal(expectedCount);
});

Then('the first item should show {string}', async function(text) {
  const firstItem = await this.driver.$('(//android.view.ViewGroup[@content-desc="history-item"])[1]');
  const itemText = await firstItem.getText();
  expect(itemText).to.include(text);
});

Then('I should see a details dialog', async function() {
  const isDialogVisible = await this.screen.isDisplayed({ text: 'URL Details' });
  expect(isDialogVisible).to.be.true;
});

Then('the dialog should show the original URL', async function() {
  const originalUrlLabel = await this.screen.isDisplayed({ text: 'Original URL' });
  expect(originalUrlLabel).to.be.true;
});

Then('the dialog should show the cleaned URL', async function() {
  const cleanedUrlLabel = await this.screen.isDisplayed({ text: 'Cleaned URL' });
  expect(cleanedUrlLabel).to.be.true;
});

Then('the dialog should show the parameters list', async function() {
  const parametersLabel = await this.screen.isDisplayed({ text: 'Parameters' });
  expect(parametersLabel).to.be.true;
});