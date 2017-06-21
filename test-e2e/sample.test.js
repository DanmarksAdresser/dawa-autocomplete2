"use strict";

const sleep = (ms) => new Promise((resolve, reject) => {
  setTimeout(() => resolve(new Error('Timeout')), ms);
});

const assert = require('chai').assert;

describe('Autocomplete', function () {
  it('can find load the demo page', async () => {
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
    await browser.keys('rentemest');
    const vejnavnRentemestervejSelector = 'div.autocomplete-suggestion*=Rentemestervej';
    await browser.waitForExist(vejnavnRentemestervejSelector);
    await browser.click(vejnavnRentemestervejSelector);
    await browser.waitUntil(async () => (await browser.getValue(inputSelector)) === 'Rentemestervej ');
    const adgadrSuggestionSelector = 'div.autocomplete-suggestion*=Rentemestervej 4';
    await browser.waitForExist(adgadrSuggestionSelector);
    await browser.addValue(inputSelector, '4, 24');
    assert.strictEqual(await browser.getValue(inputSelector), 'Rentemestervej 4, 24');
    await browser.waitForExist('.dawa-selected=Rentemestervej 4, 2400 København NV');
    // select using ENTER key
    await browser.keys('\uE006');
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
    await browser.keys('margrethepladsen ');
    const adgadrSelector = 'div.autocomplete-suggestion=Margrethepladsen 4, 8000 Aarhus C';
    await browser.waitForExist(adgadrSelector);
    await browser.click(adgadrSelector);
    await browser.waitUntil(async () => (await browser.getValue(inputSelector)) === 'Margrethepladsen 4, , 8000 Aarhus C');
    const caretPos = await browser.selectorExecute(inputSelector, (inputElm => inputElm[0].selectionStart));
    assert.strictEqual(caretPos, 'Margrethepladsen 4, '.length);
  });
});
