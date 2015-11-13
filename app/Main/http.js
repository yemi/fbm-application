import R from 'ramda'
import {API_URL} from '../config'
import {log, makeRequestObject} from '../utils'
import H from '../helpers'

// Helpers

const isRequestUrlPath = path => R.compose(R.propEq('url', `${API_URL}/${path}`), R.prop('request'))

const isRequestMethod = method => R.compose(R.propEq('method', method), R.prop('request'))

const requestFilter = method => R.both(isRequestUrlPath('application'), isRequestMethod(method))

// Fetch data response (GET)

const getHttpGetResponse$ = R.compose(
  R.map(R.prop('body')),
  R.filter(R.has('body')),
  H.retry(3),
  H.mergeAll,
  R.filter(requestFilter('GET'))
)

// Post state response (POST)

const getHttpPostResponse$ = R.compose(
  R.map(log),
  H.retry(3),
  H.mergeAll,
  R.filter(requestFilter('POST'))
)

// Http requests

const initialApplicationRequest$ = R.map(makeRequestObject('GET', null), H.rxJust(`${API_URL}/application`))

const makeHttpRequest$ = (...otherRequest$) =>
  H.merge(
    initialApplicationRequest$,
    ...otherRequest$
  )

export {
  getHttpGetResponse$,
  getHttpPostResponse$,
  makeHttpRequest$
}
