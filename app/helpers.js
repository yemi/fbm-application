import R from 'ramda'
import Rx from 'rx' 

const combineLatest = Rx.Observable.combineLatest

const concat = R.curry((m, n) => m.concat(n))

const flatMapLatest = R.curry((f, m) => m.flatMapLatest(f))

const fromEvent = (event, selector) => Rx.Observable.fromEvent(selector, event)

const head = m => m.first()

const mapIndexed = R.curry((f, m) => m.map(f))

const merge = (m, ...n) => Rx.Observable.merge(m, ...n)

const mergeAll = m => m.mergeAll()

const retry = R.curry((num, observable) => observable.retry(num))

const rxJust = a => Rx.Observable.just(a)
  
const sample = R.curry((a, b) => a.sample(b))

const scan = R.curry((f, a, m) => m.scan(f, a))

const shareReplay = R.curry((num, observable) => observable.shareReplay(num))

const skip = R.curry((num, observable) => observable.skip(num))

const withLatestFrom = R.curry((f, observableA, observableB) => observableA.withLatestFrom(observableB, f))

module.exports = {
  combineLatest,
  concat,
  flatMapLatest,
  fromEvent,
  head,
  mapIndexed,
  merge,
  mergeAll,
  retry,
  rxJust,
  sample,
  scan,
  shareReplay,
  skip,
  withLatestFrom
}
