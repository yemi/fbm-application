import {Rx} from '@cycle/core'
import intent from './intent'
import view from './view'
import {model} from './model'
import {mainHttpResponse, mainHttpRequest} from './http'

const main = sources => {
  const mainHttpResponse$ = mainHttpResponse(sources.HTTP)
  const actions = intent(sources)
  const state$ = model(mainHttpResponse$, sources.Route, actions)
  const vTree$ = view(state$)
  const request$ = mainHttpRequest()
  return {
    DOM: vTree$,
    HTTP: request$
  }
}

export default main
