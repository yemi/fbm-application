import {Rx} from '@cycle/core'
import {API_URL} from '../../config'
import {urlToRequestObjectWithHeaders, isTruthy} from '../../util'

function mainHttpResponse (HttpSource) {
  const applicationState$ = HttpSource
    .filter(response$ => response$.request.url === `${API_URL}/application`)
    .mergeAll()
    .filter(response => isTruthy(response.body))
    .map(response => response.body)
    // .publishValue([]).refCount()
  return applicationState$
}

function mainHttpRequest (...otherRequest$) {
  const initialApplicationRequest$ = Rx.Observable.just(`${API_URL}/application`)
    .map(urlToRequestObjectWithHeaders)
  const request$ = Rx.Observable.merge(initialApplicationRequest$, ...otherRequest$)
  return request$
}

export default {mainHttpRequest, mainHttpResponse}
