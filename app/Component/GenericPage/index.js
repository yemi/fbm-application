/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {compose, equals, filter, prop} from 'ramda'
import view from './view'

const main = props$ => {
  const isGenericPage = compose(equals('generic'), prop('type'))
  const genericPage$ = filter(isGenericPage, props$)
  const vTree$ = view(genericPage$)
  return {
    DOM: vTree$
  }
}

export default main
