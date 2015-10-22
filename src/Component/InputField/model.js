/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {combineLatest, concat} from '../../helpers'

const model = (actions, props$) => {
  const amendedProps$ = combineLatest(props$, actions.valueChange$, (props, newValue) => {
    const errorMessage = props.required && !newValue ? `${props.label} is required` : ''
    const value = newValue
    return { ...props, value, errorMessage }
  })
  return concat(props$, amendedProps$)
}

export default model
