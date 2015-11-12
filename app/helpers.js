import Rx from 'rx' 
import R from 'ramda'

export default {
  combineLatest: Rx.Observable.combineLatest,

  concat: R.curry((m, n) => m instanceof Rx.Observable ? m.concat(n) : R.concat(m, n)),

  flatMapLatest: R.curry((f, m) => m.flatMapLatest(f)),

  fromEvent: (event, selector) => Rx.Observable.fromEvent(selector, event),

  head: m => m instanceof Rx.Observable ? m.first() : R.head(m),

  mapIndexed: R.curry((f, m) => m.map(f)),

  merge: (m, ...n) => m instanceof Rx.Observable || m instanceof Array ? Rx.Observable.merge(m, ...n) : R.merge(m, n[0]),

  mergeAll: m => m instanceof Rx.Observable ? m.mergeAll() : R.mergeAll(m),

  retry: num => observable => observable.retry(num),

  rxJust: a => Rx.Observable.just(a),
  
  sample: R.curry((a, b) => a.sample(b)),

  scan: R.curry((f, a, m) => m instanceof Rx.Observable ? m.scan(f, a) : R.scan(f, a, m)),

  shareReplay: num => observable => observable.shareReplay(1),

  skip: R.curry((num, observable) => observable.skip(1)),

  withLatestFrom: R.curry((f, observableA, observableB) => observableA.withLatestFrom(observableB, f))
}
