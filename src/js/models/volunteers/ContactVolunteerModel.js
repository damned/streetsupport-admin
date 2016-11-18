'use strict'

var BaseViewModel = require('../BaseViewModel')
var ajax = require('../../ajax')
var browser = require('../../browser')
var cookies = require('../../cookies')
var getUrlParam = require('../../get-url-parameter')
var ko = require('knockout')
require('knockout.validation') // No variable here is deliberate!
var Volunteer = require('./Volunteer')

var ContactVolunteerModel = function () {
  var self = this
  self.isFormSubmitSuccessful = ko.observable(false)
  self.isFormSubmitFailure = ko.observable(false)
  self.formModel = ko.validatedObservable({
    message: ko.observable().extend({ required: true }),
    isAnEmail: ko.observable()
  })
  self.fieldErrors = ko.validation.group(self.formModel)
  self.apiErrors = ko.observableArray()
  self.volunteer = ko.observable()

  ko.validation.init({
    insertMessages: true,
    decorateInputElement: true,
    parseInputAttributes: true,
    errorMessageClass: 'form__error',
    errorElementClass: 'form__input--error'
  }, true)

  const headers = self.headers(cookies.get('session-token'))

  self.submit = function () {
    if (self.formModel.isValid()) {
      browser.loading()
      var endpoint = self.endpointBuilder.volunteers(getUrlParam.parameter('id')).build() + '/contact-requests'
      var payload = {
        'Message': self.formModel().message(),
        'ShouldSendEmail': self.formModel().isAnEmail()
      }
      ajax
        .post(endpoint, headers, payload)
        .then(function (res) {
          browser.loaded()
          if (res.status === 'error') {
            self.isFormSubmitFailure(true)
            self.showErrors(res)
          } else {
            self.isFormSubmitSuccessful(true)
          }
        }, function (res) {
          self.handleServerError(res)
        })
    } else {
      self.fieldErrors.showAllMessages()
    }
  }

  const getEndpoint = self.endpointBuilder.volunteers(getUrlParam.parameter('id')).build()
  ajax
    .get(getEndpoint, headers)
    .then((res) => {
      self.volunteer(new Volunteer(res.data))
      self.formModel().isAnEmail(self.volunteer().person.telephone.length === 0)
    }, () => {

    })
}

ContactVolunteerModel.prototype = new BaseViewModel()

module.exports = ContactVolunteerModel
