/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {map, path} from 'ramda'
import {merge} from '../../helpers'
import {log} from '../../utils'

const targetValue = path(['target', 'value'])

const intent = (DOM, name = '') => ({
  editInput$: map(targetValue, merge(
    DOM.select(`#${name} input`).events('input'),
    DOM.select(`#${name} input[type="radio"]`).events('change'),
    DOM.select(`#${name} select`).events('change')
  )),

  stopEdit$: DOM.select(`#${name} input, #${name} select`).events('blur'),

  focus$: merge(
    map(() => true, DOM.select(`#${name} input`).events('focus')),
    map(() => false, DOM.select(`#${name} input`).events('blur'))
  ).startWith(false)
})

export default intent
