"use strict";

const sleep = (ms) => new Promise((resolve, reject) => {
  setTimeout(() => resolve(new Error('Timeout')), ms);
});

const assert = require('chai').assert;

describe('Autocomplete', function() {
  it('can find load the demo page', async  () => {
    await browser
      .url('http:localhost:8080/demo-polyfilled.html');
    assert((await browser.getTitle()).match(/DAWA autocomplete - demo/i));
  });
});
