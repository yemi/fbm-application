import {Rx} from '@cycle/core'
import H from './helpers'

const makeLocalStorageDriver = key => payload$ => {
  payload$.subscribe(payload => {
    localStorage.setItem(key, JSON.stringify(payload))
  })
  return H.rxJust(JSON.parse(localStorage.getItem(key)) || {})
}

export default {makeLocalStorageDriver}
