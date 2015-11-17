import {svg} from '@cycle/dom'
import R from 'ramda'
import H from './helpers'
import {API_URL, SVG_ROOT} from './config'

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

const mergeStateWithSourceData = (state, sourceData) => {
  const newState = {
    ...state,
    pages: R.prop('pages', sourceData),
    totalSteps: R.prop('total-steps', sourceData) || R.prop('totalSteps', sourceData),
    isLoading: false,
    canContinue: sourceData.canContinue || false,
    fieldsErrors: sourceData.fieldsErrors
  }
  return newState
}

const lenses = {
  fields: fieldGroupIndex =>
    R.compose(
      R.lensProp('fieldGroups'),
      R.lensIndex(fieldGroupIndex),
      R.lensProp('fields')
    )
}

const replicateStream = (origin$, proxy$) => origin$.subscribe(proxy$.asObserver())

const getActivePage = state => R.prop(state.activeRoute, state.pages)

const makePageType$ = (type, state$) => {
  const activePage$ = R.map(getActivePage, state$)
  const pageTypeFilter = R.compose(R.equals(type), R.prop('type'))
  return R.filter(pageTypeFilter, activePage$)
}

const renderSvg = (name, options) =>
  svg('svg', options,
    svg('use', { 'xlink:href': `${SVG_ROOT}#${name}` }))

const calculateTextareaRows = textarea => {
  const lineHeight = 28.5
  const minHeight = 53
  const getRows = R.compose(
    Math.ceil,
    R.flip(R.divide)(lineHeight),
    R.flip(R.subtract)(minHeight),
    R.prop('scrollHeight')
  )
  const rows = getRows(textarea)
  return rows
}

module.exports = {
  log,
  log_,
  makeRequestObject,
  makePostStateRequestObject,
  mergeStateWithSourceData,
  isSuccessfulHttpResponse,
  lenses,
  replicateStream,
  getActivePage,
  makePageType$,
  renderSvg,
  calculateTextareaRows 
}
