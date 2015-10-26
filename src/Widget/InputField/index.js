/** @jsx hJSX */
import {Rx} from '@cycle/core'
import view from './view'
import model from './model'
import intent from './intent'
import {log} from '../../utils'

const inputField = ({DOM, props$}, name = '') => {
  const actions = intent(DOM, name)
  const state$ = model(props$, actions).shareReplay(1)
  const vtree$ = view(state$, actions.focus$, name)
  const edit$ = actions.stopEdit$.withLatestFrom(state$, (_, state) => state).map(log)
  return {
    DOM: vtree$,
    edit$: edit$
  }
}

export default inputField
