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

export default {
  log,
  log_,
  urlToRequestObjectWithHeaders,
  mergeStateWithSourceData,
  slash,
  lenses,
  removeMultipleSpaces
}
