// cucumber.js - Cucumber configuration
module.exports = {
  default: {
    require: [
      'step-definitions/**/*.js',
      'support/**/*.js'
    ],
    format: [
      'progress',
      'json:reports/cucumber-report.json',
      'html:reports/cucumber-report.html'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['features/**/*.feature'],
    tags: process.env.CUCUMBER_TAGS || '@core',
    parallel: 1,
    retry: process.env.CI ? 2 : 0
  }
};