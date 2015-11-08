/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {compose, equals, filter, prop} from 'ramda'
import view from './view'

const main = props$ => {
  const vTree$ = view(props$)
  return {
    DOM: vTree$
  }
}

export default main
