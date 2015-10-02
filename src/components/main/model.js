import {pick, adjust, findIndex, equals, any, map, reduce, merge, append, compose, prop, propEq, eqProps} from 'ramda'
import {run, Rx} from '@cycle/core'
import {log} from '../../util'

const defaultState = {
  loading: true,
  currentStep: 0,
  totalSteps: null,
  steps: [],
  routes: []
}

const updateField = fieldInput => (fields, field) => {
  if (eqProps('key', field, fieldInput)) {
    return append({ ...field, val: fieldInput.val }, fields)
  } else {
    return append(field, fields)
  }
}

const updateFields = fieldInput => step =>
  ({ ...step, fields: reduce(updateField(fieldInput), [], step.fields) })

const Operations = {
  updateField: fieldInput => state => {
    const updatedSteps = adjust(updateFields(fieldInput), state.currentStep, state.steps)

    return { ...state, steps: updatedSteps }
  },

  setInitState: res => oldState => ({
    ...oldState,
    totalSteps: res.steps.length,
    steps: res.steps,
    loading: false,
    routes: map(prop('slug'), res.steps)
  }),

  setCurrentStep: route => state => {
    if (any(equals(route), state.routes)) {
      const newStep = findIndex(propEq('slug', route), state.steps)

      return { ...state, currentStep: newStep }
    } else {
      return state
    }
  },

  postState: () => state => {
    console.log(map(pick(['slug', 'fields']), state.steps))

    return state
  }
}

const model = function (mainHTTPresponse$, route$, actions) {
  const updateField$ = map(Operations.updateField, actions.fieldInput$)
  const setInitState$ = map(Operations.setInitState, mainHTTPresponse$)
  const setCurrentStep$ = map(Operations.setCurrentStep, route$)
  const postState$ = map(Operations.postState, actions.postState$)
  const initApp$ = setInitState$.withLatestFrom(setCurrentStep$,
    (setInitState, setCurrentStep) => compose(setCurrentStep, setInitState))

  const allOperations$ = Rx.Observable.merge(updateField$, initApp$, setCurrentStep$, postState$)

  const state$ = allOperations$
    .scan((state, operation) => operation(state), defaultState)

  return state$
}

export default {defaultState, model}
