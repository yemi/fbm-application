import {filterLinks} from '@cycle/history'
import R from 'ramda'
import {rxJust} from '../helpers'

const intent = (DOM, formPage) => ({
  formFieldEdit$: formPage.formFieldEdit$,

  url$: R.map(R.path(['target', 'pathname']), R.filter(filterLinks, DOM.select('a').events('click'))),

  submit$: DOM.select('#submit').events('click')
})

export default intent
