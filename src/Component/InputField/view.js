/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {map} from 'ramda'

const renderInputOption = inputField => option =>
  <div>
    <input type={inputField.type}
           value={option.value}
           id={inputField.id}
           name={inputField.id}
           checked={inputField.value === option.value} />

    <label htmlFor={inputField.id}>{option.label}</label>
  </div>

const renderInput = ({type, value, id}) =>
  <input type={type} value={value ? value : ''} id={id} />

const view = (name = '') => map(inputField => {
  const input = inputField.options
    ? map(renderInputOption(inputField), inputField.options)
    : renderInput(inputField)
  return (
    <div className={name}>
      <div>{inputField.errorMessage || inputField.label}</div>
      {input}
      <div>{inputField.value}</div>
    </div>
  )
})

export default view
