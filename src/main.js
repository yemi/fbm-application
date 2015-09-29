import {run, Rx} from '@cycle/core'
import {h, makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {log, fields} from './util'
import {fromJS, toJS, Map, List} from 'immutable'
import {map, concat, replace, compose, match, prop} from 'ramda'

const API_URL = 'http://private-a4658-helpinghandapplication.apiary-mock.com/'
const ENDPOINT = 'application'

// INTENT

const eventToFieldInput = ev => Map({ key: ev.target.id, val: ev.target.value })

const hashChangeToRoute = compose(replace('#', ''), prop('0'), match(/\#[^\#]*$/), prop('newURL'))

const resToState = res => defaultState
  .set('steps', fromJS(res.body.steps))
  .set('total-steps', res.body['total-steps'].toString())

const intent = (DOM, HTTP, hashChange, initialHash) => ({
  fieldInput$: map(eventToFieldInput, DOM.select('input').events('input')),
  initState$: map(resToState, HTTP.mergeAll()),
  changeRoute$: concat(map(replace('#', ''), initialHash),
                       map(hashChangeToRoute, hashChange))
})

// MODEL

const defaultState = fromJS({
  'current-step': 'company-basics',
  'total-steps': null,
  'steps': {}
})

const routes = [
  'company-basics',
  'overview',
  'elevator-pitch'
]

const updateField = fieldInput => (fields, field) => {
  if (field.get('key') === fieldInput.get('key')) {
    return fields.push(field.set('val', fieldInput.get('val')))
  } else {
    return fields.push(field)
  }
}

const setStep = (state, route) =>
  routes.some(r => r === route) ? state.set('current-step', route) : state

const Operations = {
  updateField: fieldInput => state => {
    const fieldsPath = ['steps', state.get('current-step'), 'fields']
    return state.setIn(fieldsPath, state.getIn(fieldsPath).reduce(updateField(fieldInput), List()))
  },
  setInitState: state => () => state
}

const model = function (actions) {
  const updateField$ = actions.fieldInput$.map(Operations.updateField)
  const setInitState$ = actions.initState$.map(Operations.setInitState)
  const allOperations$ = Rx.Observable.merge(updateField$, setInitState$)

  const route$ = Rx.Observable.just('/').merge(actions.changeRoute$)

  const state$ = allOperations$
    .scan((state, operation) => operation(state), defaultState)
    .combineLatest(route$, setStep)

  return state$
}

// VIEW

const renderFields = fields => {
  if (fields) {
    return fields.map(field =>
      h('div', [
        h('label', field.get('name')), h('input', { type: 'text', 'id': field.get('key') }),
        h('span', field.get('val'))
      ])
    ).toJS()
  } else {
    return []
  }
}

const view = $state => $state
  .startWith(defaultState)
  .map(state => {
    const fieldsPath = ['steps', state.get('current-step'), 'fields']
    return (
      h('div', [
        h('div', renderFields(state.getIn(fieldsPath))),
        h('footer', [
          h('button', { className: 'back' }, 'Back'),
          h('button', { className: 'continue' }, 'Save'),
          h('span', state.get('total-steps'))
        ])
      ])
    )
  })

// MAIN

const main = ({DOM, HTTP, initialHash, hashChange}) => {
  const actions = intent(DOM, HTTP, hashChange, initialHash)
  const state$ = model(actions)
  return {
    DOM: view(state$),
    HTTP: Rx.Observable.just(API_URL + ENDPOINT).map(url => ({ url: url, method: 'GET' }))
  }
}

run(main, {
  DOM: makeDOMDriver('#main-container'),
  HTTP: makeHTTPDriver(),
  initialHash: () => Rx.Observable.just(window.location.hash),
  hashChange: () => Rx.Observable.fromEvent(window, 'hashchange')
})
