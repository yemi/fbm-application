import {Rx} from '@cycle/core'
import {compose, replace, prop, nth, map, match} from 'ramda'

const hashChangeToRoute = compose(replace('#', ''), nth(0), match(/\#[^\#]*$/), prop('newURL'))
const windowToRoute = compose(replace('#', ''), prop('hash'), prop('location'))

const hashRouteDriver = () =>
  Rx.Observable.merge(map(windowToRoute, Rx.Observable.just(window)),
                      map(hashChangeToRoute, Rx.Observable.fromEvent(window, 'hashchange')))

const makeLocalStorageDriver = key => payload$ => {
  payload$.subscribe(payload => {
    localStorage.setItem(key, JSON.stringify(payload))
  })

  return Rx.Observable.just(JSON.parse(localStorage.getItem(key)) || {})
}

export default {hashRouteDriver, makeLocalStorageDriver}
