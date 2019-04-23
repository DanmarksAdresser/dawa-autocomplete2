"use strict";
import "regenerator-runtime/runtime";

import {assert} from 'chai';
import {go, Channel} from 'ts-csp';
import {AutocompleteController} from '../src/autocomplete-controller';

// const BASE_URL = 'http://localhost:3000';
const BASE_URL = 'https://dawa.aws.dk';
const sleep = (ms) => new Promise((resolve) => {
  setTimeout(() => resolve(new Error('Timeout')), ms);
});

const deepEqual = (a, b) => {
  try {
    assert.deepEqual(a, b);
    return true;
  }
  catch (e) {
    return false;
  }
};

const fakeFetchImpl = responses => {
  const pending = [];
  const fetchImpl = (baseUrl, params) => {

    for (let response of responses) {
      if (deepEqual(params, response[0])) {
        return new Promise((resolve) => {
          pending.push(() => {
            resolve(response[1])
          });
        });
      }
    }
    throw new Error('fakeFetch: No response for request ' + JSON.stringify(params));
  };

  fetchImpl.flushOne = () => {
    pending.shift()();
  };
  fetchImpl.pending = () => pending;
  return fetchImpl;
};

const createController = options => new AutocompleteController(Object.assign({}, {baseUrl: BASE_URL}, options))

describe('Autocomplete controller', () => {
  it('Basic autocomplete flow', () => go(function*() {
    const controller = createController({});
    const renderings = new Channel();
    controller.setRenderCallback((suggestions => {
      renderings.putSync(suggestions);
    }));
    controller.update('margrethep', 'margrethep'.length);
    const vejnavnSuggestions = yield renderings.take();
    assert.strictEqual(vejnavnSuggestions.length, 2);
    assert.strictEqual(vejnavnSuggestions[0].tekst, 'Margretheparken ');
    assert.strictEqual(vejnavnSuggestions[1].tekst, 'Margrethepladsen ');
  }));

  it('Højst 1 parallelt request', () => go(function*() {
    const fetchImpl = fakeFetchImpl([
      [{q: 'marg', caretpos: 'marg'.length, type: 'adresse', fuzzy: '', supplerendebynavn: true, stormodtagerpostnumre: true, multilinje: true}, []],
      [{q: 'margre', caretpos: 'margre'.length, type: 'adresse', fuzzy: '', supplerendebynavn: true, stormodtagerpostnumre: true, multilinje: true}, []]]);
    const controller = createController({fetchImpl});
    controller.update('marg', 'marg'.length);
    controller.update('margr', 'margr'.length);
    controller.update('margre', 'margre'.length);
    assert.strictEqual(fetchImpl.pending().length, 1);
    fetchImpl.flushOne();
    yield sleep(0);
    assert.strictEqual(fetchImpl.pending().length, 1);
    fetchImpl.flushOne();
    yield sleep(0);
    assert.strictEqual(fetchImpl.pending().length, 0);
  }));

  it('Ved valg af vejnavn søges i adgangsadresser', () =>  {
    const fetchImpl = fakeFetchImpl([
      [{
        q: 'Margrethepladsen ',
        caretpos: 'Margrethepladsen '.length,
        type: 'adresse',
        fuzzy: '',
        startfra: 'adgangsadresse',
        supplerendebynavn: true,
        stormodtagerpostnumre: true,
        multilinje: true
      }, []]]);
    const controller = createController({fetchImpl});
    const vejnavn = {
      "type": "vejnavn",
      "tekst": "Margrethepladsen ",
      "forslagstekst": "Margrethepladsen",
      "caretpos": 17,
      "data": {
        "href": "http://dawa.aws.dk/vejnavne/Margrethepladsen",
        "navn": "Margrethepladsen"
      }
    };
    controller.select(vejnavn);
  });

  it('Ved valg af adgangsadresse søges i adresser', () => {
    const adgangsadresse = {
      "type": "adgangsadresse",
      "tekst": "Margrethepladsen 4, , 8000 Aarhus C",
      "forslagstekst": "Margrethepladsen 4, 8000 Aarhus C",
      "caretpos": 20,
      "data": {
        "id": "0a3f5096-91d3-32b8-e044-0003ba298018",
        "href": "http://dawa.aws.dk/adgangsadresser/0a3f5096-91d3-32b8-e044-0003ba298018",
        "vejnavn": "Margrethepladsen",
        "husnr": "4",
        "supplerendebynavn": null,
        "postnr": "8000",
        "postnrnavn": "Aarhus C",
        "stormodtagerpostnr": null,
        "stormodtagerpostnrnavn": null
      }
    };
    const expectedRequest = {
      q: adgangsadresse.tekst,
      caretpos: adgangsadresse.caretpos,
      type: 'adresse',
      fuzzy: '',
      adgangsadresseid:  adgangsadresse.data.id,
      supplerendebynavn: true,
      stormodtagerpostnumre: true,
      multilinje: true
    };
    const fetchImpl = fakeFetchImpl([
      [expectedRequest, []]]);
    const controller = new AutocompleteController({fetchImpl});
    controller.select(adgangsadresse);
  });

  it('Ved søgning på Girostrøget 1 vises adressen både med og uden stormodtagerpostnummer', () => go(function*() {
    const controller = createController({
      stormodtagerpostnumre: true
    });
    const renderings = new Channel();
    controller.setRenderCallback((suggestions => {
      renderings.putSync(suggestions);
    }));
    controller.update('girostrøget 1', 'girostrøget 1'.length);
    const suggestions = yield renderings.take();
    assert(suggestions.length >= 2);
    assert.strictEqual(suggestions[0].forslagstekst, 'Girostrøget 1\nHøje Taastrup\n2630 Taastrup');
    assert.strictEqual(suggestions[1].forslagstekst, 'Girostrøget 1\nHøje Taastrup\n0800 Høje Taastrup');
  }));

  it('Ved deaktivering af supplerende bynavne returneres ikke supplerende bynavne', () => go(function*() {
    const controller = createController({
      supplerendebynavn: false
    });
    const renderings = new Channel();
    controller.setRenderCallback((suggestions => {
      renderings.putSync(suggestions);
    }));
    controller.update('gudhjemvej 1', 'gudhjemvej 1'.length);
    const suggestions = yield renderings.take();
    assert(suggestions.length >= 1);
    assert.strictEqual(suggestions[0].forslagstekst, 'Gudhjemvej 1\n3760 Gudhjem');
  }));

  it('Kan populeres initielt ved angivelse af adresseId', () => go(function*() {
    const controller = createController({
    });
    const renderings = new Channel();
    controller.setInitialRenderCallback((initialText => {
      renderings.putSync(initialText);
    }));
    controller.selectInitial('f5a68d45-935b-48d6-8d11-6363327ca1ae');
    const initialText = yield renderings.take();
    assert.strictEqual(initialText, 'Rentemestervej 4, 2400 København NV');
  }));


});
