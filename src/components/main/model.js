import {has, filter, view, set, lensProp, lensIndex, always, pick, adjust, findIndex, equals, any, map, reduce, merge, append, compose, prop, propEq, eqProps} from 'ramda'
import {run, Rx} from '@cycle/core'
import {log, mergeStateWithSourceData} from '../../util'
import {API_URL} from '../../config'

const defaultState = {
  loading: true,
  currentStep: 0,
  totalSteps: null,
  steps: [],
  routes: []
}

const lenses = ({
  fields: currentStep => compose(lensProp('steps'), lensIndex(currentStep), lensProp('fields'))
})

const updateFieldFold = fieldInput => (fields, field) => {
  if (eqProps('key', field, fieldInput)) {
    return append({ ...field, val: fieldInput.val }, fields)
  } else {
    return append(field, fields)
  }
}

const Operations = {
  updateField: fieldInput => state => {
    const fieldsLens = lenses.fields(state.currentStep)
    const fields = view(fieldsLens, state)
    const updatedFields = reduce(updateFieldFold(fieldInput), [], fields)
    const newState = set(fieldsLens, updatedFields, state)

    return newState
  },

  onSourceData: sourceData => state => {
    const newState = mergeStateWithSourceData(state, sourceData)

    return newState
  },

  setCurrentStep: route => state => {
    if (any(equals(route), state.routes)) {
      const newStep = findIndex(propEq('slug', route), state.steps)
      const newState = { ...state, currentStep: newStep }

      return newState
    } else {
      return state
    }
  },

  postState: proxies => () => state => {
    proxies.postStateRequest$.onNext({
      url: `${API_URL}/application`,
      method: 'POST',
      send: map(pick(['slug', 'fields']), state.steps)
    })

    const newState = { ...state, loading: true }

    return newState
  },

  onPostStateResponse: ({err, success}) => state => {
    const errs = [{ key: 'company-type', errMsg: 'Your company type should be ABBA'}]
    if (err) {
      // const fieldsLens = lenses.fields(state.currentStep)
      // const fields = view(fieldsLens, state)
      // const updatedFields = reduce((fields, field) =>
      //
      // , [], fields)
      return state
    }
    return { ...state, loading: false }
  }
}

const model = (actions, responses, proxies, route$, localStorage$) => {

  // Convenience
  const nonEmptyLocalStorage$ = filter(has('steps'), localStorage$)
  const sourceData$ = Rx.Observable.merge(responses.fetchDataResponse$, nonEmptyLocalStorage$).first()

  // Operations
  const updateField$ = map(Operations.updateField, actions.fieldInput$)
  const postState$ = map(Operations.postState(proxies), actions.postState$)
  const setCurrentStep$ = map(Operations.setCurrentStep, route$)
  const onPostStateResponse$ = map(Operations.onPostStateResponse, responses.postStateResponse$)
  const onSourceData$ = map(Operations.onSourceData, sourceData$)

  // Combiners
  const initApp$ = onSourceData$.withLatestFrom(setCurrentStep$,
    (onSourceData, setCurrentStep) => compose(setCurrentStep, onSourceData))

  // All operations
  const allOperations$ = Rx.Observable.merge(
    initApp$,
    updateField$,
    setCurrentStep$,
    postState$,
    onPostStateResponse$
  )

  // Accumulated state
  const state$ = allOperations$
    .scan((state, operation) => operation(state), defaultState)
    .share()

  return state$
}

export default {defaultState, model}
