"use strict";
import "regenerator-runtime/runtime";

import {assert} from 'chai';
import {dawaAutocomplete} from '../src/dawa-autocomplete2';


describe('Autocomplete2', () => {
  it('Can clean up the component', () => {
    const div = document.createElement('div');
    const input = document.createElement('input');
    div.appendChild(input);
    const autocomplete =  dawaAutocomplete(input, {});
    autocomplete.destroy();
  });
});
