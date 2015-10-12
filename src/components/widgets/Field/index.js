/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {map} from 'ramda'

const renderOption = field => option =>
  <div>
    <input type={field.type}
           value={option.value}
           id={field.key}
           name={field.key}
           checked={field.value === option.value} />

    <label htmlFor={field.key}>{option.name}</label>
  </div>

const renderInput = field => {
  if (field.options) {
    return map(renderOption(field), field.options)
  } else {
    return <input type={field.type} value={field.value ? field.value : ''} id={field.key} />
  }
}

const renderField = field => {
  const input = renderInput(field)
  const errMsg = field.errMsg ? <div className="alert alert-danger">{field.errMsg}</div> : null
  return (
    <div className="field">
      <div>{field.name}</div>
      {input}
      <div>{field.value}</div>
      {errMsg}
    </div>
  )
}

export default renderField
