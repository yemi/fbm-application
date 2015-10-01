import {identity, adjust, max, min, nth, gte, toString, findIndex, equals, any, map, reduce, merge, concat, append, replace, compose, match, prop, propEq, eqProps, path, assoc, assocPath} from 'ramda'
import {run, Rx} from '@cycle/core'

const defaultState = {
  loading: true,
  currentStep: 0,
  totalSteps: null,
  steps: [],
  routes: []
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

export default {defaultState, model}
