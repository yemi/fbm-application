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
    steps: sourceData.steps,
    loading: false,
    canContinue: sourceData.canContinue || false
  }
  return newState
}

const lenses = {
  fields: (activeStep, fieldGroupIndex) =>
    compose(
      lensProp('steps'),
      lensIndex(activeStep),
      lensProp('fieldGroups'),
      lensIndex(fieldGroupIndex),
      lensProp('fields')
    )
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
