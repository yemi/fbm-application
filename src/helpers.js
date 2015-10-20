import {Rx} from '@cycle/core'
import R from 'ramda'

export default {
  combineLatest: Rx.Observable.combineLatest,

  concat: R.curry((m, n) => m instanceof Rx.Observable ? m.concat(n) : R.concat(m, n)),

  fromEvent: (event, selector) => Rx.Observable.fromEvent(selector, event),

  head: m => m instanceof Rx.Observable ? m.first() : R.head(m),

  mergeAll: m => m instanceof Rx.Observable ? m.mergeAll() : R.mergeAll(m),

  merge: (m, ...n) => m instanceof Rx.Observable ? Rx.Observable.merge(m, ...n) : R.merge(m, n[0]),

  scan: R.curry((f, a, m) => m instanceof Rx.Observable ? m.scan(f, a) : R.scan(f, a, m)),

  shareReplay: num => observable => observable.shareReplay(1),

  retry: num => observable => observable.retry(num),

  rxJust: a => Rx.Observable.just(a),

  withLatestFrom: (f, observableA, observableB) => observableA.withLatestFrom(observableB, f)
}
