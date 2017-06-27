# dawa-autocomplete2

DAWA Autocomplete2 er en JavaScript-komponent, som giver mulighed for at indtaste en dansk adresse
i ét input-felt. Komponenten anvender [Danmarks Adressers WEB API](https://dawa.aws.dk).

Autocomplete2 har ingen afhængigheder til andre JavaScript-libraries. Komponenten anvender dog flere
nyere browser-API'er, så det er nødvendigt at indlæse polyfills i ældre browsere som eksempelvis IE11.

## Browserunderstøttelse
Komponenten er testet i IE11, Edge, Chrome, Safari og Firefox. I IE11 anvendes polyfills, vi tester
med [core-js](https://github.com/zloirock/core-js) samt [GitHubs fetch](https://github.com/github/fetch) polyfill.

## Anvendelse
DAWA Autocomplete2 kan installeres fra NPM, eller man kan importere scriptet ved hjælp af <script> tags
i browseren. 

### Anvendelse via script tag
Først inkluderes polyfills samt autocomplete-scriptet. Vi henter core-js og fetch fra et CDN, og 
autocomplete-componenten fra https://dawa.aws.dk .
```html
    <script src="https://cdnjs.cloudflare.com/ajax/libs/core-js/2.4.1/core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.3/fetch.min.js"></script>
    <script src="https://dawa.aws.dk/js/autocomplete/dawa-autocomplete2.min.js"></script>
```

For at rendere korrekt er der brug for noget styling. Autocomplete-forslagene renderes og positioneres
udelukkende ved hjælp af CSS. Forslagene indsættes i DOM'en umiddelbart efter input-elementet.
For at sikre korrekt positionering af input-elementet kan input-feltet placeres i en DIV:

```html
<div class="autocomplete-container">
  <input id="dawa-autocomplete-input">
</div>
```

Herved kan vi give input-feltet og autocomplete-forslagene samme bredde. Vi anbefaler følgende CSS regler som udgangspunkt.
Herefter kan stylingen tilpasses, såden passer ind i sidens design.

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

Herefter kan autocomplete-komponenten initialiseres:
```javascript
dawaAutocomplete.dawaAutocomplete(document.getElementById('dawa-autocomplete-input'), {
  select: function(selected) {
    console.log('Valgt adresse: ' + selected.tekst);
  }
});
```

### Anvendelse via NPM
DAWA Autocomplete2 er publiceret i NPM. Anvender du NPM, kan du installere DAWA Autocomplete2 herfra:
```bash
npm install dawa-autocomplete2
```
Polyfills samt CSS-styling håndteres på samme måde som ovenfor.  Herefter er DAWA Autocomplete2 
klar til brug i din kode:

```javascript
var dawaAutocomplete2 = require('dawa-autocomplete2');
var inputElm = document.getElementById('dawa-autocomplete-input');
dawaAutocomplete2.dawaAutocomplete(inputElm, {
  select: function(selected) {
    console.log('Valgt adresse: ' + selected.tekst);
  }
});
```
 
## Licens
Copyright © 2017 Styrelsen for Dataforsyning og Effektivisering (SDFE)

Distribueret under [MIT licensen](https://opensource.org/licenses/MIT).

