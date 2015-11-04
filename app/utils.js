import {pick, replace, curry, map, prop, compose, lensProp, lensIndex} from 'ramda'
import {API_URL} from './config'

const log = a => {
  console.log(a);
  return a
}

const log_ = curry((desc, a) => {
  console.log(desc, a);
  return a
})

const makeRequestObject = (method, url, query) => ({
  url: url,
  method: method,
  query: query || {},
  accept: 'json',
  headers: {
    'Content-Type': 'application/json',
  }
})

const makePostStateRequestObject = state => {
  const postState = map(pick(['fieldGroups']), state.pages)
  const url = `${API_URL}/application`
  const method = 'POST'
  const requestObject = makeRequestObject(method, url, postState)
  return requestObject
}

const slash = path => `/${path}`

const mergeStateWithSourceData = (state, sourceData) => {
  const newState = {
    ...state,
    pages: prop('pages', sourceData),
    totalSteps: prop('total-steps', sourceData) || prop('totalSteps', sourceData),
    loading: false,
    canContinue: sourceData.canContinue || false
  }
  return newState
}

const makeFieldGroupsLens = route =>
  compose(
    lensProp('pages'),
    lensProp(route),
    lensProp('fieldGroups')
  )

const makeFieldsLens = (route, fieldGroupIndex) =>
  compose(
    makeFieldGroupsLens(route),
    lensIndex(fieldGroupIndex),
    lensProp('fields')
  )

const lenses = {
  fieldGroups: route => makeFieldGroupsLens(route),
  fields: (route, fieldGroupIndex) => makeFieldsLens(route, fieldGroupIndex)
}

const removeMultipleSpaces = replace(/\s\s+/g, ' ')

const replicateStream = (origin$, proxy$) => origin$.subscribe(proxy$.asObserver())

export default {
  log,
  log_,
  makeRequestObject,
  makePostStateRequestObject,
  mergeStateWithSourceData,
  slash,
  lenses,
  removeMultipleSpaces,
  replicateStream
}
