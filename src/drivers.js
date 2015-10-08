import {Rx} from '@cycle/core'
import {compose, replace, prop, nth, map, match} from 'ramda'
import {rxJust, fromEvent} from './helpers'

const hashChangeToRoute = compose(replace('#', ''), nth(0), match(/\#[^\#]*$/), prop('newURL'))
const windowToRoute = compose(replace('#', ''), prop('hash'), prop('location'))

const hashRouteDriver = () =>
  Rx.Observable.merge(map(windowToRoute, rxJust(window)),
                      map(hashChangeToRoute, fromEvent('hashchange', window)))

const makeLocalStorageDriver = key => payload$ => {
  payload$.subscribe(payload => {
    localStorage.setItem(key, JSON.stringify(payload))
  })

  return rxJust(JSON.parse(localStorage.getItem(key)) || {})
}

export default {hashRouteDriver, makeLocalStorageDriver}
