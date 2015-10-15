import {run} from '@cycle/core'
import {makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {hashRouteDriver, makeLocalStorageDriver} from './drivers'
import main from './Component/Main'
import Field from './Component/Field'

run(main, {
  DOM: makeDOMDriver('#main-container', {
    'field': Field
  }),
  HTTP: makeHTTPDriver(),
  LocalStorage: makeLocalStorageDriver('fbm-application'),
  Route: hashRouteDriver
})
