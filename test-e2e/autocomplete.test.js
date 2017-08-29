"use strict";

/* global browser */

const assert = require('chai').assert;

describe('Autocomplete', function () {
  it('can load the demo page', async () => {
    await browser.url('http:localhost:8080/demo-polyfilled.html');
    assert((await browser.getTitle()).match(/DAWA autocomplete - demo/i));
  });

  it('Vælges en adgangsadresse med kun én adresse vælges adressen automatisk', async () => {
    await browser.url('http:localhost:8080/demo-polyfilled.html');
    browser.execute(function () {
      window.focus();
    });
    const inputSelector = '#autocomplete-default';
    // click to set focus on input
    await browser.click(inputSelector);
    await browser.setValue(inputSelector, 'rentemest');
    const vejnavnRentemestervejSelector = '.autocomplete-suggestion*=Rentemestervej';
    await browser.waitForExist(vejnavnRentemestervejSelector);
    await browser.click(vejnavnRentemestervejSelector);
    await browser.waitUntil(async () => (await browser.getValue(inputSelector)) === 'Rentemestervej ');
    const adgadrSuggestionSelector = '.autocomplete-suggestion*=Rentemestervej\u00a04';
    await browser.waitForExist(adgadrSuggestionSelector);
    await browser.addValue(inputSelector, '4, 24');
    assert.strictEqual(await browser.getValue(inputSelector), 'Rentemestervej 4, 24');
    await browser.waitForExist('.dawa-selected=Rentemestervej\u00a04, 2400\u00a0København\u00a0NV');
    // select using ENTER key
    await browser.addValue(inputSelector, '\uE006');
    await browser.waitUntil(async () => (await browser.getValue(inputSelector)) === 'Rentemestervej 4, 2400 København NV');
  });

  it('Hvis der vælges en adgangsadresse med flere adresser, udfyldes tekst og caretpos korrekt', async () => {
    await browser.url('http:localhost:8080/demo-polyfilled.html');
    browser.execute(function () {
      window.focus();
    });
    const inputSelector = '#autocomplete-default';
    // click to set focus on input
    await browser.click(inputSelector);
    await browser.setValue(inputSelector, 'margrethepladsen ');
    const adgadrSelector = '.dawa-autocomplete-suggestion=Margrethepladsen\u00a04, 8000\u00a0Aarhus\u00a0C';
    await browser.waitForExist(adgadrSelector);
    await browser.click(adgadrSelector);
    await browser.waitUntil(async () => (await browser.getValue(inputSelector)) === 'Margrethepladsen 4, , 8000 Aarhus C');
    const caretPos = await browser.selectorExecute(inputSelector, function(inputElm)  {
      return inputElm[0].selectionStart;
    });
    assert.strictEqual(caretPos, 'Margrethepladsen\u00a04, '.length);
  });

  it('Kan navigere autocomplete med keyboard', async () => {
    if(browser.desiredCapabilities.browserName === 'Safari') {
      // Safari kan ikke håndtere keyboardnavigation via webdriver (pr. 10.1)
      return;
    }
    await browser.url('http:localhost:8080/demo-polyfilled.html');
    browser.execute(function () {
      window.focus();
    });
    const inputSelector = '#autocomplete-default';
    await browser.click(inputSelector);
    await browser.addValue(inputSelector, 'margrethep');
    await browser.waitForExist('.dawa-selected=Margretheparken');
    browser.addValue(inputSelector, 'ArrowDown');
    await browser.waitForExist('.dawa-selected=Margrethepladsen');
    // key down again should wrap to top
    browser.addValue(inputSelector, 'ArrowDown');
    await browser.waitForExist('.dawa-selected=Margretheparken');
    // key up should wrap to bottom
    browser.addValue(inputSelector, 'ArrowUp');
    await browser.waitForExist('.dawa-selected=Margrethepladsen');
    browser.addValue(inputSelector, 'ArrowUp');
    await browser.waitForExist('.dawa-selected=Margretheparken');
  });

});
