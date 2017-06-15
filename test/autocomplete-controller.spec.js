"use strict";
import "regenerator-runtime/runtime";

import {go, Channel} from 'ts-csp';
import {assert } from 'chai';
import { AutocompleteController } from '../src/autocomplete-controller';

describe('Autocomplete controller', () => {
  it('Basic autocomplete flow', () =>  go(function*() {
    console.dir(AutocompleteController);
    const controller = new AutocompleteController({});
    const renderings = new Channel();
    controller.setRenderCallback((suggestions => {
      renderings.putSync(suggestions);
    }));
    controller.update('margrethepl', 'margrethepl'.length);
    const vejnavnSuggestions = yield renderings.take();
    assert(true);
  }));
});
