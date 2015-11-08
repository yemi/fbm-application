import {Rx} from '@cycle/core'
import {filter, compose, map, prop} from 'ramda'
import intent from './intent'
import view from './view'
import model from './model'
import {getFetchDataResponse$, getPostStateResponse$, makeHttpRequest$} from './http'
import {makePageType$, isSuccessfulHttpResponse, makePostStateRequestObject, replicateStream, log} from '../utils'
import {withLatestFrom, merge} from '../helpers'
import StepPage from '../Component/StepPage'
import GenericPage from '../Component/GenericPage'
import Footer from '../Component/Footer'

const main = sources => {
  const responses = {
    fetchDataResponse$: getFetchDataResponse$(sources.HTTP),
    postStateResponse$: getPostStateResponse$(sources.HTTP)
  }

  const proxyState$ = new Rx.ReplaySubject(1)

  const stepPage$ = makePageType$('step', proxyState$)
  const stepPage = StepPage(sources.DOM, stepPage$)
  const genericPage$ = makePageType$('generic', proxyState$)
  const genericPage = GenericPage(genericPage$)
  const footer = Footer(proxyState$)

  const actions = intent(sources.DOM, stepPage)
  const state$ = model(actions, responses, sources.History, sources.LocalStorage).shareReplay(1)
  const pageVTree$ = merge(stepPage.DOM, genericPage.DOM)
  const vTree$ = view(footer.DOM, pageVTree$)

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
