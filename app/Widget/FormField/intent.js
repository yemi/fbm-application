/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import R from 'ramda'
import H from '../../helpers'
import U from '../../utils'

const intent = (DOM, name = '') => ({
  editTextInput$: R.map(R.prop('target'), H.merge(
    DOM.select(`#${name} textarea`).events('input'),
    DOM.select(`#${name} input[type="text"]`).events('input')
  )),

  editOptionInput$: R.map(R.prop('target'), H.merge(
    DOM.select(`#${name} select`).events('change'),
    DOM.select(`#${name} input[type="radio"]`).events('change'),
    DOM.select(`#${name} input[type="checkbox"]`).events('change')
  )),

  stopTextInputEdit$: H.merge(
    DOM.select(`#${name} textarea`).events('change'),
    DOM.select(`#${name} input[type="text"]`).events('change'),
  ),

  focus$: H.merge(
    R.map(() => true, DOM.select(`#${name} input, #${name} select, #${name} textarea`).events('focus')),
    R.map(() => false, DOM.select(`#${name} input, #${name} select, #${name} textarea`).events('blur'))
  ).startWith(false)
})

export default intent
