import {Rx} from '@cycle/core'
import intent from './intent'
import view from './view'
import {assoc, prop, flatten, path, compose, map, mapObjIndexed} from 'ramda'
import {model} from './model'
import {fetchDataResponse, postStateResponse, httpRequest} from './http'
import {lenses, log} from '../utils'
import {merge, flatMapLatest, mapIndexed, rxJust} from '../helpers'
import inputField from '../Widget/InputField'

const amendState = DOM => state => {
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


  // ...state,
  // pages: assoc(state.activeRoute, {
  //   ...prop(state.activeRoute, state.pages),
  //   fieldGroups: prop(state.activeRoute, state.pages).fieldGroups.map((fieldGroup, i) => ({
  //     ...fieldGroup,
  //     fields: fieldGroup.fields.map((field, y) => {
  //       const props$ = rxJust({ ...field, fieldGroupIndex: i, fieldIndex: y })
  //       return {
  //         ...field,
  //         inputField: inputField({DOM, props$}, field.id)
  //       }
  //     })
  //   }))
  // }, state.pages)
}

const makeInputFieldActions = (typeInputFieldActions, amendedState$) => {
  const getActionFromInputFields$ = actionKey => state => {
    const page = prop(state.activeRoute, state.pages)
    const getInputFieldAction = path(['inputField', actionKey])
    const getActionsFromFields = compose(map(getInputFieldAction), prop('fields'))
    const getActionsFromFieldGroups = compose(flatten, map(getActionsFromFields), prop('fieldGroups'))
    const actions = getActionsFromFieldGroups(page)
    const action$ = merge(actions)
    return action$
  }
  const makeActionFromInputFields$ = (_, actionKey) => flatMapLatest(getActionFromInputFields$(actionKey), amendedState$)
  const inputFieldActions = mapObjIndexed(makeActionFromInputFields$, typeInputFieldActions)
  return inputFieldActions
}

const replicateStruct = (objectStructure, realStreams, proxyStreams) => {
  const replicateKeyStream = (_, key) => realStreams[key].subscribe(proxyStreams[key].asObserver())
  mapObjIndexed(replicateKeyStream, objectStructure)
}

const main = sources => {
  const responses = {
    fetchDataResponse$: fetchDataResponse(sources.HTTP),
    postStateResponse$: postStateResponse(sources.HTTP)
  }
  const proxies = {
    postStateRequest$: new Rx.Subject()
  }
  const typeInputFieldActions = { edit$: null }
  const proxyInputFieldActions = mapObjIndexed(() => new Rx.Subject(), typeInputFieldActions)
  const actions = intent(sources.DOM, proxyInputFieldActions)
  const request$ = httpRequest(proxies.postStateRequest$)
  const state$ = model(actions, responses, proxies, sources.History, sources.LocalStorage).shareReplay(1)
  const amendedState$ = map(amendState(sources.DOM), state$).shareReplay(1)
  const vTree$ = view(amendedState$)
  const inputFieldActions = makeInputFieldActions(typeInputFieldActions, amendedState$)
  replicateStruct(typeInputFieldActions, inputFieldActions, proxyInputFieldActions)
  return {
    DOM: vTree$,
    HTTP: request$,
    LocalStorage: state$,
    History: actions.url$
  }
}

export default main
