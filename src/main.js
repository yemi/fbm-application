import {run, Rx} from '@cycle/core'
import {h, makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {hashRouteDriver} from './drivers'
import {log} from './util'
import {API_URL} from './config'
import {identity, adjust, max, min, nth, gte, toString, findIndex, equals, any, map, reduce, merge, concat, append, replace, compose, match, prop, propEq, eqProps, path, assoc, assocPath} from 'ramda'
import {Maybe} from 'ramda-fantasy'

// INTENT

const eventToFieldInput = ev => ({ key: ev.target.id, val: ev.target.value })

const resToState = res => compose(
  assoc('totalSteps', toString(res.body.steps.length)),
  assoc('steps', res.body.steps),
  assoc('loading', false),
  assoc('routes', map(prop('slug'), res.body.steps))
)(defaultState)

const intent = (sources) => ({
  fieldInput$: map(eventToFieldInput, sources.DOM.select('input').events('input')),
  initState$: map(resToState, sources.HTTP.mergeAll()),
  routeChange$: sources.Route,
  postState$: sources.DOM.select('.continue').events('click')
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
    const updatedField = assoc('val', fieldInput.val, field)
    return append(updatedField, fields)
  } else {
    return append(field, fields)
  }
}

const updateFields = fieldInput => step =>
  assoc('fields', reduce(updateField(fieldInput), [], step.fields), step)

const Operations = {
  updateField: fieldInput => state => {
    const updatedSteps = adjust(updateFields(fieldInput), state.currentStep, state.steps)

    return assoc('steps', updatedSteps, state)
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
  const prevStep = max(0, state.currentStep - 1)
  const nextStep = min(state.steps.length - 1, state.currentStep + 1)
  const prevLink = compose(map(prop('slug')), Maybe, nth(prevStep))(state.steps)
  const nextLink = compose(map(prop('slug')), Maybe, nth(nextStep))(state.steps)

  return { prevLink:Maybe.maybe('', identity, prevLink), nextLink:Maybe.maybe('', identity, nextLink) }
}

const renderFields = map(field =>
  h('div', { className: 'field' }, [
    h('div', field.name), h('input', { type: 'text', value: field.val, id: field.key }),
    h('div', field.val)
  ]))

const view = $state => $state
  .startWith(defaultState)
  // .map(log)
  .map(state => {
    const activeStep = path(['steps', state.currentStep], state)
    const fields = Maybe(path(['steps', state.currentStep, 'fields'], state))
    const {prevLink, nextLink} = getLinks(state)
    return (
      h('div', { className: 'container page text-center' }, [
        h('h1', activeStep ? activeStep.title : ''),
        h('div', Maybe.maybe([], renderFields, fields)),
        h('footer', { className: 'navbar navbar-dark navbar-fixed-bottom'}, [
          h('div', { className: 'footer-inner btn-toolbar' }, [
            h('a', { className: 'back btn', href: "#" + prevLink }, 'Back'),
            h('a', { className: 'continue btn btn-success', href: "#" + nextLink }, 'Continue'),
            h('div', { className: 'm-t' }, state.loading ? '' : (state.currentStep + 1) + ' of ' + state.totalSteps),
            state.loading ? h('div', { className: 'alert alert-info pos-f-t m-t-lg' }, 'Loooading') : null
          ])
        ])
      ])
    )
  })

// MAIN

const main = (sources) => {
  const actions = intent(sources)
  const state$ = model(actions)
  return {
    DOM: view(state$),
    HTTP: Rx.Observable.just(API_URL).map(url => ({ url: url, method: 'GET' }))
  }
}

run(main, {
  DOM: makeDOMDriver('#main-container'),
  HTTP: makeHTTPDriver(),
  Route: hashRouteDriver
})
