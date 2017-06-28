import {
  elementOpen,
  elementClose,
  elementVoid,
  text,
  patch,
  attributes,
  applyProp
} from 'incremental-dom';

attributes.caretpos = (element, name, value) => {
  element.setSelectionRange(value, value);
};

attributes.value = applyProp;

const renderIncrementalDOM = (data, onSelect, multiline) => {
  if (data.suggestions.length > 0 && data.focused) {
    elementOpen('ul', '', ['class', 'dawa-autocomplete-suggestions', 'role', 'listbox']);
    for (let i = 0; i < data.suggestions.length; ++i) {
      const suggestion = data.suggestions[i];
      let className = 'dawa-autocomplete-suggestion';
      if (data.selected === i) {
        className += ' dawa-selected';
      }
      elementOpen('li', '', ['role', 'option'],
        'class', className,
        'onmousedown', (e) => {
          onSelect(i);
          e.preventDefault();
        });
      let rows = suggestion.forslagstekst.split('\n');
      rows = rows.map(row => row.replace(/ /g, '\u00a0'))
      if(multiline) {
        text(rows[0]);
        for(let i = 1; i < rows.length; ++i) {
          elementVoid('br');
          text(rows[i]);
        }
      }
      else {
        text(rows.join(', '));
      }
      elementClose('li');
    }
    elementClose('ul');
  }
};



const defaultRender = (containerElm, data, onSelect, multiline) => {
  patch(containerElm, function () {
    renderIncrementalDOM(data, onSelect, multiline);
  });
};

export const autocompleteUi = (inputElm, options) => {
  const onSelect = options.onSelect;
  const onTextChange = options.onTextChange;
  const render = options.render || defaultRender;

  let destroyed = false;
  let lastEmittedText = '';
  let lastEmittedCaretpos = 0;
  const suggestionContainerElm = document.createElement('div');
  inputElm.parentNode.insertBefore(suggestionContainerElm, inputElm.nextSibling);

  const emitTextChange = (newText, newCaretpos) => {
    if (lastEmittedText !== newText || lastEmittedCaretpos !== newCaretpos) {
      onTextChange(newText, newCaretpos);
      lastEmittedText = newText;
      lastEmittedCaretpos = newCaretpos;
    }
  };

  const data = {
    caretpos: 2,
    inputText: '',
    selected: 0,
    focused: document.activeElement === inputElm,
    suggestions: []
  };

  const handleInputChanged = (inputElm) => {
    const newText = inputElm.value;
    const newCaretPos = inputElm.selectionStart;
    data.caretpos = newCaretPos;
    data.inputText = newText;
    emitTextChange(newText, newCaretPos);
  };

  let update;

  const selectSuggestion = index => {
    const selectedSuggestion = data.suggestions[index];
    data.inputText = selectedSuggestion.tekst;
    data.caretpos = selectedSuggestion.caretpos;
    data.suggestions = [];
    onSelect(selectedSuggestion);
    update(true);
  };

  const keydownHandler = (e) => {
    const key = window.event ? e.keyCode : e.which;
    if (data.suggestions.length > 0 && data.focused) {
      // down (40)
      if (key === 40) {
        data.selected = (data.selected + 1) % data.suggestions.length;
        update();
      }
      //up (38)
      else if (key === 38) {
        data.selected = (data.selected - 1 + data.suggestions.length) % data.suggestions.length;
        update();
      }
      // enter
      else if (key === 13 || key === 9) {
        selectSuggestion(data.selected);
      }
      else {
        return true;
      }
      e.preventDefault();
      return false;
    }

  };

  const focusHandler = () => {
    data.focused = true;
    update();
  };

  const blurHandler = () => {
    data.focused = false;
    update();
    return false;
  };

  const inputChangeHandler = e => {
    handleInputChanged(e.target);
  };
  const inputMouseUpHandler = e => handleInputChanged(e.target);

  let updateScheduled = false;
  let updateInput = false;
  update = (shouldUpdateInput) => {
    if(shouldUpdateInput) {
      updateInput = true;
    }
    if (!updateScheduled) {
      updateScheduled = true;
      requestAnimationFrame(() => {
        if (destroyed) {
          return;
        }
        updateScheduled = false;
        if(updateInput) {
          inputElm.value = data.inputText;
          inputElm.setSelectionRange(data.caretpos, data.caretpos);
        }
        updateInput = false;
        render(suggestionContainerElm, data, i => selectSuggestion(i), options.multiline);
      });
    }
  };

  update();

  const destroy = () => {
    destroyed = true;
    inputElm.removeEventListener('keydown', keydownHandler);
    inputElm.removeEventListener('blur', blurHandler);
    inputElm.removeEventListener('focus', focusHandler);
    inputElm.removeEventListener('input', inputChangeHandler);
    inputElm.removeEventListener('mouseup', inputMouseUpHandler);
    patch(suggestionContainerElm, () => {
    });
    suggestionContainerElm.remove();
  };

  const setSuggestions = suggestions => {
    data.suggestions = suggestions;
    data.selected = 0;
    update();
  };

  const selectAndClose = text => {
    data.inputText = text;
    data.caretpos = text.length;
    data.suggestions = [];
    data.selected = 0;
    update(true);
  };

  inputElm.addEventListener('keydown', keydownHandler);
  inputElm.addEventListener('blur', blurHandler);
  inputElm.addEventListener('focus', focusHandler);
  inputElm.addEventListener('input', inputChangeHandler);
  inputElm.addEventListener('mouseup', inputMouseUpHandler);
  inputElm.setAttribute('aria-autocomplete', 'list');
  inputElm.setAttribute('autocomplete', 'off');

  return {
    destroy,
    setSuggestions,
    selectAndClose
  }
};
