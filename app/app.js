import {run, Rx} from '@cycle/core'
import {makeDOMDriver, h} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {hashRouteDriver, makeLocalStorageDriver} from './drivers'
import {makeHistoryDriver} from '@cycle/history'
import main from './Main'

run(main, {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver(),
  LocalStorage: makeLocalStorageDriver('fbm-application'),
  History: makeHistoryDriver({
    hash: true
  })
})
