import {Rx} from '@cycle/core'
import intent from './intent'
import view from './view'
import {filter, over, assoc, prop, flatten, path, compose, map} from 'ramda'
import {model} from './model'
import {getFetchDataResponse$, getPostStateResponse$, makeHttpRequest$} from './http'
import {isSuccessfulHttpResponse, makePostStateRequestObject, replicateStream, lenses, log} from '../utils'
import {withLatestFrom, merge, flatMapLatest, mapIndexed, rxJust} from '../helpers'
import FormPage from '../Component/FormPage'
import GenericPage from '../Component/GenericPage'

const main = sources => {
  const responses = {
    fetchDataResponse$: getFetchDataResponse$(sources.HTTP),
    postStateResponse$: getPostStateResponse$(sources.HTTP)
  }

  const proxyState$ = new Rx.ReplaySubject(1)
  const formPage = FormPage(sources.DOM, proxyState$)
  const genericPage = GenericPage(proxyState$)

  const actions = intent(sources.DOM, formPage)
  const state$ = model(actions, responses, sources.History, sources.LocalStorage).shareReplay(1)
  const vTree$ = view(state$, formPage.DOM, genericPage.DOM)

  const getPostStateRequestObject = (_, state) => makePostStateRequestObject(state)
  const postStateRequest$ = withLatestFrom(getPostStateRequestObject, actions.submit$, state$)
  const request$ = makeHttpRequest$(postStateRequest$)

  const makeSuccessUrl$ = compose(map(res => `/application-sent`), filter(isSuccessfulHttpResponse))
  const successUrl$ = makeSuccessUrl$(responses.postStateResponse$)

  replicateStream(state$, proxyState$)
  return {
    DOM: vTree$,
    HTTP: request$,
    LocalStorage: state$,
    History: merge(actions.url$, successUrl$)
  }
}

export default main
