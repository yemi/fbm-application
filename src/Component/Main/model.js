import {reduce, not, isEmpty, has, filter, view, set, lensProp, lensIndex, always, pick, adjust, findIndex, equals, any, map, append, compose, prop, propEq, eqProps} from 'ramda'
import {run, Rx} from '@cycle/core'
import {log, lenses, mergeStateWithSourceData} from '../../utils'
import {API_URL} from '../../config'
import {head, withLatestFrom, scan, shareReplay, merge} from '../../helpers'

const defaultState = {
  loading: true,
  activeStep: 0,
  canContinue: false,
  totalSteps: null,
  steps: [],
  routes: []
}

const updateFieldWithFieldInput = (fieldInput, fields) => {
  const updatedFieldIndex = findIndex(propEq('key', fieldInput.key), fields)
  const updateField = field => ({ ...field, value: fieldInput.value })
  const updatedFields = adjust(updateField, updatedFieldIndex, fields)
  return updatedFields
}

const validateFieldFold = ({fields, hasValidationErrors}, field) => {
  if (field.required && !field.value) {
    return {
      fields: append({ ...field, errMsg: 'Field is required' }, fields),
      hasValidationErrors: true
    }
  } else {
    return {
      fields: append({ ...field, errMsg: '' }, fields),
      hasValidationErrors: hasValidationErrors
    }
  }
}

const validateFields = fields => reduce(
    validateFieldFold, { fields:[], hasValidationErrors:false }, fields)

const Operations = {

  updateAndValidateFields: fieldInput => state => {
    // const fieldsLens = lenses(state.activeStep).fields
    // const fields = view(fieldsLens, state)
    // const updatedFields = updateFieldWithFieldInput(fieldInput, fields)
    // const validatedFields = validateFields(updatedFields)
    // const validatedState = set(fieldsLens, validatedFields.fields, state)
    // const newState = { ...validatedState, canContinue: not(validatedFields.hasValidationErrors) }
    // return newState
    console.log(fieldInput)
    return state
  },

  setInitState: sourceData => state => {
    const newState = mergeStateWithSourceData(state, sourceData)
    return newState
  },

  setActiveStep: route => state => {
    if (any(equals(route), state.routes)) {
      const newStep = findIndex(propEq('slug', route), state.steps)
      const newState = { ...state, activeStep: newStep }
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
      // const fieldsLens = lenses.fields(state.activeStep)
      // const fields = view(fieldsLens, state)
      // const updatedFields = reduce((fields, field) =>
      //
      // , [], fields)
      return state
    }
    return { ...state, loading: false }
  }
}

const model = (actions, responses, proxies, route$, localStorageSource$) => {

  // Convenience
  const nonEmptyLocalStorage$ = filter(has('steps'), localStorageSource$)
  const sourceData$ = head(merge(responses.fetchDataResponse$, nonEmptyLocalStorage$))

  // Operations
  const updateAndValidateFields$ = map(Operations.updateAndValidateFields, actions.fieldChange$)
  const postState$ = map(Operations.postState(proxies), actions.postState$)
  const setActiveStep$ = map(Operations.setActiveStep, route$)
  const onPostStateResponse$ = map(Operations.onPostStateResponse, responses.postStateResponse$)
  const setInitState$ = map(Operations.setInitState, sourceData$)

  // Combiners
  const setInitStateAndStep = (setInitState, setActiveStep) => compose(setActiveStep, setInitState)
  const initApp$ = withLatestFrom(setInitStateAndStep, setInitState$, setActiveStep$)

  // All operations
  const allOperations$ = merge(
    initApp$,
    updateAndValidateFields$,
    setActiveStep$,
    postState$,
    onPostStateResponse$
  )

  const stateFold = (state, operation) => operation(state)
  const accumulateState = compose(shareReplay(1), scan(stateFold, defaultState))
  const state$ = accumulateState(allOperations$)
  const stateHasSteps = compose(not, isEmpty, prop('steps'))

  return filter(stateHasSteps, state$)
}

export default {defaultState, model}
