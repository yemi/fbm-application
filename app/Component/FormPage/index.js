import {Rx} from '@cycle/core'
import intent from './intent'
import view from './view'
import {filter, over, assoc, prop, flatten, path, compose, map} from 'ramda'
import {model} from './model'
import {getFetchDataResponse$, getPostStateResponse$, makeHttpRequest$} from './http'
import {isSuccessfulHttpResponse, makePostStateRequestObject, replicateStream, lenses, log} from '../utils'
import {withLatestFrom, merge, flatMapLatest, mapIndexed, rxJust} from '../helpers'
import inputField from '../Widget/InputField'

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

const main = props => {
  const amendedState$ = map(amendState(props.DOM), state$).shareReplay(1)
  const vTree$ = view(amendedState$)
  const inputFieldEdit$ = makeInputFieldAction$('edit$', amendedState$)
  replicateStream(inputFieldEdit$, proxies.inputField.edit$)
  return {
    DOM: vTree$,
    HTTP: request$,
    LocalStorage: state$,
    History: merge(actions.url$, successUrl$)
  }
}

export default main
