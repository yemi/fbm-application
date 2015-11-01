import {Rx} from '@cycle/core'
import {rxJust} from './helpers'

const makeLocalStorageDriver = key => payload$ => {
  payload$.subscribe(payload => {
    localStorage.setItem(key, JSON.stringify(payload))
  })
  return rxJust(JSON.parse(localStorage.getItem(key)) || {})
}

export default {makeLocalStorageDriver}
