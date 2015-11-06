/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {prop, flip, compose, divide, subtract} from 'ramda'
import {combineLatest, concat} from '../../helpers'
import {log} from '../../utils'

const calculateTextareaRows = textarea => {
  const lineHeight = 28.5
  const minHeight = 53
  const getRows = compose(
    Math.ceil,
    log,
    flip(divide)(lineHeight),
    flip(subtract)(minHeight),
    prop('scrollHeight')
  )
  const rows = getRows(textarea)
  return rows
}

const model = (props$, actions) => {
  const amendedProps$ = combineLatest(props$, actions.editInput$, (props, target) => {
    const newValue = target.value
    const rows = target.localName === 'textarea' ? props.minRows + calculateTextareaRows(target) : null
    const errorMessage = props.required && !newValue ? `${props.label} is required` : ''
    return { ...props, errorMessage, rows, value: newValue }
  })
  return concat(props$, amendedProps$)
}

export default model
