/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {combineLatest, concat} from '../../helpers'
import {log} from '../../utils'

const model = (props$, actions) => {
  const amendedProps$ = combineLatest(props$, actions.input$, actions.focused$.startWith(false).map(log), (props, newValue, focused) => {
    console.log(focused)
    const errorMessage = props.required && !newValue ? `${props.label} is required` : ''
    return { ...props, errorMessage, focused, value: newValue }
  })
  return concat(props$, amendedProps$)
}

export default model
