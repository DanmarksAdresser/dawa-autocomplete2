const { assert } = require('chai');
const browserstack = require('browserstack-local');

let bs_local = new browserstack.Local();
const browserstackKey = process.env.BROWSERSTACK_ACCESS_KEY;

/* eslint no-console: 0 */
module.exports = () => {
  before(async () => {
    assert(browserstackKey, 'BROWSERSTACK_ACCESS_KEY not set');
    console.log("Connecting local");
    await new Promise((resolve, reject) => {
      bs_local.start({'key': browserstackKey, 'force': true}, function (error) {
        if (error) return reject(error);
        console.log('Connected. Now testing...');
        resolve();
      });

    })
  });

  after(async () => {
    await new Promise(resolve => {
      bs_local.stop(() => {
        console.log('Browserstack Local successfully stopped');
        resolve();
      });
      bs_local = null;
    });

  });
};
