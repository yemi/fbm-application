import {map, prop} from 'ramda'
import {merge} from '../helpers'
import {log} from '../utils'

const intent = (DOM, inputFieldActions) => ({
  inputFieldEdit$: inputFieldActions.edit$,

  submit$: DOM.select('#submit').events('click')
})

export default intent
