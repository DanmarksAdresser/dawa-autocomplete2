import {autocompleteUi} from './autocomplete-ui.js';
import {AutocompleteController} from './autocomplete-controller.js';

export function dawaAutocomplete(inputElm, options) {
  options = Object.assign({select: () => null}, options);
  const controllerOptions = ['baseUrl', 'minLength', 'params', 'fuzzy', 'stormodtagerpostnumre'].reduce((memo, optionName)=> {
    if(options.hasOwnProperty(optionName)) {
      memo[optionName] = options[optionName];
    }
    return memo;
  }, {});
  if(options.adgangsadresserOnly) {
    controllerOptions.type = 'adgangsadresse';
  }
  else {
    controllerOptions.type = 'adresse';
  }
  const controller = new AutocompleteController(controllerOptions);
  const ui = autocompleteUi(inputElm, {
    onSelect: (suggestion) => {
      controller.select(suggestion);
    },
    onTextChange: (newText, newCaretpos) => {
      controller.update(newText, newCaretpos);
    }
  });
  controller.setRenderCallback(suggestions => ui.setSuggestions(suggestions));
  controller.setSelectCallback(selected => {
    ui.selectAndClose(selected.forslagstekst);
    options.select(selected);
  });
}

