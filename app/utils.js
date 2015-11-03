import {replace, curry, map, prop, compose, lensProp, lensIndex} from 'ramda'

const log = a => {
  console.log(a);
  return a
}

const log_ = curry((desc, a) => {
  console.log(desc, a);
  return a
})

const urlToRequestObjectWithHeaders = url => {
  return {
    url: url,
    method: 'GET',
    accept: 'json',
    headers: {
      'Content-Type': 'application/json',
    }
  }
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

const makeFieldGroupsLens = activeRoute =>
  compose(
    lensProp('pages'),
    lensProp(activeRoute),
    lensProp('fieldGroups')
  )

const makeFieldsLens = (activeRoute, fieldGroupIndex) =>
  compose(
    fieldGroupsLens(activeRoute),
    lensIndex(fieldGroupIndex),
    lensProp('fields')
  )

const lenses = {
  fieldGroups: activeRoute => fieldGroupsLens(activeRoute),
  fields: (activeRoute, fieldGroupIndex) => fieldsLens(activeRoute, fieldGroupIndex)
}

const removeMultipleSpaces = replace(/\s\s+/g, ' ')

export default {
  log,
  log_,
  urlToRequestObjectWithHeaders,
  mergeStateWithSourceData,
  slash,
  lenses,
  removeMultipleSpaces
}
