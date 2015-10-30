import {reduce, not, isEmpty, has, filter, view, set, lensProp, lensIndex, always, pick, adjust, findIndex, equals, any, none, and, map, append, compose, prop, propEq, eqProps} from 'ramda'
import {run, Rx} from '@cycle/core'
import {log, log_, lenses, mergeStateWithSourceData} from '../utils'
import {API_URL} from '../config'
import {head, withLatestFrom, scan, shareReplay, merge} from '../helpers'

const defaultState = {
  loading: true,
  activeStep: 0,
  canContinue: false,
  totalSteps: null,
  steps: [],
  routes: [],
  postErrors: []
}

const makeUpdate$ = (actions, responses, proxies, route$, localStorageSource$) => {

  // Convenience streams

  const nonEmptyLocalStorage$ = filter(has('steps'), localStorageSource$)
  const sourceData$ = head(merge(responses.fetchDataResponse$, nonEmptyLocalStorage$))

  // Update functions

  const updateAndValidateFields$ = map(({value, fieldIndex, fieldGroupIndex, errorMessage}) => state => {
    const fieldsLens = lenses.fields(state.activeStep, fieldGroupIndex)
    const fields = view(fieldsLens, state)
    const updateField = field => ({ ...field, value, errorMessage })
    const updatedFields = adjust(updateField, fieldIndex, fields)
    const updatedFieldsState = set(fieldsLens, updatedFields, state)
    const fieldsContainErrors = compose(none(compose(isEmpty, prop('errorMessage'))), filter(has('errorMessage')))
    const requiredFieldsHaveValue = compose(none(compose(isEmpty, prop('value'))), filter(propEq('required', true)))
    const canContinue = and(requiredFieldsHaveValue(updatedFields), not(fieldsContainErrors(updatedFields)))
    const newState = { ...updatedFieldsState, canContinue }
    return newState
  }, actions.inputFieldEdit$)

  const setInitState$ = map(sourceData => state => {
    const newState = mergeStateWithSourceData(state, sourceData)
    return newState
  }, sourceData$)

  const setActiveStep$ = map(route => state => {
    if (any(equals(route), state.routes)) {
      const newStep = findIndex(propEq('slug', route), state.steps)
      const newState = { ...state, activeStep: newStep }
      return newState
    } else {
      return state
    }
  }, route$)

  const makeOnSubmit$ = proxies => map(() => state => {
    if (state.canContinue) {
      proxies.postStateRequest$.onNext({
        url: `${API_URL}/application`,
        method: 'POST',
        send: map(pick(['slug', 'fields']), state.steps)
      })
      const newState = { ...state, loading: true, postErrors: [] }
      return newState
    } else {
      return state
    }
  }, actions.submit$)

  const onPostStateResponse$ = map(({err, success}) => state => {
    const errs = [{ id: 'company-name', errMsg: 'Your company type should be aBBa' }]
    if (errs) {
      // const fieldsLens = lenses.fields(state.activeStep)
      // const fields = view(fieldsLens, state)
      return { ...state, postErrors: errs, loading: false }
    }
    return { ...state, loading: false }
  }, responses.postStateResponse$)

  // Combiners

  const setInitStateAndStep = (setInitState, setActiveStep) => compose(setActiveStep, setInitState)
  const initApp$ = withLatestFrom(setInitStateAndStep, setInitState$, setActiveStep$)

  // Merge all update functions

  return merge(
    initApp$,
    updateAndValidateFields$,
    setActiveStep$,
    makeOnSubmit$(proxies),
    onPostStateResponse$
  )
}

const model = (actions, responses, proxies, route$, localStorageSource$) => {
  const update$ = makeUpdate$(actions, responses, proxies, route$, localStorageSource$)
  const stateFold = (state, update) => update(state)
  const state$ = scan(stateFold, defaultState, update$)
  const stateHasSteps = compose(not, isEmpty, prop('steps'))
  return filter(stateHasSteps, state$)
}

export default {model}
