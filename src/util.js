import {compose, assoc, toString, map, prop} from 'ramda'

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

  httpResponseToState (res) {
    return compose(
      assoc('totalSteps', toString(res.steps.length)),
      assoc('steps', res.steps),
      assoc('loading', false),
      assoc('routes', map(prop('slug'), res.steps))
    )({})
  },

  isTruthy (x) {
    return !!x
  }
}
