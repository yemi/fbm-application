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
  }
}
