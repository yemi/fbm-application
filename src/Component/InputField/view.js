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

const renderInput = ({type, value, id}) =>
  <input type={type} value={value ? value : ''} id={id} className="input" />

const getFormFieldClasses = ({type, value, focused}) => {
  const formFieldType = type === 'text' ? 'input' : type
  const floatLabel = 'has-floatLabel ' + (type === 'radio' || type === 'checkbox' ? 'is-floating' : '')
  const floatLabelState = value ? 'is-floating' : ''
  const focusState = focused ? 'is-focused' : ''
  return `formField formField--${formFieldType} ${floatLabel} ${floatLabelState} ${focusState} mb30`
}

const getLabelClasses = ({errorMessage}) => {
  const error = errorMessage ? 'formField-label--error' : ''
  return `formField-label ${error}`
}

const view = (state$, name = '') =>
  map(state => {
    const formFieldClasses = getFormFieldClasses(state)
    const labelClasses = getLabelClasses(state)
    const input = state.options ? map(renderInputOption(state), state.options) : renderInput(state)
    return (
      <div id={name} className={formFieldClasses}>
        <div className={labelClasses}>
          <label for={state.id}>{state.errorMessage || state.label}</label>
        </div>
        {input}
      </div>
    )
  }, state$)

export default view
