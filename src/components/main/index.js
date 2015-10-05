import {Rx} from '@cycle/core'
import intent from './intent'
import view from './view'
import {model} from './model'
import {fetchDataResponse, postStateResponse, mainHttpRequest} from './http'
import {log} from '../../util'

const main = sources => {
  const fetchDataResponse$ = fetchDataResponse(sources.HTTP)
  const postStateResponse$ = postStateResponse(sources.HTTP)
  const proxyPostStateRequests$ = new Rx.Subject()
  const actions = intent(sources)
  const request$ = mainHttpRequest(proxyPostStateRequests$)
  const state$ = model(
    actions,
    fetchDataResponse$,
    postStateResponse$,
    sources.Route,
    proxyPostStateRequests$
  )
  const vTree$ = view(state$)
  return {
    DOM: vTree$,
    HTTP: request$
  }
}

export default main
