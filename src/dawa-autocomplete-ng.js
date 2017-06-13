import {autocompleteUi} from './autocomplete-ui.js';
import {AutocompleteController} from './autocomplete-controller.js';

export function dawaAutocomplete(containerElm, options) {
  const controller = new AutocompleteController({});
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

