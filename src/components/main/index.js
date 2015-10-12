import {Rx} from '@cycle/core'
import {filter, has} from 'ramda'
import {merge, head} from '../../helpers'
import intent from './intent'
import view from './view'
import {model} from './model'
import {fetchDataResponse, postStateResponse, httpRequest} from './http'
import {localStorageSink} from './localStorage'
import Footer from '../widgets/Footer'
import Content from '../widgets/Content'

const sourceData = sources => {
  const nonEmptyLocalStorage$ = filter(has('steps'), sources.LocalStorage)
  const fetchDataResponse$ = fetchDataResponse(sources.HTTP)
  const sourceData$ = head(merge(fetchDataResponse$, nonEmptyLocalStorage$))

  return sourceData$
}

const main = sources => {
  const responses = {
    postStateResponse$: postStateResponse(sources.HTTP)
  }
  const proxies = {
    postStateRequest$: new Rx.Subject()
  }
  const actions = intent(sources)
  const request$ = httpRequest(proxies.postStateRequest$)
  const sourceData$ = sourceData(sources)
  const state$ = model(actions, responses, proxies, sourceData$, sources.Route)
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
