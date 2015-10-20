import {Rx} from '@cycle/core'
import intent from './intent'
import view from './view'
import {map, mapObjIndexed} from 'ramda'
import {model} from './model'
import {fetchDataResponse, postStateResponse, httpRequest} from './http'
import {localStorageSink} from './localStorage'
import Footer from '../Footer'
import Content from '../Content'
import inputField from '../InputField'

const amendState = DOM => state => ({
  ...state,
  steps: state.steps.map(step => ({
    ...step,
    fields: step.fields.map(field => {
      const props$ = Rx.Observable.just(field)
      return {
        ...field,
        inputField: inputField({DOM, props$}, field.id)
      }
    })
  }))
})

const makeInputFieldActions = (typeInputFieldActions, amendedState$) => {
  const mergeInputFieldActions = (_, actionKey) =>
    amendedState$.flatMapLatest(state => {
      const step = nth(state.activeStep, state.steps)
      console.log(step)
      return Rx.Observable.merge(step.fields.map(field => field.inputField[actionKey]))
    })

  return mapObjIndexed(mergeInputFieldActions, typeInputFieldActions)
}

const replicateAll = (objectStructure, realStreams, proxyStreams) => {
  const replicateKeyStream = (_, key) =>
    realStreams[key].subscribe(proxyStreams[key].asObserver())

  return mapObjIndexed(replicateKeyStream, objectStructure)
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
  const actions = intent(sources, proxyInputFieldActions)
  const request$ = httpRequest(proxies.postStateRequest$)
  const state$ = model(actions, responses, proxies, sources.Route, sources.LocalStorage)
  // const content = Content(state$)
  // const footer = Footer(state$)
  const amendedState$ = map(amendState(sources.DOM), state$).shareReplay(1)
  const inputFieldActions = makeInputFieldActions(typeInputFieldActions, amendedState$)
  // const vTree$ = view(content.DOM, footer.DOM)
  const localStorageSink$ = localStorageSink(state$)
  const vTree$ = view(amendedState$)
  replicateAll(typeInputFieldActions, inputFieldActions, proxyInputFieldActions)

  return {
    DOM: vTree$,
    HTTP: request$,
    LocalStorage: localStorageSink$
  }
}

export default main
