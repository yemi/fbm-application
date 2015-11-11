/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import R from 'ramda'
import H from '../../helpers'
import {log} from '../../utils'

const model = (props$, actions) => {
  const editInput$ = H.merge(actions.editTextInput$, actions.editOptionInput$)
  const amendedProps$ = H.combineLatest(props$, editInput$, (props, target) => {
    const newValue = target.value
    const errorMessage = props.required && !newValue ? `${props.label} is required` : ''
    return { ...props, errorMessage, value: newValue }
  })
  return H.concat(props$, amendedProps$)
}

export default model
