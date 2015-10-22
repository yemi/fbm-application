/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {map, path} from 'ramda'

const targetValue = path(['target', 'value'])

const intent = (DOM, name = '') => ({
  valueChange$: map(targetValue, DOM.select(`.${name} input`).events('change'))
})

export default intent
