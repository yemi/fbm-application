import {map, prop} from 'ramda'
import {merge} from '../helpers'
import {log} from '../utils'

const intent = (DOM, inputFieldActions) => ({
  inputFieldEdit$: inputFieldActions.edit$,

  postState$: DOM.select('.continue').events('click')
})

export default intent
