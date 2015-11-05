import {run} from '@cycle/core'
import {makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {makeHistoryDriver} from '@cycle/history'
import {makeLocalStorageDriver} from './drivers'
import main from './Main'

run(main, {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver(),
  LocalStorage: makeLocalStorageDriver('fbm-application'),
  History: makeHistoryDriver({
    hash: true
  })
})
