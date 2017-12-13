# dawa-autocomplete2

DAWA Autocomplete2 is a JavaScript-component which makes it possible to enter a danish address in a single input field. 
The component uses [Danmarks Adressers WEB API](https://dawa.aws.dk).

DAWA Autocomplete2 has no dependencies on other JavaScript-libraries. However, the component utilises
several newer browser API's, so it is neccessary to load polyfills in older browsers such as IE11.

## Browser support
The component is tested in IE11, Edge, Chrome, Safari and Firefox. In IE11, we test using the [core-js](https://github.com/zloirock/core-js) and [GitHub fetch](https://github.com/github/fetch) polyfills.

## Usage
DAWA Autocomplete2 may be installed using NPM, or it may be loaded into the browser using a `<script>`-tag. 
For a working demo page, please see https://dawa.aws.dk/demo/autocomplete/demo.html

### Usage via &lt;script&gt; tag
First, include polyfills and the autocomplete component on the page:
```html
    <script src="https://cdnjs.cloudflare.com/ajax/libs/core-js/2.4.1/core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.3/fetch.min.js"></script>
    <script src="https://dawa.aws.dk/js/autocomplete/dawa-autocomplete2.min.js"></script>
```
Please notice that https://dawa.aws.dk regularly updates the hosted version of the file
to the most recent. We do *not* guarantee that this file is always backwards compatible, so
we strongly recommend that you serve a copy of the file from your own server.

Some CSS rules must be added to the page in order to render the autocomplete suggestions correctly.
All styling and positioning of the autocomplete suggestions is handled using CSS rules.

The autocomplete suggestions are rendered immediately after the input-field. In order to ensure that
they have the same width, the input field is wrapped in a DIV-element:
```html
<div class="autocomplete-container">
  <input id="dawa-autocomplete-input">
  <!-- Suggestions will appear here -->
</div>
```

The DIV element is used to ensure that the input field and the suggestions have the same width. Add the following
CSS rules to the page in order to ensure that the suggestions are rendered correctly:

```css
.autocomplete-container {
    /* relative position for at de absolut positionerede forslag får korrekt placering.*/
    position: relative;
    width: 100%;
    max-width: 30em;
}

.autocomplete-container input {
    /* Både input og forslag får samme bredde som omkringliggende DIV */
    width: 100%;
    box-sizing: border-box;
}

.dawa-autocomplete-suggestions {
    margin: 0.3em 0 0 0;
    padding: 0;
    text-align: left;
    border-radius: 0.3125em;
    background: #fcfcfc;
    box-shadow: 0 0.0625em 0.15625em rgba(0,0,0,.15);
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
    padding: 0.4em 0.6em;
    color: #333;
    border: 0.0625em solid #ddd;
    border-bottom-width: 0;
}

.dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:first-child {
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
}

.dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:last-child {
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
    border-bottom-width: 0.0625em;
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

### Usage via NPM
DAWA Autocomplete2 is published in the NPM registry. Note that in order to use NPM modules directly for web pages,
you need to use a tool like [Webpack](https://webpack.github.io/).
```bash
npm install dawa-autocomplete2
```

Polyfills and CSS styling are handled in the same way as above. 
The component is imported and initialized like this:
```javascript
var dawaAutocomplete2 = require('dawa-autocomplete2');
var inputElm = document.getElementById('dawa-autocomplete-input');
var component = dawaAutocomplete2.dawaAutocomplete(inputElm, {
  select: function(selected) {
    console.log('Valgt adresse: ' + selected.tekst);
  }
});
```

### Options
The following options are supported:

 - `select`: This function is called whenever the user selects an address.
 - `baseUrl`: URL to DAWA, defaults to `https://dawa.aws.dk`.
 - `adgangsadresserOnly`: The user enters an access address, not a complete address with floor/suite. Defaults to `false`.
 - `fuzzy`: Whether fuzzy searching is enabled, defaults to `true`.
 - `params`: A JavaScript object containing any additional parameters to send to DAWA, e.g. `{kommunekode: "101"}`. Any parameter supported by the API can be specified. Please see check the [API docs](https://dawa.aws.dk/autocompletedok) for further information:
 - `stormodtagerpostnumre`: Whether "stormodtagerpostnumre" will be displayed in suggestions. Defaults to `true`.
 - `minLength`: Number of characters which must be entered before any suggestions is displayed. Defaults to `2`.
 - `multiline`: Display address suggestions on multiple lines. Default `false`.
 - `id`: Initialize the input field with the address specified by the given UUID. If the address does not exist, the input field is left empty.

### API
The component has the following api:
 
 - `destroy()`: Removes the component and any event listeners from the DOM.
 - `selected()`: Returns the selected autocomplete entry, or null if no selection has been made yet.
 - `id(uuid)`: Populate the input field with the addres specified by the uuid parameter.

### Cleanup
Calling `destroy` removes the autocomplete component and any event listeners from the DOM:
```javascript
    var autocomplete =  dawaAutocomplete(inputElm, {});
    autocomplete.destroy();
```

## Get help
There is a [forum](https://digitaliser.dk/group/334445/forum) available on Digitaliser.dk. 
Feel free to ask any questions there.
 
## Contributing
Patches are welcome. To start a development server on port 8080, first clone the repository and then run:

 - `npm install`
 - `npm run dev`
 
Now you can open http://localhost:8080/demo-polyfilled.html . In order to run unit tests, execute `npm run karma`.
In order to run browser test locally, execute `npm run wdio-local`.
 
## License
Copyright © 2017 Styrelsen for Dataforsyning og Effektivisering (SDFE)

Distributed under the [MIT license](https://opensource.org/licenses/MIT).

