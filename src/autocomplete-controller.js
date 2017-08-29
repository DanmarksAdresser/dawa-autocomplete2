const formatParams = params => {
  return Object.keys(params).map(paramName => {
    const paramValue = params[paramName];
    return `${paramName}=${encodeURIComponent(paramValue)}`;
  }).join('&');
};

const delay = ms => new Promise((resolve) => setTimeout(resolve, ms));

const defaultOptions = {
  params: {},
  minLength: 2,
  retryDelay: 500,
  renderCallback: () => {
    /*eslint no-console: 0*/
    console.error('No renderCallback supplied');
  },
  initialRenderCallback: () => {
    /*eslint no-console: 0*/
    console.error('No initialRenderCallback supplied');
  },
  type: 'adresse',
  baseUrl: 'https://dawa.aws.dk',
  adgangsadresserOnly: false,
  stormodtagerpostnumre: true,
  supplerendebynavn: true,
  fuzzy: true,
  fetchImpl: (url, params) => fetch(`${url}?${formatParams(params)}`, {
    mode: 'cors'
  }).then(result => result.json())
};


export class AutocompleteController {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options || {});
    this.options = options;
    this.state = {
      currentRequest: null,
      pendingRequest: null
    };
    this.selected = null;
  }

  _getAutocompleteResponse(text, caretpos, skipVejnavn, adgangsadresseid, supplerendebynavn, stormodtagerpostnumre) {
    const params = Object.assign({}, this.options.params, {
      q: text,
      type: this.options.type,
      caretpos: caretpos,
      supplerendebynavn,
      stormodtagerpostnumre,
      multilinje: true
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

    return this.options.fetchImpl(`${this.options.baseUrl}/autocomplete`, params);
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
        this.selected = item;
        this._requestCompleted();
        return;
      }
    }
    else {
      text = request.text;
      caretpos = request.caretpos;
    }
    if (request.selectedId) {
      const params = {
        id: request.selectedId,
        type: this.options.type
      };
      return this.options.fetchImpl(`${this.options.baseUrl}/autocomplete`, params)
        .then(
          result => this._handleResponse(request, result),
          error => this._handleFailedRequest(request, error));
    }
    else if (request.selected || request.text.length >= this.options.minLength) {
      this._getAutocompleteResponse(text, caretpos, skipVejnavn, adgangsadresseid, this.options.supplerendebynavn, this.options.stormodtagerpostnumre)
        .then(
          result => this._handleResponse(request, result),
          error => this._handleFailedRequest(request, error ));
    }
    else {
      this._handleResponse(request, []);
    }
  }
  _handleFailedRequest(request, error) {
    console.error('DAWA request failed', error);
    return delay(this.options.retryDelay).then(() => {
      if(!this.state.pendingRequest) {
        this._scheduleRequest(request);
      }
      this._requestCompleted();
    });
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
    else if(request.selectedId) {
      if(result.length === 1) {
        this.selected = result[0];
        this.options.initialRenderCallback(result[0].tekst);
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

  setInitialRenderCallback(renderCallback) {
    this.options.initialRenderCallback = renderCallback;
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
  selectInitial(id) {
    const request = {
      selectedId: id
    };
    this._scheduleRequest(request);
  }

  destroy() {

  }
}
