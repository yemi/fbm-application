/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import R from 'ramda'
import H from '../../helpers'
import {log} from '../../utils'

const calculateTextareaRows = textarea => {
  const lineHeight = 28.5
  const minHeight = 53
  const getRows = R.compose(
    Math.ceil,
    log,
    R.flip(R.divide)(lineHeight),
    R.flip(R.subtract)(minHeight),
    R.prop('scrollHeight')
  )
  const rows = getRows(textarea)
  return rows
}

const model = (props$, actions) => {
  const amendedProps$ = H.combineLatest(props$, actions.editInput$, (props, target) => {
    const newValue = target.value
    const rows = target.localName === 'textarea' ? props.minRows + calculateTextareaRows(target) : null
    const errorMessage = props.required && !newValue ? `${props.label} is required` : ''
    return { ...props, errorMessage, rows, value: newValue }
  })
  return H.concat(props$, amendedProps$)
}

export default model
