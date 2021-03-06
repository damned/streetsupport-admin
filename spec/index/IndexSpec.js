/*
global describe, beforeEach, afterEach, it, expect
*/

'use strict'

var sinon = require('sinon')
var ajax = require('../../src/js/ajax')
var endpoints = require('../../src/js/api-endpoints')
var adminurls = require('../../src/js/admin-urls')
var browser = require('../../src/js/browser')
var cookies = require('../../src/js/cookies')
var querystring = require('../../src/js/get-url-parameter')

describe('Index', () => {
  var Model = require('../../src/js/models/Index')
  let model = null // eslint-disable-line
  var stubbedBrowser
  var stubbedApi

  afterEach(() => {
    cookies.get.restore()
    browser.redirect.restore()
    ajax.get.restore()
  })

  describe('Not logged in', () => {
    beforeEach(() => {
      sinon.stub(cookies, 'get').returns(null)
      stubbedBrowser = sinon.stub(browser, 'redirect')

      var resolved = () => {
        return {
          then: function (success, error) {
            error({
              'status': 404,
              'data': {}
            })
          }
        }
      }

      stubbedApi = sinon.stub(ajax, 'get').returns(resolved)

      model = new Model()
    })

    it('should redirect to login', () => {
      var browserRedirectedWithExpectedUrl = stubbedBrowser.withArgs(adminurls.login).calledOnce
      expect(browserRedirectedWithExpectedUrl).toBeTruthy()
    })
  })

  describe('Has session token', () => {
    beforeEach(() => {
      sinon.stub(cookies, 'get').returns('stored-session-token')
      stubbedBrowser = sinon.stub(browser, 'redirect')
      stubbedApi = sinon.stub(ajax, 'get')
    })

    describe('as Super Admin', () => {
      beforeEach(() => {
        sinon.stub(querystring, 'parameter')
        let resolved = {
          then: function (success, error) {
            success({
              'status': 200,
              'data': {
                'authClaims': [ 'SuperAdmin' ]
              }
            })
          }
        }

        stubbedApi.returns(resolved)
        model = new Model()
      })

      afterEach(() => {
        querystring.parameter.restore()
      })

      it('should check if session still valid', () => {
        var apiCalled = stubbedApi.withArgs(endpoints.sessions,
          {
            'content-type': 'application/json',
            'session-token': 'stored-session-token'
          },
          {}).calledOnce

        expect(apiCalled).toBeTruthy()
      })

      it('should redirect to dashboard', () => {
        var browserRedirectedWithExpectedUrl = stubbedBrowser.withArgs(adminurls.dashboard).calledOnce
        expect(browserRedirectedWithExpectedUrl).toBeTruthy()
      })
    })

    describe('Admin For', () => {
      beforeEach(() => {
        sinon.stub(querystring, 'parameter')
        let resolved = {
          then: (success, _) => {
            success({
              'status': 200,
              'data': {
                'authClaims': [ 'OrgAdmin', 'AdminFor:coffee4craig' ]
              }
            })
          }
        }

        stubbedApi.returns(resolved)
        model = new Model()
      })

      afterEach(() => {
        querystring.parameter.restore()
      })

      it('should check if session still valid', () => {
        var apiCalled = stubbedApi.withArgs(endpoints.sessions,
          {
            'content-type': 'application/json',
            'session-token': 'stored-session-token'
          },
          {}).calledOnce

        expect(apiCalled).toBeTruthy()
      })

      it('should redirect to service provider page', () => {
        var browserRedirectedWithExpectedUrl = stubbedBrowser.withArgs(adminurls.serviceProviders + '?key=coffee4craig').calledOnce
        expect(browserRedirectedWithExpectedUrl).toBeTruthy()
      })
    })

    describe('Charter Admin', () => {
      beforeEach(() => {
        sinon.stub(querystring, 'parameter')
        let resolved = {
          then: function (success, error) {
            success({
              'status': 200,
              'data': {
                'authClaims': [ 'CharterAdmin' ]
              }
            })
          }
        }

        stubbedApi.returns(resolved)
        model = new Model()
      })

      afterEach(() => {
        querystring.parameter.restore()
      })

      it('should check if session still valid', () => {
        var apiCalled = stubbedApi.withArgs(endpoints.sessions,
          {
            'content-type': 'application/json',
            'session-token': 'stored-session-token'
          },
          {}).calledOnce

        expect(apiCalled).toBeTruthy()
      })

      it('should redirect to charter page', () => {
        var browserRedirectedWithExpectedUrl = stubbedBrowser.withArgs(adminurls.charter).calledOnce
        expect(browserRedirectedWithExpectedUrl).toBeTruthy()
      })
    })

    describe('- with redirect url', () => {
      beforeEach(() => {
        sinon.stub(querystring, 'parameter')
          .returns('https://admin.streetsupport.net/previous-url/')
        sinon.stub(browser, 'origin')
          .returns('https://admin.streetsupport.net')

        let resolved = {
          then: function (success, error) {
            success({
              'status': 200,
              'data': {
                'authClaims': [ 'CharterAdmin' ]
              }
            })
          }
        }

        stubbedApi.returns(resolved)
        model = new Model()
      })

      afterEach(() => {
        querystring.parameter.restore()
        browser.origin.restore()
      })

      it('should check if session still valid', () => {
        var apiCalled = stubbedApi.withArgs(endpoints.sessions,
          {
            'content-type': 'application/json',
            'session-token': 'stored-session-token'
          },
          {}).calledOnce

        expect(apiCalled).toBeTruthy()
      })

      it('should redirect to redirect url', () => {
        var browserRedirectedWithExpectedUrl = stubbedBrowser.withArgs('https://admin.streetsupport.net/previous-url/').calledOnce
        expect(browserRedirectedWithExpectedUrl).toBeTruthy()
      })
    })

    describe('- with invalid redirect url', () => {
      beforeEach(() => {
        sinon.stub(querystring, 'parameter')
          .returns('https://haxx0rz.l337/phishing/')
        sinon.stub(browser, 'origin')
          .returns('https://admin.streetsupport.net')

        let resolved = {
          then: function (success, error) {
            success({
              'status': 200,
              'data': {
                'authClaims': [ 'CharterAdmin' ]
              }
            })
          }
        }

        stubbedApi.returns(resolved)
        model = new Model()
      })

      afterEach(() => {
        querystring.parameter.restore()
        browser.origin.restore()
      })

      it('should check if session still valid', () => {
        var apiCalled = stubbedApi.withArgs(endpoints.sessions,
          {
            'content-type': 'application/json',
            'session-token': 'stored-session-token'
          },
          {}).calledOnce

        expect(apiCalled).toBeTruthy()
      })

      it('should redirect to relevant home page', () => {
        var browserRedirectedWithExpectedUrl = stubbedBrowser.withArgs(adminurls.charter).calledOnce
        expect(browserRedirectedWithExpectedUrl).toBeTruthy()
      })
    })

    describe('session expired', () => {
      beforeEach(() => {
        let resolved = {
          then: function (success, error) {
            error({
              'status': 401
            })
          }
        }

        stubbedApi.returns(resolved)
        model = new Model()
      })

      it('should check if session still valid', () => {
        var apiCalled = stubbedApi.withArgs(endpoints.sessions,
          {
            'content-type': 'application/json',
            'session-token': 'stored-session-token'
          },
          {}).calledOnce

        expect(apiCalled).toBeTruthy()
      })

      it('should redirect to login', () => {
        var browserRedirectedWithExpectedUrl = stubbedBrowser.withArgs(adminurls.login).calledOnce
        expect(browserRedirectedWithExpectedUrl).toBeTruthy()
      })
    })
  })
})
