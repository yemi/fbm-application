import {Rx} from '@cycle/core'
import {API_URL} from '../config'
import {log, makeRequestObject} from '../utils'
import {has, compose, filter, propEq, prop, map, both} from 'ramda'
import {mergeAll, merge, retry, rxJust} from '../helpers'

// Helpers

const isRequestUrlPath = path => compose(propEq('url', `${API_URL}/${path}`), prop('request'))

const isRequestMethod = method => compose(propEq('method', method), prop('request'))

const requestFilter = method => both(isRequestUrlPath('application'), isRequestMethod(method))


// Fetch data response (GET)

const getFetchDataResponse$ = compose(
  map(prop('body')),
  filter(has('body')),
  retry(3),
  mergeAll,
  filter(requestFilter('GET'))
)


// Post state response (POST)

const getPostStateResponse$ = compose(
  map(log),
  retry(3),
  mergeAll,
  filter(requestFilter('POST'))
)


// Http requests

const initialApplicationRequest$ = map(makeRequestObject('GET', null), rxJust(`${API_URL}/application`))

const makeHttpRequest$ = (...otherRequest$) =>
  merge(
    initialApplicationRequest$,
    ...otherRequest$
  )

export default {
  getFetchDataResponse$,
  getPostStateResponse$,
  makeHttpRequest$
}
