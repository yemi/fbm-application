import view from './view'
import model from './model'
import intent from './intent'
import H from '../../helpers'
import {log} from '../../utils'

const formField = ({DOM, props$}, name = '') => {
  const actions = intent(DOM, name)
  const state$ = model(props$, actions)
  const vtree$ = view(state$, actions.focus$, name)
  const stopEdit$ = H.merge(actions.editOptionInput$, actions.stopEditTextInput$)
  const edit$ = H.sample(state$, stopEdit$)
  return {
    DOM: vtree$,
    edit$: edit$
  }
}

export default formField
