import {run, Rx} from '@cycle/core'
import {h, makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {log} from './util'
import {gte, toString, findIndex, equals, any, map, reduce, merge, concat, append, replace, compose, match, prop, propEq, eqProps, path, assoc, assocPath} from 'ramda'
import {Maybe} from 'ramda-fantasy'

const API_URL = 'http://private-a4658-helpinghandapplication.apiary-mock.com/'
const ENDPOINT = 'application'

// INTENT

const eventToFieldInput = ev => ({ key: ev.target.id, val: ev.target.value })

const hashChangeToRoute = compose(replace('#', ''), prop(0), match(/\#[^\#]*$/), prop('newURL'))

const resToState = res => compose(
  assoc('totalSteps', toString(res.body.steps.length)),
  assoc('steps', res.body.steps),
  assoc('loading', false),
  assoc('routes', map(prop('slug'), res.body.steps))
)(defaultState)

const intent = (DOM, HTTP, hashChange, initialHash) => ({
  fieldInput$: map(eventToFieldInput, DOM.select('input').events('input')),
  initState$: map(resToState, HTTP.mergeAll()),
  routeChange$: concat(map(replace('#', ''), initialHash),
                       map(hashChangeToRoute, hashChange)),
  postState$: DOM.select('.continue').events('click')
})

// MODEL

const defaultState = {
  'loading': true,
  'totalSteps': null,
  'steps': [],
  'routes': []
}

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
    const fieldsPath = ['steps', state.currentStep, 'fields']
    const fields = path(fieldsPath, state)
    return assocPath(fieldsPath, reduce(updateField(fieldInput), [], fields), state)
  },

  setInitState: newState => oldState => merge(oldState, newState),

  setCurrentStep: route => state => {
    if (any(equals(route), state.routes)) {
      const step = findIndex(propEq('slug', route), state.steps)
      return assoc('currentStep', step, state)
    } else {
      return state
    }
  },

  postState: () => state =>
    // compose()(state.steps)
    state
}

const model = function (actions) {
  const updateField$ = map(Operations.updateField, actions.fieldInput$)
  const setInitState$ = map(Operations.setInitState, actions.initState$)
  const routeChange$ = map(Operations.setCurrentStep, actions.routeChange$)
  const initApp$ = setInitState$.withLatestFrom(routeChange$,
    (setInitState, routeChange) => compose(routeChange, setInitState))
  const postState$ = map(Operations.postState, actions.postState$)

  const allOperations$ = Rx.Observable
    .merge(updateField$, initApp$, routeChange$, postState$)

  const state$ = allOperations$
    .scan((state, operation) => operation(state), defaultState)

  return state$
}

// VIEW

const getLinks = state => {
  // const prevStep = max(0, state.currentStep - 1)
  // const nextStep = min(state.steps.length - 1, state.currentStep + 1)
  // const prevLink = compose(map(prop('slug')), Maybe, nth(prevStep))(state.steps)
  // const nextLink = compose(map(prop('slug')), Maybe, nth(nextStep))(state.steps)

  // [{slug: 'company-basics'}, {slug: 'overview'}, {slug:'elevator-pitch'}]

  const {cds, prevLink} = reduce(({prevStep,prevSlug}, step) => {
    console.log(prevStep, prevSlug)
    if (gte(prevStep, state.currentStep)) {
      return { prevStep, prevSlug }
    } else {
      return { prevStep:++prevStep, prevSlug:step.slug }
    }
  }, { prevStep:-1, slug:'' }, state.steps)

  console.log(prevLink)

  return { prevLink:prevLink }
}

const renderFields = map(field =>
  h('div', [
    h('label', field.name), h('input', { type: 'text', value: field.val, id: field.key }),
    h('span', field.val)
  ]))

const view = $state => $state
  .startWith(defaultState)
  // .map(log)
  .map(state => {
    const fieldsPath = ['steps', state.currentStep, 'fields']
    const fields = Maybe(path(fieldsPath, state))
    const {prevLink} = getLinks(state)
    return (
      h('div', [
        h('div', Maybe.maybe([], renderFields, fields)),
        h('footer', [
          h('button', { className: 'back', href: "#"}, 'Back'),
          h('button', { className: 'continue' }, 'Continue'),
          h('span', state['totalSteps']),
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
