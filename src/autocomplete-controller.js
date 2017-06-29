const formatParams = params => {
  return Object.keys(params).map(paramName => {
    const paramValue = params[paramName];
    return `${paramName}=${encodeURIComponent(paramValue)}`;
  }).join('&');
};

const defaultOptions = {
  params: {},
  minLength: 2,
  debounce: 200,
  renderCallback: () => {
    /*eslint no-console: 0*/
    console.error('No renderCallback supplied');
  },
  type: 'adresse',
  baseUrl: 'https://dawa.aws.dk',
  adgangsadresserOnly: false,
  stormodtagerpostnumre: true,
  fuzzy: true,
  fetchImpl: (baseUrl, params) => fetch(`${baseUrl}/autocomplete?${formatParams(params)}`, {
    mode: 'cors'
  }).then(result => result.json())
};

// Beregner adressetekst hvor stormodtagerpostnummer anvendes.
const formatAdresseMultiline = data => {
  let adresse = data.vejnavn;
  if (data.husnr) {
    adresse += ' ' + data.husnr;
  }
  if (data.etage || data['dør']) {
    adresse += ',';
  }
  if (data.etage) {
    adresse += ' ' + data.etage + '.';
  }
  if (data['dør']) {
    adresse += ' ' + data['dør'];
  }
  if (data.supplerendebynavn) {
    adresse += '\n' + data.supplerendebynavn;
  }
  adresse += '\n' + data.postnr + ' ' + data.postnrnavn;
  return adresse;
};

const formatAdresse = (data, stormodtager) => {
  if(stormodtager) {
    data = Object.assign({}, data, {postnr: data.stormodtagerpostnr, postnrnavn: data.stormodtagerpostnrnavn});
  }
  let text = formatAdresseMultiline(data);
  return text;
};

const processResultsStormodtagere = (q, result) => {
  return result.reduce(function (memo, row) {
    if ((row.type === 'adgangsadresse' || row.type === 'adresse') && row.data.stormodtagerpostnr) {
      // Vi har modtaget et stormodtagerpostnr. Her vil vi muligvis gerne vise stormodtagerpostnummeret
      const stormodtagerEntry = Object.assign({}, row);
      stormodtagerEntry.tekst = formatAdresse(row.data, true);
      stormodtagerEntry.caretpos = stormodtagerEntry.tekst.length;
      stormodtagerEntry.forslagstekst = formatAdresse(row.data, true);

      let rows = [];
      // Omvendt, hvis brugeren har indtastet den almindelige adresse eksakt, så er der ingen
      // grund til at vise stormodtagerudgaven
      if (q !== stormodtagerEntry.tekst) {
        rows.push(row);
      }

      // Hvis brugeren har indtastet stormodtagerudgaven af adressen eksakt, så viser vi
      // ikke den almindelige udgave
      if (q !== row.tekst) {
        rows.push(stormodtagerEntry);
      }

      // brugeren har indtastet stormodtagerpostnummeret, såvi viser stormodtager udgaven først.
      if (rows.length > 1 && q.indexOf(row.data.stormodtagerpostnr) !== -1) {
        rows = [rows[1], rows[0]];
      }
      memo = memo.concat(rows);
    }
    else {
      memo.push(row);
    }
    return memo;
  }, []);
}

const processResults = (q, result, stormodtagereEnabled) => {
  result = result.map(row => {
    if(row.type === 'adgangsadresse' || row.type === 'adresse') {
      row.forslagstekst = formatAdresse(row.data, false);
    }
    return row;
  });
  if (stormodtagereEnabled) {
    return processResultsStormodtagere(q, result);
  }
  return result;
};

export class AutocompleteController {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options || {});
    this.options = options;
    this.state = {
      currentRequest: null,
      pendingRequest: null
    }
  }

  _getAutocompleteResponse(text, caretpos, skipVejnavn, adgangsadresseid) {
    const params = Object.assign({}, this.options.params, {
      q: text,
      type: this.options.type,
      caretpos: caretpos
    });
    if (this.options.fuzzy) {
      params.fuzzy = '';
    }
    if (adgangsadresseid) {
      params.adgangsadresseid = adgangsadresseid;
    }
    if (skipVejnavn) {
      params.startfra = 'adgangsadresse';
    }

    return this.options.fetchImpl(this.options.baseUrl, params)
      .then(result => processResults(text, result, this.options.stormodtagerpostnumre));
  }

  _scheduleRequest(request) {
    if (this.state.currentRequest !== null) {
      this.state.pendingRequest = request;
    }
    else {
      this.state.currentRequest = request;
      this._executeRequest();
    }
  }

  _executeRequest() {
    const request = this.state.currentRequest;
    let adgangsadresseid = null;
    let skipVejnavn = false;
    let text, caretpos;
    if (request.selected) {
      const item = request.selected;
      if (item.type !== this.options.type) {
        adgangsadresseid = item.type === 'adgangsadresse' ? item.data.id : null;
        skipVejnavn = item.type === 'vejnavn';
        text = item.tekst;
        caretpos = item.caretpos;
      }
      else {
        this.options.selectCallback(item);
        this._requestCompleted();
        return;
      }
    }
    else {
      text = request.text;
      caretpos = request.caretpos;
    }
    if (request.selected || request.text.length >= this.options.minLength) {
      this._getAutocompleteResponse(text, caretpos, skipVejnavn, adgangsadresseid).then(result => this._handleResponse(request, result));
    }
    else {
      this._handleResponse(request, []);
    }
  }

  _handleResponse(request, result) {
    if (request.selected) {
      if (result.length === 1) {
        const item = result[0];
        if (item.type === this.options.type) {
          this.options.selectCallback(item);
        }
        else {
          if (!this.state.pendingRequest) {
            this.state.pendingRequest = {
              selected: item
            };
          }
        }
      }
      else if (this.options.renderCallback) {
        this.options.renderCallback(result);
      }
    }
    else {
      if (this.options.renderCallback) {
        this.options.renderCallback(result);
      }
    }
    this._requestCompleted();
  }

  _requestCompleted() {
    this.state.currentRequest = this.state.pendingRequest;
    this.state.pendingRequest = null;
    if (this.state.currentRequest) {
      this._executeRequest();
    }
  }


  setRenderCallback(renderCallback) {
    this.options.renderCallback = renderCallback;
  }

  setSelectCallback(selectCallback) {
    this.options.selectCallback = selectCallback;
  }

  update(text, caretpos) {
    const request = {
      text,
      caretpos
    };
    this._scheduleRequest(request);
  }

  select(item) {
    const request = {
      selected: item
    };
    this._scheduleRequest(request);
  }

  destroy() {

  }


}
