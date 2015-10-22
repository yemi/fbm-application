/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {map, path} from 'ramda'
import {merge} from '../../helpers'

const targetValue = path(['target', 'value'])

const intent = (DOM, name = '') => ({
  input$: map(targetValue, DOM.select(`#${name} input`).events('input')),
  focused$: merge(
    map(() => true, DOM.select(`#${name} input`).events('focus')),
    map(() => false, DOM.select(`#${name} input`).events('blur'))
  )
})

export default intent
