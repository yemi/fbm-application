import {replace, assoc, dissoc, not, isEmpty, has, filter, view, set, pick, adjust, none, and, map, compose, prop, propEq} from 'ramda'
import {run, Rx} from '@cycle/core'
import {slash, log, log_, lenses, mergeStateWithSourceData} from '../utils'
import {API_URL} from '../config'
import {concat, head, withLatestFrom, scan, shareReplay, merge} from '../helpers'

const defaultState = {
  loading: true,
  activeStep: 0,
  activeRoute: '',
  canContinue: false,
  pages: {},
  totalSteps: null,
  fieldsErrors: {}
}

const makeUpdate$ = (actions, responses, proxies, History, localStorageSource$) => {

  // Convenience streams

  const nonEmptyLocalStorage$ = filter(has('pages'), localStorageSource$)
  const sourceData$ = head(merge(responses.fetchDataResponse$, nonEmptyLocalStorage$))

  // Update functions

  const updateFieldAndErrorCheck$ = map(({value, fieldIndex, fieldGroupIndex, errorMessage, id}) => state => {
    const fieldsErrors = errorMessage ? assoc(id, errorMessage, state.fieldErrors) : dissoc(id, state.fieldErrors)
    const fieldsLens = lenses.fields(state.activeRoute, fieldGroupIndex)
    const fields = view(fieldsLens, state)
    const updateField = field => ({ ...field, value, errorMessage })
    const updatedFields = adjust(updateField, fieldIndex, fields)
    const updatedFieldsState = set(fieldsLens, updatedFields, state)
    const newState = { ...updatedFieldsState, canContinue: isEmpty(fieldsErrors) }
    return newState
  }, actions.inputFieldEdit$)

  const setInitState$ = map(sourceData => state => {
    const newState = mergeStateWithSourceData(state, sourceData)
    return newState
  }, sourceData$)

  const handleRoute$ = map(location => state => {
    const pathSegment = replace('/', '', location.pathname)
    const activeRoute = pathSegment ? pathSegment : 'company-basics'
    const activePage = prop(activeRoute, state.pages)
    const activeStep = activePage.type === 'step' ? activePage.index : state.activeStep
    const newState = { ...state, activeStep, activeRoute }
    return newState
  }, History)

  const makeOnSubmit$ = proxies => map(() => state => {
    if (state.canContinue) {
      proxies.postStateRequest$.onNext({
        url: `${API_URL}/application`,
        method: 'POST',
        send: map(pick(['slug', 'fields']), state.pages)
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
  const initApp$ = head(withLatestFrom(setInitStateAndStep, setInitState$, handleRoute$))

  // Merge all update functions

  return merge(
    concat(initApp$, handleRoute$),
    updateFieldAndErrorCheck$,
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