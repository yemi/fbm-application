/** @jsx hJSX */
import {Rx} from '@cycle/core'
import {log} from '../../utils'
import view from './view'
import model from './model'
import intent from './intent'

const inputField = ({DOM, props$}, name = '') => {
  const actions = intent(DOM, name)
  const state$ = model(actions, props$)
  const vtree$ = view(name)(state$)
  return {
    DOM: vtree$,
    edit$: state$.skip(1)
  }
}

export default inputField
