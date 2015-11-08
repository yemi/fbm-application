import {Rx} from '@cycle/core'
import R from 'ramda'
import intent from './intent'
import view from './view'
import model from './model'
import {getHttpGetResponse$, getHttpPostResponse$, makeHttpRequest$} from './http'
import {makePageType$, isSuccessfulHttpResponse, makePostStateRequestObject, replicateStream} from '../utils'
import {withLatestFrom, merge} from '../helpers'
import FormPage from '../Component/FormPage'
import GenericPage from '../Component/GenericPage'
import Footer from '../Component/Footer'

const main = ({DOM, HTTP, LocalStorage, History}) => {
  const proxyState$ = new Rx.ReplaySubject(1)
  const formPage$ = makePageType$('step', proxyState$)
  const formPage = FormPage({DOM, props$: formPage$})
  const genericPage$ = makePageType$('generic', proxyState$)
  const genericPage = GenericPage(genericPage$)
  const footer = Footer(proxyState$)

  const httpGetResponse$ = getHttpGetResponse$(HTTP)
  const httpPostResponse$ = getHttpPostResponse$(HTTP)

  const actions = intent(DOM, formPage)
  const state$ = model({actions, httpGetResponse$, httpPostResponse$, History, LocalStorage}).shareReplay(1)
  const pageVTree$ = merge(formPage.DOM, genericPage.DOM)
  const vTree$ = view(footer.DOM, pageVTree$)

  const getPostStateRequestObject = (_, state) => makePostStateRequestObject(state)
  const postStateRequest$ = withLatestFrom(getPostStateRequestObject, actions.submit$, state$)
  const request$ = makeHttpRequest$(postStateRequest$)

  const makeSuccessUrl$ = R.compose(R.map(res => `/application-sent`), R.filter(isSuccessfulHttpResponse))
  const successUrl$ = makeSuccessUrl$(httpPostResponse$)

  replicateStream(state$, proxyState$)

  return {
    DOM: vTree$,
    HTTP: request$,
    LocalStorage: state$,
    History: merge(actions.url$, successUrl$)
  }
}

export default main
