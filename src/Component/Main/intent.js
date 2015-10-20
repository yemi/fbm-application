import {map, prop} from 'ramda'
import {merge} from '../../helpers'
import {log} from '../../utils'

// const eventToFieldInput = ev => {
//   return { key: ev.target.id, value: ev.target.value }
// }
//
// const onBlurAndChange = (DOM, selector) =>
//   merge(DOM.select(selector).events('blur'),
//         DOM.select(selector).events('change'))

const intent = ({DOM}, inputFieldActions) => ({
  fieldEdit$: map(log, inputFieldActions.edit$),

  postState$: DOM.select('.continue').events('click')
})

export default intent
