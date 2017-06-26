"use strict";
import "regenerator-runtime/runtime";

import {go, Channel} from 'ts-csp';
import {assert } from 'chai';
import { AutocompleteController } from '../src/autocomplete-controller';

const sleep = (ms) => new Promise((resolve, reject) => {
  setTimeout(() => resolve(new Error('Timeout')), ms);
});

const deepEqual = (a, b) => {
  try {
    assert.deepEqual(a, b);
    return true;
  }
  catch(e) {
    return false;
  }
}

const fakeFetchImpl = responses => {
  const pending = [];
  const fetchImpl = (baseUrl, params) => {

    for(let response of responses) {
      if(deepEqual(params, response[0])) {
        return new Promise((resolve) => {
          pending.push(() => {
            resolve(response[1])
          });
        });
      }
    }
    console.dir(params);
    throw new Error('fakeFetch: No response for request ' + JSON.stringify(params));
  };

  fetchImpl.flushOne = () => {
    pending.shift()();
  };
  fetchImpl.pending = () => pending;
  return fetchImpl;
};

describe('Autocomplete controller', () => {
  it('Basic autocomplete flow', () =>  go(function*() {
    const controller = new AutocompleteController({});
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

  it('Executes at most one parallel request', () => go(function*() {
    const fetchImpl = fakeFetchImpl([
      [{q: 'marg', caretpos: 'marg'.length, type: 'adresse', fuzzy: ''}, []],
      [{q: 'margre', caretpos: 'margre'.length, type: 'adresse', fuzzy: ''}, []]]);
    const controller = new AutocompleteController({fetchImpl});
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
});
