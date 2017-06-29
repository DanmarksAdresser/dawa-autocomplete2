exports.config = {
  updateJob: false,
  specs: [
    './test-e2e/**/*.test.js'
  ],
  capabilities: [{
    browserName: 'chrome'
  }],
  services: ['selenium-standalone'],

  logLevel: 'verbose',
  coloredLogs: true,
  screenshotPath: './errorShots/',
  baseUrl: '',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  sync: false,
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd'
  }
};
