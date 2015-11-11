/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import R from 'ramda'
import H from '../../helpers'
import U from '../../utils'
import {SetRowsHook} from '../../hooks'

const renderInputOptionToggle = state =>
  <div className={`inputOptionToggle inputOptionToggle--${state.type}`}>
    <div className="inputOptionToggle-outer">
      <div className="inputOptionToggle-inner"></div>
    </div>
  </div>

const renderInputOption = state => option =>
  <div className="formField-listOption">
    <input type={state.type}
           value={option.value}
           id={option.value}
           className={`input--${state.type} fakeHide`}
           name={state.id}
           checked={state.value === option.value} />

       <label htmlFor={option.value}>
      {renderInputOptionToggle(state)}
      {option.label}
    </label>
  </div>

const renderSelectInputOption = state => option =>
  <option value={option.value} selected={state.value === option.value}>{option.label}</option>

const renderSelectInput = state => {
  const selectOptions = R.map(renderSelectInputOption(state), state.options)
  return (
    <div>
      <select name={state.id} id={state.id} >
        {selectOptions}
      </select>
    </div>
  )
}

const renderInputWithOptions = state =>
  state.type === 'select'
    ? renderSelectInput(state)
    : R.map(renderInputOption(state), state.options)

const renderTextarea = ({type, value, id, minRows}) =>
  <textarea name={id}
            id={id}
            data-hook={new SetRowsHook(minRows)}
            value={value || ''}
            cols="40"
            className="input" />

const renderGenericInput = ({type, value, id}) =>
  <input type={type} value={value || ''} id={id} className="input" />

const renderInput = state =>
  state.type === 'textarea' ? renderTextarea(state) : renderGenericInput(state)

const renderHelpTextToggle = state =>
  <i className="formField-help icon icon--help" data-tooltip={state.helpText}>?</i>

const getFormFieldClasses = ({type, value, errorMessage}, focus) => {
  const formFieldType = type === 'text' ? 'input' : type
  const floatLabelContext = 'has-floatLabel'
  const floatLabelState = type === 'radio' || type === 'checkbox' || value ? 'is-floating' : ''
  const focusState = focus ? 'is-focused' : ''
  const errorContext = errorMessage ? 'has-error' : ''
  const formFieldClasses = `formField formField--${formFieldType} ${floatLabelContext} ${floatLabelState} ${focusState} ${errorContext} mb30`
  return U.removeMultipleSpaces(formFieldClasses)
}

const view = (state$, focus$, name = '') =>
  H.combineLatest(state$, focus$, (state, focus) => {
    const formFieldClasses = getFormFieldClasses(state, focus)
    const input = state.options ? renderInputWithOptions(state) : renderInput(state)
    const helpTextToggle = state.helpText ? renderHelpTextToggle(state) : null
    return (
      <div id={name} className={formFieldClasses}>
        <div className="formField-label">
          <label for={state.id}>
            {state.errorMessage || state.label}
            <span className="colorProfile medium">{state.required ? ' *' : ''}</span>
          </label>
        </div>
        {input}
        {helpTextToggle}
      </div>
    )
  })

export default view
