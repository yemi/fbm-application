/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {combineLatest, concat} from '../../helpers'

const model = (props$, actions) => {
  const amendedProps$ = combineLatest(props$, actions.editInput$, (props, newValue) => {
    const errorMessage = props.required && !newValue ? `${props.label} is required` : ''
    return { ...props, errorMessage, value: newValue }
  })
  return concat(props$, amendedProps$)
}

export default model
