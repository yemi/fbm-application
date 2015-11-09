/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import R from 'ramda'
import H from '../../helpers'
import U from '../../utils'

const intent = (DOM, name = '') => ({
  editInput$: R.map(R.prop('target'), H.merge(
    DOM.select(`#${name} input`).events('input'),
    DOM.select(`#${name} textarea`).events('input'),
    DOM.select(`#${name} input[type="radio"]`).events('change'),
    DOM.select(`#${name} input[type="checkbox"]`).events('change'),
    DOM.select(`#${name} select`).events('change')
  )),

  stopEdit$: H.merge(
    DOM.select(`#${name} select`).events('blur'),
    DOM.select(`#${name} input`).events('change'),
    DOM.select(`#${name} textarea`).events('change'),
    DOM.select(`#${name} input[type="radio"]`).events('change'),
    DOM.select(`#${name} input[type="checkbox"]`).events('change')
  ),

  focus$: H.merge(
    R.map(() => true, DOM.select(`#${name} input, #${name} select, #${name} textarea`).events('focus')),
    R.map(() => false, DOM.select(`#${name} input, #${name} select, #${name} textarea`).events('blur'))
  ).startWith(false)
})

export default intent
