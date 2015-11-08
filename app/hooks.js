import R from 'ramda'

function SetRowsHook (minRows) {
  this.minRows = minRows
}

const calculateTextareaRows = textarea => {
  const lineHeight = 28.5
  const minHeight = 53
  const getRows = R.compose(
    Math.ceil,
    R.flip(R.divide)(lineHeight),
    R.flip(R.subtract)(minHeight),
    R.prop('scrollHeight')
  )
  const rows = getRows(textarea)
  return rows
}

SetRowsHook.prototype.hook = function hook (textarea) {
  textarea.rows = this.minRows
  textarea.rows = this.minRows + calculateTextareaRows(textarea)
}

export default {SetRowsHook}
