/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {map, path} from 'ramda'
import {merge} from '../../helpers'
import {log} from '../../utils'

const targetValue = path(['target', 'value'])

const intent = (DOM, name = '') => ({
  editInput$: map(targetValue, merge(
    DOM.select(`#${name} input, #${name} textarea`).events('input'),
    DOM.select(`#${name} input[type="radio"]`).events('change'),
    DOM.select(`#${name} select`).events('change')
  )),

  stopEdit$: merge(
    DOM.select(`#${name} select`).events('blur'),
    DOM.select(`#${name} input, #${name} textarea, #${name} input[type="radio"]`).events('change')
  ),

  focus$: merge(
    map(() => true, DOM.select(`#${name} input, #${name} select, #${name} textarea`).events('focus')),
    map(() => false, DOM.select(`#${name} input, #${name} select, #${name} textarea`).events('blur'))
  ).startWith(false)
})

export default intent
