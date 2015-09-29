import {run, Rx} from '@cycle/core'
import {h, makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {log, fields} from './util'
import {keys, equals, any, map, reduce, merge, concat, append, replace, compose, match, prop, propEq, eqProps, path, assoc, assocPath} from 'ramda'

const API_URL = 'http://private-a4658-helpinghandapplication.apiary-mock.com/'
const ENDPOINT = 'application'

// INTENT

const eventToFieldInput = ev => ({ key: ev.target.id, val: ev.target.value })

const hashChangeToRoute = compose(replace('#', ''), prop('0'), match(/\#[^\#]*$/), prop('newURL'))

const resToState = res => compose(
  assoc('total-steps', keys(res.body.steps).length.toString()),
  assoc('steps', path(['body', 'steps'], res)),
  assoc('loading', false)
)(defaultState)

const intent = (DOM, HTTP, hashChange, initialHash) => ({
  fieldInput$: map(eventToFieldInput, DOM.select('input').events('input')),
  initState$: map(resToState, HTTP.mergeAll()),
  changeRoute$: concat(map(replace('#', ''), initialHash),
                       map(hashChangeToRoute, hashChange))
})

// MODEL

const defaultState = {
  'loading': true,
  'total-steps': null,
  'steps': {}
}

const routes = [
  'company-basics',
  'overview',
  'elevator-pitch'
]

const updateField = fieldInput => (fields, field) => {
  if (eqProps('key', field, fieldInput)) {
    const updatedField = assoc('val', prop('val', fieldInput), field)
    return append(updatedField, fields)
  } else {
    return append(field, fields)
  }
}

const Operations = {
  updateField: fieldInput => state => {
    const fieldsPath = ['steps', prop('current-step', state), 'fields']
    const fields = path(fieldsPath, state)
    return assocPath(fieldsPath, reduce(updateField(fieldInput), [], fields), state)
  },
  setInitState: newState => oldState => {
    return merge(oldState, newState)
  },
  setStep: route => state =>
    any(equals(route), routes) ? assoc('current-step', route, state) : state
}

const model = function (actions) {
  const updateField$ = map(Operations.updateField, actions.fieldInput$)
  const setInitState$ = map(Operations.setInitState, actions.initState$)
  const changeRoute$ = map(Operations.setStep, actions.changeRoute$)
  const allOperations$ = Rx.Observable.merge(setInitState$, updateField$, changeRoute$)

  const state$ = allOperations$
    .scan((state, operation) => operation(state), defaultState)

  return state$
}

// VIEW

const renderFields = fields => {
  if (fields) {
    return fields.map(field =>
      h('div', [
        h('label', field.name), h('input', { type: 'text', value: field.val, id: field.key }),
        h('span', field.val)
      ])
    )
  } else {
    return []
  }
}

const view = $state => $state
  .startWith(defaultState)
  .map(state => {
    const fieldsPath = ['steps', state['current-step'], 'fields']
    return (
      h('div', [
        h('div', renderFields(path(fieldsPath, state))),
        h('footer', [
          h('button', { className: 'back' }, 'Back'),
          h('button', { className: 'continue' }, 'Continue'),
          h('span', state['total-steps']),
          state.loading ? h('div', 'Loooading') : null
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
