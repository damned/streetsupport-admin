/*
global describe, beforeEach, it, expect
*/

'use strict'

let ko = require('knockout')

describe('Remove Opening Time', () => {
  let Model = require('../../src/js/models/Service')
  let model = null

  beforeEach(() => {
    model = new Model(getData())

    model.edit()
    model.removeOpeningTime({
      'startTime': ko.observable('10:00'),
      'endTime': ko.observable('16:30'),
      'day': ko.observable('Monday')
    })
  })

  it('should remove passed openingTimes', () => {
    expect(model.openingTimes().length).toEqual(1)
    expect(model.openingTimes()[0].day()).toEqual('Tuesday')
    expect(model.openingTimes()[0].startTime()).toEqual('10:00')
    expect(model.openingTimes()[0].endTime()).toEqual('16:30')
  })
})

function getData () {
  return {
    'key': '569d2b468705432268b65c75',
    'name': 'Meals',
    'info': 'Breakfast',
    'openingTimes': [{
      'startTime': '10:00',
      'endTime': '16:30',
      'day': 'Monday'
    }, {
      'startTime': '10:00',
      'endTime': '16:30',
      'day': 'Tuesday'
    }],
    'address': {
      'key': '7a6ff0f3-5b04-4bd9-b088-954e473358f5',
      'street': 'Booth Centre',
      'street1': null,
      'street2': 'Edward Holt House',
      'street3': 'Pimblett Street',
      'city': 'Manchester',
      'postcode': 'M3 1FU',
      'openingTimes': null
    },
    'tags': ['some tags']
  }
}
