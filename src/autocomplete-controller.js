const defaultOptions = {
  minChars: 2,
  debounce: 200,
  renderCallback: suggestions =>  {
    console.error('No renderCallback supplied');
  },
  type: 'adresse',
  baseUrl: 'https://dawa.aws.dk'
};

// Beregner adressetekst hvor stormodtagerpostnummer anvendes.
const  stormodtagerAdresseTekst = data => {
  let adresse = data.vejnavn;
  if(data.husnr) {
    adresse += ' ' + data.husnr;
  }
  if(data.etage || data['dør']) {
    adresse += ',';
  }
  if(data.etage) {
    adresse += ' ' + data.etage + '.';
  }
  if(data['dør']) {
    adresse += ' ' + data['dør'];
  }
  adresse += ', ';
  if(data.supplerendebynavn) {
    adresse += data.supplerendebynavn + ', ';
  }
  adresse += data.stormodtagerpostnr + ' ' + data.stormodtagerpostnrnavn;
  return adresse;
};

const processResults = (q, result) => {
  return result.reduce(function(memo, row) {
    if((row.type === 'adgangsadresse' || row.type === 'adresse') && row.data.stormodtagerpostnr) {
      // Vi har modtaget et stormodtagerpostnr. Her vil vi muligvis gerne vise stormodtagerpostnummeret
      const stormodtagerEntry = Object.assign({}, row);
      stormodtagerEntry.tekst = stormodtagerAdresseTekst(row.data);
      stormodtagerEntry.forslagstekst = stormodtagerEntry.tekst;

      let rows = [];
      // Omvendt, hvis brugeren har indtastet den almindelige adresse eksakt, så er der ingen
      // grund til at vise stormodtagerudgaven
      if(q !== stormodtagerEntry.tekst) {
        rows.push(row);
      }

      // Hvis brugeren har indtastet stormodtagerudgaven af adressen eksakt, så viser vi
      // ikke den almindelige udgave
      if(q !== row.tekst) {
        rows.push(stormodtagerEntry);
      }

      // brugeren har indtastet stormodtagerpostnummeret, såvi viser stormodtager udgaven først.
      if(rows.length > 1 && q.indexOf(row.data.stormodtagerpostnr) !== -1) {
        rows = [rows[1], rows[0]];
      }
      memo = memo.concat(rows);
    }
    else {
      memo.push(row);
    }
    return memo;
  }, []);
};

const formatParams = params => {
  return Object.keys(params).map(paramName => {
    const paramValue = params[paramName];
    return `${paramName}=${encodeURIComponent(paramValue)}`;
  }).join('&');
}

const doFetch = (baseUrl, params) => {
  return fetch(`${baseUrl}/autocomplete?${formatParams(params)}`, {
    mode: 'cors'
  }).then(result => result.json());
};

const  getAutocompleteResponse = (baseUrl, type, q, caretpos, fuzzy, skipVejnavn, adgangsadresseid) => {
  const params = {q: q, type: type, caretpos: caretpos};
  if(fuzzy) {
    params.fuzzy = '';
  }
  if(adgangsadresseid) {
    params.adgangsadresseid = adgangsadresseid;
  }
  if(skipVejnavn) {
    params.startfra = 'adgangsadresse';
  }
  const adgangsadresseRestricted = !!adgangsadresseid;

  // Vi begrænser kun til en bestemt adgangsadresseid én gang
  adgangsadresseid = null;

  return doFetch(baseUrl, params).then(result =>  {
    const processedResult = processResults(q, result);
    if(adgangsadresseRestricted && processedResult.length === 1) {
      return processedResult;
      // der er kun en adresse på adgangsadressen
      // element.val(processedResult[0].value.tekst);
      // element.selectionStart = caretpos = processedResult[0].value.caretpos;
      // element.autocomplete('close');
      // autocompleteWidget._trigger('select', null, processedResult[0].value);
    }
    else {
      return processedResult;
    }
  });
};

export class AutocompleteController {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options || {});
    this.minChars = options.minChars;
    this.debounce = options.debounce;
    this.renderCallback = options.renderCallback;
    this.selectCallback = options.selectCallback;
    this.baseUrl = options.baseUrl;
    this.type = options.type;
  }

  setRenderCallback(renderCallback) {
    this.renderCallback = renderCallback;
  }

  setSelectCallback(selectCallback) {
    this.selectCallback = selectCallback;
  }

  update(text, caretpos) {
    if(text.length >= this.minChars) {
      getAutocompleteResponse(this.baseUrl, this.type, text, caretpos, true, false, null).then(result => {
        if(this.renderCallback) {
          this.renderCallback(result);
        }
      });
    }
    else {
      this.renderCallback([]);
    }
  }

  select(item) {
    if(item.type !== this.type) {
      const text = item.tekst;
      const caretpos = item.caretpos;
      const adgangsadresseid = item.type === 'adgangsadresse' ? item.data.id : null;
      const skipVejnavn = item.type === 'vejnavn';
      getAutocompleteResponse(this.baseUrl, this.type, text, caretpos, true, skipVejnavn, adgangsadresseid).then(result => {
        if(result.length === 1) {
          const item = result[0];
          if(item.type === this.type) {
            this.selectCallback(item);
          }
          else {
            this.select(item);
          }
        }
        else if(this.renderCallback) {
          this.renderCallback(result);
        }
      });
    }
    else {
      this.selectCallback(item);
    }

  }

  destroy() {

  }


}
