const browserstack = require('browserstack-local');
/*eslint no-console: 0*/
exports.config = {
  user: process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
  key: process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',

  updateJob: false,
  specs: [
    './test-e2e/**/*.test.js'
  ],
  capabilities: [
    {
      browser: 'chrome',
      browserName: 'chrome',
      name: 'chrome_local',
      build: 'webdriver-browserstack',
      'browserstack.local': true,
      'browserstack.debug': true
    },
    // {
    //   'os': 'Windows',
    //   'os_version': '7',
    //   'browser': 'IE',
    //   browserName: 'IE',
    //   'browser_version': '11.0',
    //   'resolution': '1024x768',
    //   name: 'IE11-local',
    //   build: 'webdriver-browserstack',
    //   'browserstack.local': true,
    //   'browserstack.debug': true
    //
    // }
    // , {
    //   'os': 'Windows',
    //   'os_version': '10',
    //   'browser': 'Edge',
    //   browserName: 'Edge',
    //   'resolution': '1024x768',
    //   name: 'Edge-local',
    //   build: 'webdriver-browserstack',
    //   'browserstack.local': true,
    //   'browserstack.debug': true
    // },
    {
      'os': 'OS X',
      'os_version': 'Sierra',
      'browser': 'Safari',
      browserName: 'Safari',
      name: 'Safari-local',
      build: 'webdriver-browserstack',
      'browserstack.local': true,
      'browserstack.debug': true
    },
    {
      'os': 'Windows',
      'os_version': '10',
      'browser': 'Firefox',
      'browserstack.local': true,
      'browserstack.debug': true
    }
    ,
    //   {
    //     'browserName': 'iPhone',
    //     'platform': 'MAC',
    //     'device': 'iPhone 6'
    //   }
    // , {
    //   'browserName': 'android',
    //   'platform': 'ANDROID',
    //   'device': 'Samsung Galaxy S5',
    //   name: 'S5-local',
    //   build: 'webdriver-browserstack',
    //   'browserstack.local': true
    // }
  ],

  logLevel: 'verbose',
  coloredLogs: true,
  screenshotPath: './errorShots/',
  baseUrl: '',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd'
  },
  sync: false,

  onPrepare: function () {
    console.log("Connecting local");
    return new Promise(function (resolve, reject) {
      exports.bs_local = new browserstack.Local();
      exports.bs_local.start({'key': exports.config.key}, function (error) {
        if (error) return reject(error);
        console.log('Connected. Now testing...');

        resolve();
      });
    });
  },
  // Code to stop browserstack local after end of test
  onComplete: function () {
    exports.bs_local.stop(function () {
    });
  }
};
