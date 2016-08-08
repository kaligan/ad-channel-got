'use strict';

const got = require('got');
const OAuth1 = require('oauth-1.0a');

class AppDirectGot {
  constructor(options) {
    this.useDefaultChannel = true;
    if (options && typeof options.useDefaultChannel === 'boolean') {
      this.useDefaultChannel = options.useDefaultChannel;
    }

    this.defaultChannel = {
      name: 'appdirect',
      partner: 'APPDIRECT',
      baseUrl: 'https://www.appdirect.com'
    };
  }

  stream(path, options) {
    const channel = this.getChannel(options);
    const gotConfig = Object.assign({
      json: false,
      headers: {}
    }, options);

    if (channel.token) {
      gotConfig.headers.authorization = channel.token;
    }

    const uri = `${channel.baseUrl}${path}`;
    return got.stream(uri, gotConfig);
  }

  request(path, options) {
    const channel = this.getChannel(options);
    const gotConfig = Object.assign({
      json: true,
      headers: {}
    }, options);

    if (channel.token) {
      gotConfig.headers.authorization = channel.token;
    }

    const uri = `${channel.baseUrl}${path}`;
    return got(uri, gotConfig);
  }

  oauth(path, options) {
    const channel = this.getChannel(options);
    if (!channel.consumerKey || !channel.consumerSecret) {
      return Promise.reject('Missing required parameters options.channel.consumerKey or options.channel.consumerSecret');
    }

    let url = `${channel.baseUrl}${path}`;
    const gotConfig = Object.assign({
      json: true,
      url,
      method: 'get'
    }, options);

    try {
      const o = new OAuth1({
        consumer: {
          public: channel.consumerKey,
          secret: channel.consumerSecret
        },
        signature_method: 'HMAC-SHA1'
      });
      const oauthVariables = o.authorize(gotConfig);
      const oauthQueryString = Object.keys(oauthVariables).map(key => `${key}=${oauthVariables[key]}`).join('&');

      if (url.indexOf('?') > 0) {
        url = `${url}&${oauthQueryString}`;
      } else {
        url = `${url}?${oauthQueryString}`;
      }
    } catch (e) {
      return Promise.reject(e.message);
    }

    return got(url, gotConfig);
  }

  getChannel(options) {
    if ((!options || !options.channel)) {
      if (!this.useDefaultChannel) {
        throw new Error('Either a channel must be provided or useDefaultChannel must be true');
      }

      return this.defaultChannel;
    }

    return options.channel;
  }
}

module.exports = AppDirectGot;
