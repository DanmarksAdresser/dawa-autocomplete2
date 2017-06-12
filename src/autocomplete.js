const IncrementalDOM = window.IncrementalDOM;
const {elementOpen, elementClose, elementVoid, text, patch, attributes, applyProp} = IncrementalDOM;

attributes.caretpos = (element, name, value) => {
  element.setSelectionRange(value, value);
};

attributes.value = applyProp;

export const autocomplete = (containerElm, options) => {
  const onSelect = options.onSelect;
  const onTextChange = options.onTextChange;

  let destroyed = false;
  let lastEmittedText = '';
  let lastEmittedCaretpos = 0;

  const emitTextChange = (newText, newCaretpos) => {
    if(lastEmittedText !== newText || lastEmittedCaretpos !== newCaretpos){
      onTextChange(newText, newCaretpos);
      lastEmittedText = newText;
      lastEmittedCaretpos = newCaretpos;
    }
  };

  const data = {
    caretpos: 2,
    inputText: '',
    selected: 0,
    focused: document.activeElement === containerElm,
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
    update();
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

  const inputKeyUpHandler = e => {
    const key = window.event ? e.keyCode : e.which;
    if (key !== 40 && key !== 38 && key !== 13 && key !== 9) {
      handleInputChanged(e.target);
    }
  };
  const inputMouseUpHandler = e => handleInputChanged(e.target);

  const render = (data) => {
    elementVoid('input', '',
      [
        'type', 'text',
        'onkeydown', keydownHandler,
        'onblur', blurHandler,
        'onfocus', focusHandler,
        'onkeyup', inputKeyUpHandler,
        'onmouseup', inputMouseUpHandler
      ],
      'value', data.inputText,
      'caretpos', data.caretpos);
    if (data.suggestions.length > 0 && data.focused) {
      elementOpen('div', '', ['class', 'autocomplete-suggestions']);
      for (let i = 0; i < data.suggestions.length; ++i) {
        const suggestion = data.suggestions[i];
        let className = 'autocomplete-suggestion';
        if (data.selected === i) {
          className += ' selected';
        }
        elementOpen('div', '', [],
          'class', className,
          'onmousedown', () => selectSuggestion(i));
        text(suggestion.forslagstekst);
        elementClose('div');
      }
    }
    elementClose('div');
  };

  let updateScheduled = false;

  update = () => {
    if (!updateScheduled) {
      updateScheduled = true;
      requestAnimationFrame(() => {
        if(destroyed) {
          return;
        }
        updateScheduled = false;
        patch(containerElm, function () {
          render(data);
        });
      });
    }
  };

  update();

  const destroy = () => {
    destroyed = true;
    patch(containerElm, () => {
    });
  };

  const setSuggestions = suggestions => {
    console.dir(suggestions);
    data.suggestions = suggestions;
    data.selected = 0;
    update();
  };

  const selectAndClose = text => {
    console.log('SELECT AND CLOSE: ' + text);
    data.inputText = text;
    data.caretpos = text.length;
    data.suggestions = [];
    data.selected = 0;
    update();
  };
  return {
    destroy,
    setSuggestions,
    selectAndClose
  }
};
