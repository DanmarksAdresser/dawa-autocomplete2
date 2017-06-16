"use strict";

const assert = require('chai').assert;

describe('Autocomplete', function() {
  it('can find load the demo page', function () {
    browser
      .url('http:localhost:8080/demo-polyfilled.html')
      .pause(5000);

    assert(browser.getTitle().match(/DAWA autocomplete - demo/i));
  });
});
