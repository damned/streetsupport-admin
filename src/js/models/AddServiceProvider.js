const ko = require('knockout')
const ajax = require('../ajax')
const auth = require('../auth')
const adminUrls = require('../admin-urls')
const cookies = require('../cookies')
const browser = require('../browser')
const BaseViewModel = require('./BaseViewModel')

import { cities } from '../../data/generated/supported-cities'

function AddServiceProvider () {
  const self = this
  self.name = ko.observable('')
  self.cityId = ko.observable()
  self.cities = ko.observableArray()

  const buildPost = () => {
    const cityId = auth.isCityAdmin()
    ? auth.cityAdminFor()
    : self.cityId()
    const endpoint = self.endpointBuilder.serviceProviders().build()
    const payload = {
      'Name': self.name(),
      'AssociatedCity': cityId
    }

    return {
      endpoint,
      headers: self.headers(cookies.get('session-token')),
      payload
    }
  }

  const handlePost = (result) => {
    browser.loaded()
    if (result.statusCode === 201) {
      browser.redirect(adminUrls.dashboard)
    } else {
      self.handleError(result)
    }
  }

  self.save = function () {
    browser.loading()

    const postParams = buildPost()

    ajax
      .post(postParams.endpoint, postParams.headers, postParams.payload)
      .then(function (result) {
        handlePost(result)
      }, function (error) {
        self.handleError(error)
      })
  }

  self.cities(cities)
}

AddServiceProvider.prototype = new BaseViewModel()

module.exports = AddServiceProvider
