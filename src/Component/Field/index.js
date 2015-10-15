import {map} from 'ramda'
import {merge} from '../../helpers'

const eventToFieldInput = ev => {
  return { key: ev.target.id, value: ev.target.value }
}

const onBlurAndChange = (DOM, selector) =>
  merge(DOM.select(selector).events('blur'),
        DOM.select(selector).events('change'))

const intent = DOM => ({
  valueChange$: map(eventToFieldInput, onBlurAndChange(DOM, 'input'))
})

const model = (context, actions) => {
  
}

const field = sources => {

}

export default renderField
