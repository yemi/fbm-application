/** @jsx hJSX */
import {Rx} from '@cycle/core'
import view from './view'
import model from './model'
import intent from './intent'
import H from '../../helpers'
import {log} from '../../utils'

const formField = ({DOM, props$}, name = '') => {
  console.log('initialised', name)
  const actions = intent(DOM, name)
  const state$ = model(props$, actions).shareReplay(1)
  const vtree$ = view(state$, actions.focus$, name)
  const stopEdit$ = H.merge(actions.editOptionInput$, actions.stopEditTextInput$)
  const edit$ = H.sample(state$, stopEdit$).map(log)
  return {
    DOM: vtree$,
    edit$: edit$
  }
}

export default formField
