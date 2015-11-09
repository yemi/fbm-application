import {Rx} from '@cycle/core'
import {mockDOMResponse} from '@cycle/dom'
import test from 'tape'
import FormField from './index'

const textField = {
  "label": "Company name",
  "id": "company-name",
  "type": "text",
  "required": true,
  "helpText": "This should be the brand name of your business, not its official or legal name. Think \"Google\" rather than \"Google Ltd\" or \"Google.com\""
}

test('FormField type', assert => {
  const actual = typeof FormField
  const expected = 'function'
  assert.equal(actual, expected, 'FormField should be a function')
  assert.end()
})

test('FormField input', assert => {
  const props$ = Rx.Observable.just(textField)
  const name = 'company-name'
  const DOMResponse = mockDOMResponse({
    '#company-name input': {
      // 'input': Rx.Observable.just({target: {value: 'Gregory Isaacs'}}),
      'change': Rx.Observable.just({target: {}})
    }
  })
  // DOMResponse.select(`#${name} input`).events('input').subscribe(console.log)
  const {edit$, DOM} = FormField({DOM: DOMResponse, props$}, name)
  edit$.first().subscribe(console.log)
  DOM.first().subscribe(formField => {
    const actual = formField.value
    const expected = 'Gregory Isaacs'
    assert.equal(actual, expected, 'FormField edit should return an object containing the changed value')
    assert.end()
  })
})
