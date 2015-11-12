import R from 'ramda'
import H from '../helpers'
import U from '../utils'
import {DEFAULT_ROUTE} from '../config'

const defaultState = {
  isLoading: true,
  activeStep: 0,
  activeRoute: '',
  canContinue: false,
  pages: {},
  totalSteps: null,
  fieldsErrors: {},
  isSubmitted: false
}

const makeUpdate$ = ({actions, httpGetResponse$, httpPostResponse$, History, LocalStorage}) => {

  // -- updateField :: FormField -> State -> State
  const updateField = ({value, fieldIndex, fieldGroupIndex, errorMessage}) => state => {
    const fieldsLens = U.lenses.fields(state.activeRoute, fieldGroupIndex)
    const fields = R.view(fieldsLens, state)
    const updateField = field => ({ ...field, value, errorMessage })
    const updatedFields = R.adjust(updateField, fieldIndex, fields)
    const newState = R.set(fieldsLens, updatedFields, state)
    return newState
  }

  // -- updateFieldsErrors :: FormField -> State -> State
  const updateFieldsErrors = ({errorMessage, id}) => state => {
    const fieldsErrors = errorMessage 
      ? R.assoc(id, errorMessage, state.fieldsErrors)
      : R.dissoc(id, state.fieldsErrors)
    const newState = { ...state, fieldsErrors }
    return newState
  }

  // -- allRequiredFieldsHaveValue :: Page -> Bool
  const allRequiredFieldsHaveValue = page => {
    const isFieldValid = field => (field.required && field.value) || R.not(field.required)
    const isFieldGroupValid = R.compose(R.all(isFieldValid), R.prop('fields'))
    const areFieldGroupsValid = R.compose(R.all(R.identity), R.flatten, R.map(isFieldGroupValid))
    return areFieldGroupsValid(page.fieldGroups)
  }

  // -- updateCanContinue :: State -> State
  const updateCanContinue = state => {
    const activePage = R.prop(state.activeRoute, state.pages)
    const canContinue = R.isEmpty(state.fieldsErrors) && allRequiredFieldsHaveValue(activePage)
    const newState = { ...state, canContinue }
    return newState
  }

  // -- onFormFieldEdit$ :: Observable (State -> State)
  const onFormFieldEdit$ = R.map(formField =>
    R.compose(updateCanContinue, updateFieldsErrors(formField), updateField(formField))
  , actions.formFieldEdit$)

  // -- nonEmptyLocalStorage$ :: Observable SourceData
  const nonEmptyLocalStorage$ = R.filter(R.has('pages'), LocalStorage)

  // -- SourceData$ :: Observable SourceData
  const sourceData$ = H.head(H.merge(httpGetResponse$, nonEmptyLocalStorage$))

  // -- setInitState$ :: Observable (State -> State)
  const setInitState$ = R.map(sourceData => state => {
    const newState = U.mergeStateWithSourceData(state, sourceData)
    return newState
  }, sourceData$)

  // -- handleRoute :: Location -> State -> State
  const handleRoute = location => state => {
    const route = location.pathname === '/' ? DEFAULT_ROUTE : location.pathname
    const activeRoute = R.replace('/', '', route)
    const activePage = R.prop(activeRoute, state.pages)
    const activeStep = activePage.type === 'step' ? activePage.index : state.activeStep
    const newState = { ...state, activeStep, activeRoute, fieldsErrors: {} }
    return newState
  }

  // -- activePageIsStep :: State -> Bool
  const activePageIsStep = state => {
    const activePage = R.prop(state.activeRoute, state.pages)
    return activePage.type === 'step'
  }

  // -- onRouteChange$ :: Observable (State -> State)
  const onRouteChange$ = R.map(location => 
    R.compose(R.ifElse(activePageIsStep, updateCanContinue, R.identity), handleRoute(location))
  , History)

  // -- onSubmit$ :: Observable (State -> State)
  const onSubmit$ = R.map(() => state => {
    const newState = { ...state, isLoading: true, postErrors: [] }
    return newState 
  }, actions.submit$)

  // -- onGetHttpPostResponse$ :: Observable (State -> State)
  const onGetHttpPostResponse$ = R.map(res => state => {
    //TODO: Handle error responses from server
    const pages = R.merge(state.pages, res.body)
    const newState = { ...state, pages, isSubmitted: true, isLoading: false }
    return newState
  }, httpPostResponse$)

  // -- setInitStateAndStep :: (State -> State) -> (State -> State) -> State -> State
  const setInitStateAndStep = (setInitState, onRouteChange) => R.compose(onRouteChange, setInitState)
  
  // -- initApp$ :: Observable (State -> State)
  const initApp$ = H.head(H.withLatestFrom(setInitStateAndStep, setInitState$, onRouteChange$))

  return H.merge(
    H.concat(initApp$, onRouteChange$),
    onFormFieldEdit$,
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
