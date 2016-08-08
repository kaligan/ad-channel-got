'use strict';

const AppDirect = require('../src/index');
const assert = require('assert');
const chai = require('chai');

require('dotenv').config();

describe('AppDirect ChannelConfiguration Tests', function rootTests() {
  this.timeout(10000);
  chai.should();

  const channel = {
    name: process.env.NAME || 'test',
    partner: process.env.PARTNER || 'APPDIERCT',
    baseUrl: process.env.BASE_URL || 'https://test.appdirect.com',
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET
  };

  const options = {
    channel
  };

  before((done) => {
    const appdirect = new AppDirect();
    appdirect
      .request('/oauth/token', {
        method: 'post',
        auth: `${channel.consumerKey}:${channel.consumerSecret}`,
        body: {
          username: process.env.USERNAME,
          password: process.env.PASSWORD,
          grant_type: 'password'
        },
        channel
      })
      .then(tokens => {
        channel.token = tokens.body.access_token;
        done();
      })
      .catch(err => done(err));
  });

  describe('constructor', () => {
    it('Should work for a null constructor', (done) => {
      const appdirect = new AppDirect();
      assert.equal(true, appdirect instanceof AppDirect);
      done();
    });
  });

  describe('method: stream()', () => {
    it('Should return a got stream for the url /api/marketplace/v1/listing', (done) => {
      const appdirect = new AppDirect();
      appdirect.stream('/api/marketplace/v1/listing?count=1', options)
        .on('response', response => {
          response.statusCode.should.be.a('number');
          response.statusCode.should.equal(200);
          done();
        });
    });

    it('Should return a got stream for the url /api/marketplace/v1/listing use a token', (done) => {
      const appdirect = new AppDirect();
      const tokenOptions = Object.assign({}, options);

      appdirect.stream('/api/marketplace/v1/listing?count=1', tokenOptions)
        .on('response', response => {
          response.statusCode.should.be.a('number');
          response.statusCode.should.equal(200);
          done();
        });
    });
  });

  describe('method: request()', () => {
    it('Should return a got request promise for the url /api/marketplace/v1/listing', (done) => {
      const appdirect = new AppDirect();
      const promise = appdirect.request('/api/marketplace/v1/listing?count=1', options);
      promise.should.be.a('promise');
      promise
        .then((response) => {
          const products = response.body;
          products.should.be.a('array');
          products.length.should.equal(1);
          products[0].should.be.a('object');
          done();
        })
        .catch(err => done(err));
    });

    it('Should return a got request promise for the url /api/marketplace/v1/listing use a token', (done) => {
      const appdirect = new AppDirect();
      const tokenOptions = Object.assign({}, options);

      const promise = appdirect.request('/api/marketplace/v1/listing?count=1', tokenOptions);
      promise.should.be.a('promise');
      promise
        .then((response) => {
          const products = response.body;
          products.should.be.a('array');
          products.length.should.equal(1);
          products[0].should.be.a('object');
          done();
        })
        .catch(err => done(err));
    });
  });

  describe('method: oauth(path, options)', () => {
    it('Should return a 200 when requesting the /channel api using oauth', (done) => {
      const appdirect = new AppDirect();
      const promise = appdirect.oauth('/api/channel/v1/applications', options);

      promise.should.be.a('promise');
      promise
        .then((response) => {
          const applications = response.body.content;
          applications.should.be.a('array');
          applications.length.should.equal(20);
          applications[0].should.be.a('object');
          done();
        })
        .catch(err => {
          done(err);
        });
    });

    it('Should return a 200 when requesting the /channel api using oauth with a query parameter', (done) => {
      const appdirect = new AppDirect();
      const promise = appdirect.oauth('/api/channel/v1/applications?size=1', options);

      promise.should.be.a('promise');
      promise
        .then((response) => {
          const applications = response.body.content;
          applications.should.be.a('array');
          applications.length.should.equal(1);
          applications[0].should.be.a('object');
          done();
        })
        .catch(err => {
          done(err);
        });
    });

    it('Should throw an exception for a missing consumerKey', (done) => {
      const invalidOptions = {
        channel: Object.assign({}, options.channel)
      };
      delete invalidOptions.channel.consumerKey;

      const appdirect = new AppDirect();
      const promise = appdirect.oauth('/api/channel/v1/applications?size=1', invalidOptions);

      promise.should.be.a('promise');
      promise
        .then(() => {
          done('Should have thrown an exception');
        })
        .catch(err => {
          err.should.equal('Missing required parameters options.channel.consumerKey or options.channel.consumerSecret');
          done();
        });
    });

    it('Should throw an exception for a missing consumerSecret', (done) => {
      const invalidOptions = {
        channel: Object.assign({}, options.channel)
      };
      delete invalidOptions.channel.consumerSecret;

      const appdirect = new AppDirect();
      const promise = appdirect.oauth('/api/channel/v1/applications?size=1', invalidOptions);

      promise.should.be.a('promise');
      promise
        .then(() => {
          done('Should have thrown an exception');
        })
        .catch(err => {
          err.should.equal('Missing required parameters options.channel.consumerKey or options.channel.consumerSecret');
          done();
        });
    });

    it('Should throw an exception for a method', (done) => {
      const invalidOptions = {
        method: undefined,
        channel: Object.assign({}, options.channel)
      };

      const appdirect = new AppDirect();
      const promise = appdirect.oauth('/api/channel/v1/applications?size=1', invalidOptions);

      promise.should.be.a('promise');
      promise
        .then(() => {
          done('Should have thrown an exception');
        })
        .catch(err => {
          err.should.be.a('string');
          done();
        });
    });
  });

  describe('method: getChannel(options)', () => {
    it('Should return the default channel', (done) => {
      const appdirect = new AppDirect();
      const defaultChannel = appdirect.getChannel();
      defaultChannel.name.should.equal('appdirect');
      defaultChannel.partner.should.equal('APPDIRECT');
      defaultChannel.baseUrl.should.equal('https://www.appdirect.com');
      done();
    });

    it('Should return the chanel passed in', (done) => {
      const appdirect = new AppDirect();
      const testChannel = appdirect.getChannel(options);
      testChannel.name.should.equal('test');
      testChannel.partner.should.equal('APPDIRECT');
      testChannel.baseUrl.should.equal('https://test.appdirect.com');
      done();
    });

    it('Should throw an error if we don\'t pass a channel and set useDefaultChannel to false', (done) => {
      const appdirect = new AppDirect({
        useDefaultChannel: false
      });
      try {
        appdirect.getChannel();
        done('Should have thrown an exception');
      } catch (err) {
        done();
      }
    });
  });
});
