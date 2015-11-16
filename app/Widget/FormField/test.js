import Rx from 'rx'
import {mockDOMResponse} from '@cycle/dom'
import test from 'tape'
import FormField from './index'

const textField = {
  "id": "company-name",
  "type": "text",
  "required": true
}

test('FormField type', assert => {
  const actual = typeof FormField
  const expected = 'function'
  assert.equal(actual, expected, 'FormField should be a function')
  assert.end()
})

test('FormField text edit', assert => {
  const expected = 'Gregory isaacs'
  const props$ = Rx.Observable.just(textField)
  const name = textField.id
  const selector = name + ' input[type="text"]'
  const DOMResponse = mockDOMResponse({
    [`#${name} input[type="text"]`]: {
      'input': Rx.Observable.just({ target: { value: expected }}),
      'change': Rx.Observable.just(null)
    }
  })
  const {edit$} = FormField({DOM: DOMResponse, props$}, name)
  edit$.first().subscribe(formField => {
    const actual = formField.value
    assert.equal(actual, expected, 'FormField should return a stream of objects containing input values')
    assert.end()
  })
})

