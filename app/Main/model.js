import {run, Rx} from '@cycle/core'
import R from 'ramda'
import H from '../helpers'
import {slash, log, log_, lenses, mergeStateWithSourceData} from '../utils'
import {DEFAULT_ROUTE} from '../config'

const defaultState = {
  loading: true,
  activeStep: 0,
  activeRoute: '',
  canContinue: false,
  pages: {},
  totalSteps: null,
  fieldsErrors: {},
  isSubmitted: false
}

const makeUpdate$ = sources => {
  const updateField = ({value, fieldIndex, fieldGroupIndex, errorMessage}) => state => {
    const fieldsLens = lenses.fields(state.activeRoute, fieldGroupIndex)
    const fields = R.view(fieldsLens, state)
    const updateField = field => ({ ...field, value, errorMessage })
    const updatedFields = R.adjust(updateField, fieldIndex, fields)
    const newState = R.set(fieldsLens, updatedFields, state)
    return newState
  }

  const updateFieldsErrors = ({errorMessage, id}) => state => {
    const fieldsErrors = errorMessage 
      ? R.assoc(id, errorMessage, state.fieldsErrors) 
      : R.dissoc(id, state.fieldsErrors)
    const newState = { ...state, fieldsErrors }
    return newState
  }

  const handleFieldsErrors = state => {
    const canContinue = R.isEmpty(state.fieldsErrors)
    const newState = { ...state, canContinue }
    return newState
  }

  const updateFieldAndHandleFieldErrors$ = R.map(formField =>
    R.compose(handleFieldsErrors, updateFieldsErrors(formField), updateField(formField))
  , sources.actions.formFieldEdit$)

  const nonEmptyLocalStorage$ = R.filter(R.has('pages'), sources.LocalStorage)
  const sourceData$ = H.head(H.merge(sources.httpGetResponse$, nonEmptyLocalStorage$))

  const setInitState$ = R.map(sourceData => state => {
    const newState = mergeStateWithSourceData(state, sourceData)
    return newState
  }, sourceData$)

  const allRequiredFieldsHaveValue = page => {
    const isFieldValid = field => (field.required && field.value) || R.not(field.required)
    const isFieldGroupValid = R.compose(R.all(isFieldValid), R.prop('fields'))
    const areFieldGroupsValid = R.compose(R.all(R.identity), R.flatten, R.map(isFieldGroupValid))
    return areFieldGroupsValid(page.fieldGroups)
  }

  const handleRoute$ = R.map(location => state => {
    const route = location.pathname === '/' ? DEFAULT_ROUTE : location.pathname
    const activeRoute = R.replace('/', '', route)
    const activePage = R.prop(activeRoute, state.pages)
    const activeStep = activePage.type === 'step' ? activePage.index : state.activeStep
    const canContinue = R.isEmpty(state.fieldsErrors) && allRequiredFieldsHaveValue(activePage)
    const newState = { ...state, activeStep, activeRoute, canContinue }
    return newState
  }, sources.History)

  const onSubmit$ = R.map(() => state => {
    const newState = { ...state, loading: true, postErrors: [] }
    return state.canContinue ? newState : state
  }, sources.actions.submit$)

  const onGetHttpPostResponse$ = R.map(res => state => {
    // const errs = [{ id: 'company-name', errMsg: 'Your company type should be aBBa' }]
    // if (err) {
    //   return { ...state, postErrors: errs, loading: false }
    // }
    const pages = H.merge(state.pages, res.body)
    const newState = { ...state, pages, isSubmitted: true, loading: false }
    return newState
  }, sources.httpPostResponse$)

  // Combiners

  const setInitStateAndStep = (setInitState, handleRoute) => R.compose(handleRoute, setInitState)
  const initApp$ = H.head(H.withLatestFrom(setInitStateAndStep, setInitState$, handleRoute$))

  // Merge all update functions

  return H.merge(
    H.concat(initApp$, handleRoute$),
    updateFieldAndHandleFieldErrors$,
    onSubmit$,
    onGetHttpPostResponse$
  )
}

const model = sources => {
  const update$ = makeUpdate$(sources)
  const stateFold = (state, update) => update(state)
  const state$ = H.scan(stateFold, defaultState, update$)
  const stateHasPages = R.compose(R.not, R.isEmpty, R.prop('pages'))
  return R.filter(stateHasPages, state$)
}

export default model
