import {has, filter, view, set, lensProp, lensIndex, always, pick, adjust, findIndex, equals, any, map, append, compose, prop, propEq, eqProps} from 'ramda'
import {run, Rx} from '@cycle/core'
import {log, mergeStateWithSourceData} from '../../util'
import {API_URL} from '../../config'
import {head, withLatestFrom, scan, share, merge} from '../../helpers'

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

const Operations = {
  updateField: fieldInput => state => {
    const fieldsLens = lenses.fields(state.currentStep)
    const fields = view(fieldsLens, state)
    const fieldIndex = findIndex(propEq('key', fieldInput.key), fields)
    const updateField = field => ({ ...field, val: fieldInput.val })
    const updatedFields = adjust(updateField, fieldIndex, fields)
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
  const sourceData$ = head(merge(responses.fetchDataResponse$, nonEmptyLocalStorage$))

  // Operations
  const updateField$ = map(Operations.updateField, actions.fieldInput$)
  const postState$ = map(Operations.postState(proxies), actions.postState$)
  const setCurrentStep$ = map(Operations.setCurrentStep, route$)
  const onPostStateResponse$ = map(Operations.onPostStateResponse, responses.postStateResponse$)
  const onSourceData$ = map(Operations.onSourceData, sourceData$)

  // Combiners
  const setInitStateAndStep = (onSourceData, setCurrentStep) => compose(setCurrentStep, onSourceData)
  const initApp$ = withLatestFrom(setInitStateAndStep, onSourceData$, setCurrentStep$)

  // All operations
  const allOperations$ = merge(
    initApp$,
    updateField$,
    setCurrentStep$,
    postState$,
    onPostStateResponse$
  )

  const stateFold = (state, operation) => operation(state)
  const accumulateState = compose(share, scan(stateFold, defaultState))
  const state$ = accumulateState(allOperations$)

  return state$
}

export default {defaultState, model}
