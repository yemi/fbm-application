import {Rx} from '@cycle/core'
import R from 'ramda'

export default {
  mergeAll: m => m instanceof Rx.Observable ? m.mergeAll() : R.mergeAll(m),

  merge: (m, ...n) => m instanceof Rx.Observable ? Rx.Observable.merge(m, ...n) : R.merge(m, n[0]),

  fromEvent: (event, selector) => Rx.Observable.fromEvent(selector, event),

  withLatestFrom: (f, observableA, observableB) => observableA.withLatestFrom(observableB, f),

  scan: R.curry((f, a, m) => m instanceof Rx.Observable ? m.scan(f, a) : R.scan(f, a, m)),

  share: observable => observable.share(),

  head: m => m instanceof Rx.Observable ? m.first() : R.head(m),

  rxJust: a => Rx.Observable.just(a)
}
