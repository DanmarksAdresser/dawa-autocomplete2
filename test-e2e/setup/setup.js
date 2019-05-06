const WebDriver = require('webdriver').default;
const setupBrowserstackLocal = require('./setup-browserstack');
const browserstackCapabilities = require('./browserstack-capabilities');

const attributeToProperty = {
  selectionStart: parseInt
};

const capabilitiesList = browserstackCapabilities;


const sleep = async (ms) => {
  await new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

const getElementId = elementRef => elementRef.ELEMENT ||
  elementRef['element-6066-11e4-a52e-4f735466cecf'];

class WebdriverWrapper {
  constructor(client) {
    this.client = client;
    this.timeout = 10000;
  }

  async status() {
    return this.client.status();
  }

  async waitUntil(asyncCondition, timeout) {
    timeout = timeout || this.timeout;
    const before = Date.now();
    while (before + timeout > Date.now()) {
      if (await asyncCondition()) {
        return;
      }
    }
    throw new Error(`Timeout waiting for condition. timeout=${timeout}`);
  }

  async getTitle() {
    return await this.client.getTitle();
  }

  async getElementAttribute(elementRef, name) {
    return await this.client.getElementAttribute(getElementId(elementRef), name);
  }

  async getElementProperty(elementRef, name) {
    if(this.client.isW3C) {
      return await this.client.getElementProperty(getElementId(elementRef), name);
    }
    else {
      const attr = await this.getElementAttribute(elementRef, name);
      if(attributeToProperty[name]) {
        return attributeToProperty[name](attr);
      }
      else {
        return attr;
      }
    }
  }

  async getElementValue(elementRef) {
    return await this.getElementProperty(elementRef, 'value');
  }

  async getActiveElement() {
    return await this.client.executeScript('return document.activeElement', []);
  }

  async FindElementsByCss(selector) {
    return await this.client.findElements('css selector', selector);
  }

  async getElementText(elementRef) {
    return await this.client.getElementText(getElementId(elementRef));
  }

  async findElementByCss(selector) {
    return await this.client.findElement('css selector', selector);
  }

  async waitForElementByCss(selector, timeout) {
    await sleep(500);
    timeout = timeout || this.timeout;
    const before = Date.now();
    while (before + timeout > Date.now()) {
      const elements = await this.FindElementsByCss(selector);
      if (elements.length === 0) {
        continue;
      }
      if (elements.length === 1) {
        return elements[0];
      }
      throw new Error(`Expected single element but got ${elements.length}`);
    }
    throw new Error(`Waited ${timeout}ms for element matching selector "${selector}", but none appeared.`);
  }

  async findElementsByRegex(cssSelector, regex) {
    const elements = await this.FindElementsByCss(cssSelector);
    const matching = [];
    for (let elementRef of elements) {
      try {
        const text = await this.getElementText(elementRef);
        if (regex.test(text)) {
          matching.push(elementRef);
        }
      } catch (e) {
        if (e.name !== 'stale element reference') {
          throw e;
        }
      }
    }
    return matching;
  }

  async findElementByRegex(cssSeletor, regex) {
    const matching = await this.findElementsByRegex(cssSeletor, regex);
    if (matching.length === 1) {
      return matching[0];
    } else {
      throw new Error(`Expected single element but got ${matching.length}`);
    }
  }

  async waitForElementByRegex(cssSelector, regex, options) {
    await sleep(500);
    options = options || {};
    const timeout = options.timeout || this.timeout;
    const first = options.first || false;
    const before = Date.now();
    while (before + timeout > Date.now()) {
      const elements = await this.findElementsByRegex(cssSelector, regex);
      if (elements.length === 0) {
        continue;
      }
      if (elements.length === 1 || first) {
        return elements[0];
      }
      throw new Error(`Expected single element but got ${elements.length}`);
    }
    throw new Error(`Waited ${timeout}ms for element matching selector "${cssSelector}" and regex "${regex}", but none appeared.`);
  }

  async elementClick(elementRef) {
    await this.client.elementClick(getElementId(elementRef));
  }

  async elementSendKeyText(elementRef, value) {
    if(this.client.isW3C) {
      await this.client.elementSendKeys(getElementId(elementRef), value);
    }
    else {
      await this.client.elementSendKeys(getElementId(elementRef), value.split(''));
    }
  }
  async elementSendKeys(elementRef, keys) {
    if(this.client.isW3C) {
      await this.client.elementSendKeys(getElementId(elementRef), keys.join(''));
    }
    else {
      await this.client.elementSendKeys(getElementId(elementRef), keys);
    }

  }
}

const withWebdriverClient = (testDefFn) => {
  setupBrowserstackLocal();
  for(let capabilities of capabilitiesList) {
    let wd = null;
    describe(capabilities.browserName, () => {
      before(async () => {
        const client = await WebDriver.newSession({
          path: '/wd/hub',
          hostname: 'hub-cloud.browserstack.com',
          port: 80,
          capabilities: capabilities,
          user: process.env.BROWSERSTACK_USERNAME,
          key: process.env.BROWSERSTACK_ACCESS_KEY
        });
        wd = new WebdriverWrapper(client);
      });
      beforeEach(async () => {
        await wd.client.navigateTo('http://localhost:8080/html/demo.html');
        await sleep(500);
      });
      after(async () => {
        await wd.client.deleteSession();
        wd = null;
      });
      testDefFn(() => wd);
    });
  }
};

module.exports = {
  withWebdriverClient
};