import {map, prop, compose, lensProp, lensIndex} from 'ramda'

export default {
  log (a) {
    console.log(a);
    return a
  },

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
      routes: map(prop('slug'), sourceData.steps)
    }

    return newState
  },

  lenses: activeStep => ({
    fields: compose(lensProp('steps'), lensIndex(activeStep), lensProp('fields'))
  })
}
