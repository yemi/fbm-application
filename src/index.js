import {run} from '@cycle/core'
import {makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {hashRouteDriver, makeLocalStorageDriver} from './drivers'
import main from './components/main'

run(main, {
  DOM: makeDOMDriver('#main-container'),
  HTTP: makeHTTPDriver(),
  LocalStorage: makeLocalStorageDriver('fbm-application'),
  Route: hashRouteDriver
})
