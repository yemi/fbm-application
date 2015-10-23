/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {map} from 'ramda'
import {rxJust, combineLatest} from '../../helpers'

const renderInputOption = state => option =>
  <div>
    <input type={state.type}
           value={state.value}
           id={state.id}
           name={state.id}
           checked={state.value === option.value} />

    <label htmlFor={state.id}>{option.label}</label>
  </div>

const renderSelectInputOption = ({value, label}) =>
  <option value={value}>{label}</option>

const renderSelectInput = ({id, options}) => {
  const selectOptions = map(renderSelectInputOption, options)
  return (
    <div>
      <select name={id} id={id}>
        {selectOptions}
      </select>
    </div>
  )
}

const renderInputWithOptions = state =>
  state.type === 'select'
    ? renderSelectInput(state)
    : map(renderInputOption(state), state.options)

const renderInput = ({type, value, id}) =>
  <input type={type} value={value ? value : ''} id={id} className="input" />

const renderHelpTextToggle = state =>
  <i className="formField-help icon icon--help" data-tooltip={state.helpText}>?</i>

const getFormFieldClasses = ({type, value, errorMessage}, focus) => {
  const formFieldType = type === 'text' ? 'input' : type
  const floatLabelContext = 'has-floatLabel'
  const floatLabelState = type === 'radio' || type === 'checkbox' || value ? 'is-floating' : ''
  const focusState = focus ? 'is-focused' : ''
  const errorContext = errorMessage ? 'has-error' : ''
  return `formField formField--${formFieldType} ${floatLabelContext} ${floatLabelState} ${focusState} ${errorContext} mb30`
}

const view = (state$, focus$, name = '') =>
  combineLatest(state$, focus$, (state, focus) => {
    const formFieldClasses = getFormFieldClasses(state, focus)
    const input = state.options ? renderInputWithOptions(state) : renderInput(state)
    const helpTextToggle = state.helpText ? renderHelpTextToggle(state) : null
    return (
      <div id={name} className={formFieldClasses}>
        <div className="formField-label">
          <label for={state.id}>{state.errorMessage || state.label}</label>
        </div>
        {input}
        {helpTextToggle}
      </div>
    )
  })

export default view
