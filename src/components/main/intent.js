import {compose, map, prop, assoc, always} from 'ramda'
import {defaultState} from './model'

const eventToFieldInput = ev => ({ key: ev.target.id, val: ev.target.value })

const intent = ({DOM}) => ({
  fieldInput$: map(eventToFieldInput, DOM.select('input').events('change')),
  postState$: DOM.select('.continue').events('click')
})

export default intent
