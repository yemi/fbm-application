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
  isSubmitted: false
}

const makeUpdate$ = ({actions, httpGetResponse$, httpPostResponse$, History, LocalStorage}) => {

  // -- onPageEdit$ :: Observable (State -> State)
  const onPageEdit$ = R.map(page => state => {
    const pages = R.assoc(state.activeRoute, page, state.pages)
    const newState = { ...state, pages  }
    return newState
  }, actions.pageEdit$)

  // -- nonEmptyLocalStorage$ :: Observable SourceData
  const nonEmptyLocalStorage$ = R.filter(R.has('pages'), LocalStorage)

  // -- SourceData$ :: Observable SourceData
  const sourceData$ = H.head(H.merge(httpGetResponse$, nonEmptyLocalStorage$))

  // -- setInitState$ :: Observable (State -> State)
  const setInitState$ = R.map(sourceData => state => {
    const newState = U.mergeStateWithSourceData(state, sourceData)
    return newState
  }, sourceData$)

  // -- handleRoute$ :: Observable (State -> State)
  const handleRoute$ = R.map(location => state => {
    const route = location.pathname === '/' ? DEFAULT_ROUTE : location.pathname
    const activeRoute = R.replace('/', '', route)
    const activePage = R.prop(activeRoute, state.pages)
    const activeStep = activePage.type === 'step' ? activePage.index : state.activeStep
    const newState = { ...state, activeStep, activeRoute }
    return newState
  }, History)

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
  const initApp$ = H.head(H.withLatestFrom(setInitStateAndStep, setInitState$, handleRoute$))

  return H.merge(
    H.concat(initApp$, handleRoute$),
    onPageEdit$,
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
