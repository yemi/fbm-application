import {Rx} from '@cycle/core'
import {filter, compose, map, prop} from 'ramda'
import intent from './intent'
import view from './view'
import model from './model'
import {getFetchDataResponse$, getPostStateResponse$, makeHttpRequest$} from './http'
import {isSuccessfulHttpResponse, makePostStateRequestObject, replicateStream, log} from '../utils'
import {withLatestFrom, merge} from '../helpers'
import FormPage from '../Component/FormPage'
import GenericPage from '../Component/GenericPage'
import Footer from '../Component/Footer'

const getActivePage = state => {
  const activePage = prop(state.activeRoute, state.pages)
  return activePage
}

const main = sources => {
  const responses = {
    fetchDataResponse$: getFetchDataResponse$(sources.HTTP),
    postStateResponse$: getPostStateResponse$(sources.HTTP)
  }

  const proxyState$ = new Rx.ReplaySubject(1)
  const activePage$ = map(getActivePage, proxyState$)

  const formPage = FormPage(sources.DOM, activePage$)
  const genericPage = GenericPage(activePage$)
  const footer = Footer(proxyState$)

  const actions = intent(sources.DOM, formPage)
  const state$ = model(actions, responses, sources.History, sources.LocalStorage).shareReplay(1)
  const pageVTree$ = merge(formPage.DOM, genericPage.DOM)
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
