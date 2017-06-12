import {autocomplete} from './autocomplete.js';
import {AutocompleteController} from './controller.js';

export function dawaAutocomplete(containerElm, options) {
  console.log('dawa autocomplete');
  const controller = new AutocompleteController({});
  const autocompleter = autocomplete(containerElm, {
    onSelect: (suggestion) => {
      console.log('SELECT EMITTED');
      console.dir(suggestion);
      controller.select(suggestion);
    },
    onTextChange: (newText, newCaretpos) => {
      console.log('CHANGE EMITTED' + newText + ' ' + newCaretpos);
      controller.update(newText, newCaretpos);
    }
  });
  controller.setRenderCallback(suggestions => autocompleter.setSuggestions(suggestions));
  controller.setSelectCallback(selected => {
    console.log('FINAL SELECT!');
    console.dir(selected);
    autocompleter.selectAndClose(selected.forslagstekst);
  })
}

