import {map, prop} from 'ramda'

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

  isTruthy (x) {
    return !!x
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
  }
}
