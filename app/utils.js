import R from 'ramda'
import {API_URL} from './config'

const log = a => {
  console.log(a);
  return a
}

const log_ = R.curry((desc, a) => {
  console.log(desc, a);
  return a
})

const makeRequestObject = R.curry((method, query, url) => ({
  url: url,
  method: method,
  query: query || {},
  accept: 'json',
  headers: {
    'Content-Type': 'application/json',
  }
}))

const makePostStateRequestObject = state => {
  const postState = R.map(R.pick(['fieldGroups']), state.pages)
  const url = `${API_URL}/application`
  const method = 'POST'
  const requestObject = makeRequestObject(method, postState, url)
  return requestObject
}

const isSuccessfulHttpResponse = res => res.statusCode === 200

const slash = path => `/${path}`

const mergeStateWithSourceData = (state, sourceData) => {
  const newState = {
    ...state,
    pages: R.prop('pages', sourceData),
    totalSteps: R.prop('total-steps', sourceData) || R.prop('totalSteps', sourceData),
    loading: false,
    canContinue: sourceData.canContinue || false
  }
  return newState
}

const makeFieldGroupsLens = route =>
  R.compose(
    R.lensProp('pages'),
    R.lensProp(route),
    R.lensProp('fieldGroups')
  )

const makeFieldsLens = (route, fieldGroupIndex) =>
  R.compose(
    makeFieldGroupsLens(route),
    R.lensIndex(fieldGroupIndex),
    R.lensProp('fields')
  )

const lenses = {
  fieldGroups: route => makeFieldGroupsLens(route),
  fields: (route, fieldGroupIndex) => makeFieldsLens(route, fieldGroupIndex)
}

const removeMultipleSpaces = R.replace(/\s\s+/g, ' ')

const replicateStream = (origin$, proxy$) => origin$.subscribe(proxy$.asObserver())

const getActivePage = state => {
  const activePage = R.prop(state.activeRoute, state.pages)
  return activePage
}

const makePageType$ = (type, state$) => {
  const activePage$ = R.map(getActivePage, state$)
  const pageTypeFilter = R.compose(R.equals(type), R.prop('type'))
  return R.filter(pageTypeFilter, activePage$)
}

export default {
  log,
  log_,
  makeRequestObject,
  makePostStateRequestObject,
  mergeStateWithSourceData,
  isSuccessfulHttpResponse,
  slash,
  lenses,
  removeMultipleSpaces,
  replicateStream,
  getActivePage,
  makePageType$
}
