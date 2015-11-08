import {Rx} from '@cycle/core'
import R from 'ramda'
import {API_URL} from '../config'
import {log, makeRequestObject} from '../utils'
import {mergeAll, merge, retry, rxJust} from '../helpers'

// Helpers

const isRequestUrlPath = path => R.compose(R.propEq('url', `${API_URL}/${path}`), R.prop('request'))

const isRequestMethod = method => R.compose(R.propEq('method', method), R.prop('request'))

const requestFilter = method => R.both(isRequestUrlPath('application'), isRequestMethod(method))


// Fetch data response (GET)

const getHttpGetResponse$ = R.compose(
  R.map(R.prop('body')),
  R.filter(R.has('body')),
  retry(3),
  mergeAll,
  R.filter(requestFilter('GET'))
)


// Post state response (POST)

const getHttpPostResponse$ = R.compose(
  R.map(log),
  retry(3),
  mergeAll,
  R.filter(requestFilter('POST'))
)


// Http requests

const initialApplicationRequest$ = R.map(makeRequestObject('GET', null), rxJust(`${API_URL}/application`))

const makeHttpRequest$ = (...otherRequest$) =>
  merge(
    initialApplicationRequest$,
    ...otherRequest$
  )

export default {
  getHttpGetResponse$,
  getHttpPostResponse$,
  makeHttpRequest$
}
