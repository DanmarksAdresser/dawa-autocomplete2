# dawa-autocomplete2

DAWA Autocomplete2 is a JavaScript-component which makes it possible to enter a danish address in a single input field. 
The component uses [Danmarks Adressers WEB API](https://dawa.aws.dk).

DAWA Autocomplete2 has no dependencies on other JavaScript-libraries. However, the component utilises
several newer browser API's, so it is neccessary to load polyfills in older browsers such as IE11.

## Browser support
The component is tested in IE11, Edge, Chrome, Safari and Firefox. In IE11, we test using the
med [core-js](https://github.com/zloirock/core-js) and [GitHubs fetch](https://github.com/github/fetch) polyfills.

## Usage
DAWA Autocomplete2 may be installed using NPM, or it may be loaded into the browser using a <script>-tag. 

### Usage via <script> tag
First, include polyfills and the autocomplete component on the page:
```html
    <script src="https://cdnjs.cloudflare.com/ajax/libs/core-js/2.4.1/core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.3/fetch.min.js"></script>
    <script src="https://dawa.aws.dk/js/autocomplete/dawa-autocomplete2.min.js"></script>
```

Some CSS rules must be added to the page in order to render the autocomplete suggestions correctly.
All styling and positioning of the autocomplete suggestions is handled using CSS.

The autocomplete suggestions is rendered immediately after the input-field. In order to ensure that
they have the same width, the input field is wrapped in a DIV-element:
```html
<div class="autocomplete-container">
  <input id="dawa-autocomplete-input">
  <!-- Suggestions will appear here -->
</div>
```

The DIV element is used to ensure that the input field and the suggestions has the same width. Add the following
CSS rules to the page in order to ensure that the suggestions is rendered correctly:

```css
.autocomplete-container {
    position: relative;
    width: 500px;
}

.autocomplete-container input {
    width: 100%;
    box-sizing: border-box;
}

.dawa-autocomplete-suggestions {
    margin: 0;
    padding: 0;
    text-align: left;
    border: 1px solid #ccc;
    border-top: 0;
    background: #fff;
    box-shadow: -1px 1px 3px rgba(0, 0, 0, .1);

    position: absolute;
    left: 0;
    right: 0;
    z-index: 9999;
    overflow-y: auto;
    box-sizing: border-box;
}

.dawa-autocomplete-suggestions .dawa-autocomplete-suggestion {
    margin: 0;
    list-style: none;
    cursor: pointer;
    padding: 0 .6em;
    line-height: 1.5em;
    color: #333;
}

.dawa-autocomplete-suggestions .dawa-autocomplete-suggestion.dawa-selected, 
.dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:hover {
    background: #f0f0f0;
}
```

The component is initialized using JavaScript:
```javascript
dawaAutocomplete.dawaAutocomplete(document.getElementById('dawa-autocomplete-input'), {
  select: function(selected) {
    console.log('Valgt adresse: ' + selected.tekst);
  }
});
```

### Anvendelse via NPM
DAWA Autocomplete2 is published in the NPM registry:
```bash
npm install dawa-autocomplete2
```

Polyfills and CSS styling is handled in the same way as above. The component is imported
and initialized like this:
```javascript
var dawaAutocomplete2 = require('dawa-autocomplete2');
var inputElm = document.getElementById('dawa-autocomplete-input');
dawaAutocomplete2.dawaAutocomplete(inputElm, {
  select: function(selected) {
    console.log('Valgt adresse: ' + selected.tekst);
  }
});
```
 
## License
Copyright © 2017 Styrelsen for Dataforsyning og Effektivisering (SDFE)

Distributed under the [MIT license](https://opensource.org/licenses/MIT).

