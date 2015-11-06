import {prop, flip, compose, divide, subtract} from 'ramda'

function SetRowsHook (minRows) {
  this.minRows = minRows
}

const calculateTextareaRows = textarea => {
  const lineHeight = 28.5
  const minHeight = 53
  const getRows = compose(
    Math.ceil,
    flip(divide)(lineHeight),
    flip(subtract)(minHeight),
    prop('scrollHeight')
  )
  const rows = getRows(textarea)
  return rows
}

SetRowsHook.prototype.hook = function hook (textarea) {
  textarea.rows = this.minRows
  textarea.rows = this.minRows + calculateTextareaRows(textarea)
}

export default {SetRowsHook}
