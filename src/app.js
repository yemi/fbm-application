import {run, Rx} from '@cycle/core'
import {makeDOMDriver, h} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {hashRouteDriver, makeLocalStorageDriver} from './drivers'
import main from './Component/Main'


run(main, {
  DOM: makeDOMDriver('#main-container'),
  HTTP: makeHTTPDriver(),
  LocalStorage: makeLocalStorageDriver('fbm-application'),
  Route: hashRouteDriver
})
