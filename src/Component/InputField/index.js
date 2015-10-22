/** @jsx hJSX */
import {Rx} from '@cycle/core'
import view from './view'
import model from './model'
import intent from './intent'
import {skip} from '../../helpers'

const inputField = ({DOM, props$}, name = '') => {
  const actions = intent(DOM, name)
  const state$ = model(props$, actions)
  const vtree$ = view(state$, name)
  return {
    DOM: vtree$,
    edit$: skip(1, state$)
  }
}

export default inputField
