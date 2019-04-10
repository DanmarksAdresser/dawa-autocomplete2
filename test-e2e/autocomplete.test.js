const {assert} = require('chai');
const Keys = {
  RETURN: '\uE006',
  UP_ARROW: '\uE013',
  DOWN_ARROW: '\uE015'
};

const { withWebdriverClient} = require('./setup/setup');


describe('Autocomplete', () => {
  withWebdriverClient(wdFn => {
    it('can load the demo page', async () => {
      assert((await wdFn().getTitle()).match(/DAWA autocomplete - demo/i));
    });

    it('Vælges en adgangsadresse med kun én adresse vælges adressen automatisk', async () => {
      const wd = wdFn();
      const inputElm = await wd.findElementByCss('#autocomplete-default');
      await wd.elementClick(inputElm);
      await wd.elementSendKeyText(inputElm, 'rentemest');
      // Wait for suggestion for rentemestervej to appear
      const vejnavnRentemestervejElm =
        await wd.waitForElementByRegex('li.dawa-autocomplete-suggestion',
          /Rentemestervej/);
      // Select suggestion "Rentemestervej"
      await wd.elementClick(vejnavnRentemestervejElm);
      await wd.waitUntil(async () => await wd.getElementValue(inputElm) === 'Rentemestervej ');
      // wait until suggestion "Rentemestervej 4" appears
      await wd.waitForElementByRegex('li.dawa-autocomplete-suggestion',
        /Rentemestervej.4.*/, { first: true});
      await wd.elementSendKeyText(inputElm, '4, 24');
      assert.strictEqual(await wd.getElementValue(inputElm), 'Rentemestervej 4, 24');
      await wd.waitForElementByRegex('li.dawa-selected',
        /Rentemestervej.4,.*2400.København.NV/);
      await wd.elementSendKeys(inputElm, [Keys.RETURN]);
      await wd.waitUntil(async () => await wd.getElementValue(inputElm) === 'Rentemestervej 4, 2400 København NV');
    });

    it('Hvis der vælges en adgangsadresse med flere adresser, udfyldes tekst og caretpos korrekt', async () => {
      const wd = wdFn();
      const inputElm = await wd.findElementByCss('#autocomplete-default');
      // click to set focus on input
      await wd.elementClick(inputElm);
      await wd.elementSendKeyText(inputElm, 'margrethepladsen');
      const adgadrSuggestionElm = await wd.waitForElementByRegex(
        'li.dawa-autocomplete-suggestion',
        /Margrethepladsen.4,.8000.Aarhus.C/);
      await wd.elementClick(adgadrSuggestionElm);
      await wd.waitUntil(async () => await wd.getElementValue(inputElm) === 'Margrethepladsen 4, , 8000 Aarhus C');
      const caretPos = await wd.getElementProperty(inputElm, 'selectionStart');
      assert.strictEqual(caretPos, 'Margrethepladsen\u00a04, '.length);
    });

    it('Kan navigere autocomplete med keyboard', async () => {
      const wd = wdFn();
      const inputElm = await wd.findElementByCss('#autocomplete-default');
      await wd.elementClick(inputElm);
      await wd.elementSendKeyText(inputElm, 'margrethep');
      await wd.waitForElementByRegex('li.dawa-selected', /Margretheparken/);
      await wd.elementSendKeys(inputElm, [Keys.DOWN_ARROW]);
      await wd.waitForElementByRegex('li.dawa-selected', /Margrethepladsen/);
      // key down again should wrap to top
      await wd.elementSendKeys(inputElm, [Keys.DOWN_ARROW]);
      await wd.waitForElementByRegex('li.dawa-selected', /Margretheparken/);
      // key up should wrap to bottom
      await wd.elementSendKeys(inputElm, [Keys.UP_ARROW]);
      await wd.waitForElementByRegex('li.dawa-selected', /Margrethepladsen/);
      // key up should wrap to bottom
      await wd.elementSendKeys(inputElm, [Keys.UP_ARROW]);
      await wd.waitForElementByRegex('li.dawa-selected', /Margretheparken/);
    });

  });
});