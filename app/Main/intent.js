import {filterLinks} from '@cycle/history'
import {path, filter, map, prop} from 'ramda'
import {merge} from '../helpers'
import {log} from '../utils'

const intent = (DOM, formPage) => ({
  inputFieldEdit$: formPage.inputFieldEdit$,

  url$: map(path(['target', 'pathname']), filter(filterLinks, DOM.select('a').events('click'))),

  submit$: DOM.select('#submit').events('click')
})

export default intent
