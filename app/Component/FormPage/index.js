import {Rx} from '@cycle/core'
import view from './view'
import {filter, over, assoc, prop, flatten, path, compose, map} from 'ramda'
import {lenses} from '../../utils'
import {merge, flatMapLatest, mapIndexed, rxJust} from '../../helpers'
import inputField from '../../Widget/InputField'

const amendState = DOM => state => {
  const activePage = prop(state.activeRoute, state.pages)
  const fieldGroupsLens = lenses.fieldGroups(state.activeRoute)
  const makeInputFields = mapIndexed((fieldGroup, i) => ({
    ...fieldGroup,
    fields: fieldGroup.fields.map((field, y) => {
      const props$ = rxJust({ ...field, fieldGroupIndex: i, fieldIndex: y })
      return {
        ...field,
        inputField: inputField({DOM, props$}, field.id)
      }
    }
  )}))
  const newState = over(fieldGroupsLens, makeInputFields ,state)
  return newState
}

const makeInputFieldAction$ = (actionKey, amendedState$) => {
  const getActionFromInputFields$ = actionKey => state => {
    const page = prop(state.activeRoute, state.pages)
    const getInputFieldAction = path(['inputField', actionKey])
    const getActionsFromFields = compose(map(getInputFieldAction), prop('fields'))
    const getActionsFromFieldGroups = compose(flatten, map(getActionsFromFields), prop('fieldGroups'))
    const actions = getActionsFromFieldGroups(page)
    const action$ = merge(actions)
    return action$
  }
  const inputFieldAction$ = flatMapLatest(getActionFromInputFields$(actionKey), amendedState$)
  return inputFieldAction$
}

const main = (DOM, state$) => {
  const amendedState$ = map(amendState(DOM), state$).shareReplay(1)
  const vTree$ = view(amendedState$)
  const inputFieldEdit$ = makeInputFieldAction$('edit$', amendedState$)
  return {
    DOM: vTree$,
    inputFieldEdit$: inputFieldEdit$
  }
}

export default main
