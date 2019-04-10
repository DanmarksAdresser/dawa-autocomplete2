module.exports = [
  {
    'os' : 'OS X',
    'os_version' : 'Mojave',
    'browserName' : 'Safari',
    'browser_version' : '12.0',
    'browserstack.local' : true,
    'browserstack.selenium_version' : '3.14.0'
  },
  {
    'bstack:options' : {
      'os' : 'Windows',
      'osVersion' : '10',
      'seleniumVersion' : '3.5.2',
    },
    'browserstack.local': true,
    'browserName' : 'Chrome',
    'browserVersion' : '73.0'
  },
  {
    'os' : 'Windows',
    'os_version' : '10',
    'browserName' : 'IE',
    'browser_version' : '11.0',
    'browserstack.local' : true,
    'browserstack.selenium_version' : '3.5.2'
  },
  {
    'bstack:options' : {
      'os' : 'Windows',
      'osVersion' : '10',
      'seleniumVersion' : '3.10.0'
    },
    'browserstack.local': true,
    'browserName' : 'Firefox',
    'browserVersion' : '66.0',
  }
];