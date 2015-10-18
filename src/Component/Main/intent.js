import {map, prop} from 'ramda'
import {merge} from '../../helpers'

// const eventToFieldInput = ev => {
//   return { key: ev.target.id, value: ev.target.value }
// }
//
// const onBlurAndChange = (DOM, selector) =>
//   merge(DOM.select(selector).events('blur'),
//         DOM.select(selector).events('change'))

const intent = ({DOM}) => ({
  // fieldInput$: map(eventToFieldInput, onBlurAndChange(DOM, 'input')),
  fieldChange$: map(prop('detail'), DOM.select('.field').events('newValue')),
  postState$: DOM.select('.continue').events('click')
})

export default intent
