import {replace, not, isEmpty, has, filter, view, set, lensProp, lensIndex, always, pick, adjust, findIndex, equals, any, none, and, map, append, compose, prop, propEq, eqProps} from 'ramda'
import {run, Rx} from '@cycle/core'
import switchPath from 'switch-path'
import routes from './routes'
import {toUrl, log, log_, lenses, mergeStateWithSourceData} from '../utils'
import {API_URL} from '../config'
import {head, withLatestFrom, scan, shareReplay, merge} from '../helpers'

const defaultState = {
  loading: true,
  activeStep: 0,
  activeRoute: {
    type: 'step',
    key: 0
  },
  canContinue: false,
  totalSteps: null,
  steps: [],
  routes,
  postErrors: []
}

const makeUpdate$ = (actions, responses, proxies, History, localStorageSource$) => {

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

  const handleRoute$ = map(location => state => {
    const {value} = switchPath(location.pathname, state.routes)
    const activeRoute = value
    const activeStep = value.type === 'step' ? value.key : state.activeStep
    const newState = { ...state, activeStep, activeRoute }
    return newState
  }, History)

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

  const onPostStateResponse$ = map(res => state => {
    // const errs = [{ id: 'company-name', errMsg: 'Your company type should be aBBa' }]
    // if (err) {
    //   return { ...state, postErrors: errs, loading: false }
    // }
    // proxies.change
    return { ...state, loading: false }
  }, responses.postStateResponse$)

  // Combiners

  const setInitStateAndStep = (setInitState, handleRoute) => compose(handleRoute, setInitState)
  const initApp$ = withLatestFrom(setInitStateAndStep, setInitState$, handleRoute$)

  // Merge all update functions

  return merge(
    initApp$,
    updateAndValidateFields$,
    handleRoute$,
    makeOnSubmit$(proxies),
    onPostStateResponse$
  )
}

const model = (actions, responses, proxies, History, localStorageSource$) => {
  const update$ = makeUpdate$(actions, responses, proxies, History, localStorageSource$)
  const stateFold = (state, update) => update(state)
  const state$ = scan(stateFold, defaultState, update$)
  const stateHasSteps = compose(not, isEmpty, prop('steps'))
  return filter(stateHasSteps, state$)
}

export default {model}
