import Rx from 'rx'
import R from 'ramda'
import intent from './intent'
import view from './view'
import model from './model'
import {getHttpGetResponse$, getHttpPostResponse$, makeHttpRequest$} from './http'
import {log, log_, makePageType$, isSuccessfulHttpResponse, makePostStateRequestObject, replicateStream} from '../utils'
import {withLatestFrom, merge} from '../helpers'
import FormPage from '../Component/FormPage'
import GenericPage from '../Component/GenericPage'
import Footer from '../Component/Footer'

const FormPageWrapper = ({DOM, state$}) => {
  const props$ = makePageType$('step', state$)
  return log(FormPage({DOM, props$}))
}

const GenericPageWrapper = ({state$}) => {
  const props$ = makePageType$('generic', state$)
  return GenericPage({props$})
}

const main = ({DOM, HTTP, LocalStorage, History}) => {
  const proxyState$ = new Rx.ReplaySubject(1)
  const formPage = FormPageWrapper({DOM, state$: proxyState$})
  const genericPage = GenericPageWrapper({state$: proxyState$})
  const footer = Footer(proxyState$)

  const httpGetResponse$ = getHttpGetResponse$(HTTP)
  const httpPostResponse$ = getHttpPostResponse$(HTTP).shareReplay(1)

  const actions = intent(DOM, formPage)
  const state$ = model({actions, httpGetResponse$, httpPostResponse$, History, LocalStorage}).shareReplay(1)

  const pageVTree$ = merge(formPage.DOM, genericPage.DOM)
  const vTree$ = view(History, footer.DOM, pageVTree$)

  const postStateRequest$ = withLatestFrom((_, state) => 
    makePostStateRequestObject(state), actions.submit$, state$)
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
