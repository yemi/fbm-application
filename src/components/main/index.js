import {Rx} from '@cycle/core'
import intent from './intent'
import view from './view'
import {model} from './model'
import {fetchDataResponse, postStateResponse, httpRequest} from './http'
import {localStorageSink} from './localStorage'
import Footer from '../widgets/Footer'
import Content from '../widgets/Content'

const main = sources => {
  const responses = {
    fetchDataResponse$: fetchDataResponse(sources.HTTP),
    postStateResponse$: postStateResponse(sources.HTTP)
  }
  const proxies = {
    postStateRequest$: new Rx.Subject()
  }
  const actions = intent(sources)
  const request$ = httpRequest(proxies.postStateRequest$)
  const state$ = model(actions, responses, proxies, sources.Route, sources.LocalStorage)
  const content = Content(state$)
  const footer = Footer(state$)
  const vTree$ = view(content.DOM, footer.DOM)
  const localStorageSink$ = localStorageSink(state$)

  return {
    DOM: vTree$,
    HTTP: request$,
    LocalStorage: localStorageSink$
  }
}

export default main
