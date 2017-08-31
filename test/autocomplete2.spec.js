"use strict";
import "regenerator-runtime/runtime";

import {go} from 'ts-csp';
import {assert } from 'chai';

import {dawaAutocomplete} from '../src/dawa-autocomplete2';

// const BASE_URL = 'http://localhost:3000';
const BASE_URL = 'https://dawa.aws.dk';

const waitFor = (condition, timeout) => {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const cont = () => setTimeout(() => {
      if (condition()) {
        resolve();
      }
      else if (started + timeout < Date.now()) {
        reject(new Error("Timeout waiting for condition"));
      }
      else {
        cont();
      }
    }, 5);
    cont();
  });
};

describe('Autocomplete2', () => {
  it('Can clean up the component', () => {
    const div = document.createElement('div');
    const input = document.createElement('input');
    div.appendChild(input);
    const autocomplete = dawaAutocomplete(input, {});
    autocomplete.destroy();
    assert.strictEqual(div.innerHTML, '<input aria-autocomplete="list" autocomplete="off">');
  });
});

describe('Autocomplete2', () => {
  it('Can set initial address id and retrieve it', () => go(function*() {
    const div = document.createElement('div');
    const input = document.createElement('input');
    div.appendChild(input);
    const autocomplete = dawaAutocomplete(input, {
      baseUrl: BASE_URL,
      id: 'f5a68d45-935b-48d6-8d11-6363327ca1ae'
    });
    yield waitFor(() => {
      return autocomplete.selected() && autocomplete.selected().data.id === 'f5a68d45-935b-48d6-8d11-6363327ca1ae'
    }, 5000);
    autocomplete.destroy();
  }));
});
