import {Rx} from '@cycle/core'
import intent from './intent'
import view from './view'
import {model} from './model'
import {API_URL} from '../../config'

const main = (sources) => {
  const actions = intent(sources)
  const state$ = model(actions)
  return {
    DOM: view(state$),
    HTTP: Rx.Observable.just(API_URL).map(url => ({ url: url, method: 'GET' }))
  }
}

export default main
