import {Rx} from '@cycle/core'
import {filter, prop, flatten, path, compose, map} from 'ramda'
import view from './view'

const main = props$ => {
  const vTree$ = view(props$)
  return {
    DOM: vTree$
  }
}

export default main
