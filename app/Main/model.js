import R from 'ramda'
import {run, Rx} from '@cycle/core'
import {slash, log, log_, lenses, mergeStateWithSourceData} from '../utils'
import {DEFAULT_ROUTE} from '../config'
import {concat, head, withLatestFrom, scan, shareReplay, merge} from '../helpers'

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

const makeUpdate$ = ({ actions, httpGetResponse$, httpPostResponse$, History, LocalStorage }) => {
  const updateField = ({value, fieldIndex, fieldGroupIndex, errorMessage}) => state => {
    const fieldsLens = lenses.fields(state.activeRoute, fieldGroupIndex)
    const fields = R.view(fieldsLens, state)
    const updateField = field => ({ ...field, value, errorMessage })
    const updatedFields = R.adjust(updateField, fieldIndex, fields)
    const newState = R.set(fieldsLens, updatedFields, state)
    return newState
  }

  const updateFieldsErrors = ({errorMessage, id}) => state => {
    const fieldsErrors = errorMessage ? R.assoc(id, errorMessage, state.fieldErrors) : R.dissoc(id, state.fieldErrors)
    const newState = { ...state, fieldsErrors }
    return newState
  }

  const handleFieldsErrors = state => {
    const newState = { ...state, canContinue: R.isEmpty(state.fieldsErrors) }
    return newState
  }

  const updateFieldAndHandleFieldErrors$ = R.map(formField =>
    R.compose(handleFieldsErrors, updateFieldsErrors(formField), updateField(formField))
  , actions.formFieldEdit$)

  const nonEmptyLocalStorage$ = R.filter(R.has('pages'), LocalStorage)
  const sourceData$ = head(merge(httpGetResponse$, nonEmptyLocalStorage$))

  const setInitState$ = R.map(sourceData => state => {
    const newState = mergeStateWithSourceData(state, sourceData)
    return newState
  }, sourceData$)

  const handleRoute$ = R.map(location => state => {
    const route = location.pathname === '/' ? DEFAULT_ROUTE : location.pathname
    const activeRoute = R.replace('/', '', route)
    const activePage = R.prop(activeRoute, state.pages)
    const activeStep = activePage.type === 'step' ? activePage.index : state.activeStep
    const newState = { ...state, activeStep, activeRoute }
    return newState
  }, History)

  const onSubmit$ = R.map(() => state => {
    const newState = { ...state, loading: true, postErrors: [] }
    return state.canContinue ? newState : state
  }, actions.submit$)

  const ongetHttpPostResponse$ = R.map(res => state => {
    // const errs = [{ id: 'company-name', errMsg: 'Your company type should be aBBa' }]
    // if (err) {
    //   return { ...state, postErrors: errs, loading: false }
    // }
    const pages = merge(state.pages, res.body)
    const newState = { ...state, pages, isSubmitted: true, loading: false }
    return newState
  }, httpPostResponse$)

  // Combiners

  const setInitStateAndStep = (setInitState, handleRoute) => R.compose(handleRoute, setInitState)
  const initApp$ = head(withLatestFrom(setInitStateAndStep, setInitState$, handleRoute$))

  // Merge all update functions

  return merge(
    concat(initApp$, handleRoute$),
    updateFieldAndHandleFieldErrors$,
    onSubmit$,
    ongetHttpPostResponse$
  )
}

const model = sources => {
  const update$ = makeUpdate$(sources)
  const stateFold = (state, update) => update(state)
  const state$ = scan(stateFold, defaultState, update$)
  const stateHasPages = R.compose(R.not, R.isEmpty, R.prop('pages'))
  return R.filter(stateHasPages, state$)
}

export default model
