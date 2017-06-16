import {autocompleteUi} from './autocomplete-ui.js';
import {AutocompleteController} from './autocomplete-controller.js';

export function dawaAutocomplete(containerElm, options) {
  options = options || {};
  const controllerOptions = ['baseUrl', 'minLength'].reduce((memo, optionName)=> {
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
  const ui = autocompleteUi(containerElm, {
    onSelect: (suggestion) => {
      controller.select(suggestion);
    },
    onTextChange: (newText, newCaretpos) => {
      controller.update(newText, newCaretpos);
    }
  });
  controller.setRenderCallback(suggestions => ui.setSuggestions(suggestions));
  controller.setSelectCallback(selected => {
    console.log('Selected address:');
    console.dir(selected);
    ui.selectAndClose(selected.forslagstekst);
  })
}

