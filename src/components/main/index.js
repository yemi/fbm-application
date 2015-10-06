import {Rx} from '@cycle/core'
import intent from './intent'
import view from './view'
import {model} from './model'
import {fetchDataResponse, postStateResponse, httpRequest} from './http'
import {log} from '../../util'

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
  const state$ = model(actions, responses, proxies, sources.Route, sources.localStorage)
  const vTree$ = view(state$)
  return {
    DOM: vTree$,
    HTTP: request$
  }
}

export default main
