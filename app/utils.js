import {replace, curry, map, prop, compose, lensProp, lensIndex} from 'ramda'

export default {
  log (a) {
    console.log(a);
    return a
  },

  log_: curry((desc, a) => {
    console.log(desc, a);
    return a
  }),

  urlToRequestObjectWithHeaders (url) {
    return {
      url: url,
      method: 'GET',
      accept: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  },

  mergeStateWithSourceData (state, sourceData) {
    const newState = {
      ...state,
      totalSteps: sourceData.steps.length,
      steps: sourceData.steps,
      loading: false,
      routes: map(prop('slug'), sourceData.steps),
      canContinue: sourceData.canContinue || false
    }
    return newState
  },

  lenses: {
    fields: (activeStep, fieldGroupIndex) =>
      compose(
        lensProp('steps'),
        lensIndex(activeStep),
        lensProp('fieldGroups'),
        lensIndex(fieldGroupIndex),
        lensProp('fields')
      )
  },

  removeMultipleSpaces: replace(/\s\s+/g, ' ')
}
