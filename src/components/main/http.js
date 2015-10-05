import {Rx} from '@cycle/core'
import {API_URL} from '../../config'
import {log, urlToRequestObjectWithHeaders, isTruthy} from '../../util'

function fetchDataResponse (httpSource) {
  return httpSource
    .filter(res$ =>
      res$.request.url === `${API_URL}/application` && res$.request.method === 'GET')
    .mergeAll()
    .filter(res => isTruthy(res.body))
    .map(res => res.body)
    // .publishValue([]).refCount()
}

function postStateResponse (httpSource) {
  return httpSource
    .filter(res$ =>
      res$.request.url === `${API_URL}/application` && res$.request.method === 'POST')
    .mergeAll()
    .map(res => ({ success: res.statusCode === 200 }))
}

function mainHttpRequest (...otherRequest$) {
  const initialApplicationRequest$ = Rx.Observable.just(`${API_URL}/application`)
    .map(urlToRequestObjectWithHeaders)
  const request$ = Rx.Observable.merge(initialApplicationRequest$, ...otherRequest$)
  return request$
}

export default {mainHttpRequest, fetchDataResponse, postStateResponse}
