import {h} from '@cycle/dom'
import R from 'ramda'
import H from '../../helpers'
import U from '../../utils'
import {SetRowsHook} from '../../hooks'

const {span, i, div, input, label, select, textarea} = require("hyperscript-helpers")(h)

const renderInputOptionToggle = state =>
  div(`.inputOptionToggle.inputOptionToggle--${state.type}`,[
    div('.inputOptionToggle-outer', [
      div('.inputOptionToggle-inner')
    ])
  ])

const renderInputOption = state => option => 
  div('.formField-listOption', [
    input(`#${option.value}.input--${state.type}.hide`, {
      type: state.type,
      value: option.value,
      name: state.id,
      checked: state.value === option.value
    }),
    label({ htmlFor: option.value }, [
      renderInputOptionToggle(state),
      option.label
    ]),
  ])

const renderSelectInputOption = state => option =>
  h('option', { value: option.value, selected: state.value === option.value }, option.label)

const renderSelectInput = state => {
  const selectOptions = R.map(renderSelectInputOption(state), state.options)
  return (
    div(
      select({ name: state.id, id: state.id }, selectOptions)
    )
  )
}

const renderInputWithOptions = state =>
  state.type === 'select'
    ? renderSelectInput(state)
    : R.map(renderInputOption(state), state.options)

const renderTextarea = ({type, value, id, minRows}) =>
  textarea('.input', { value: value || '', cols: "40" })

const renderGenericInput = ({type, value, id}) =>
  input('.input', { type: type, value: value || '' })

const renderInput = state =>
  state.type === 'textarea' ? renderTextarea(state) : renderGenericInput(state)

const renderHelpTextToggle = state =>
  i('.formField-help.icon.icon--help', { 'data-tooltip': state.helpText }, '?')

const getFormFieldClasses = ({type, value, errorMessage}, focus) => {
  const formFieldType = type === 'text' ? 'input' : type
  const floatLabelContext = '.has-floatLabel'
  const floatLabelState = type === 'radio' || type === 'checkbox' || value ? '.is-floating' : ''
  const focusState = focus ? '.is-focused' : ''
  const errorContext = errorMessage ? '.has-error' : ''
  const formFieldClasses = `.formField.formField--${formFieldType}${floatLabelContext}${floatLabelState}${focusState}${errorContext}.mb30`
  return formFieldClasses
}

const view = (state$, focus$, name = '') =>
  H.combineLatest(state$, focus$, (state, focus) => {
    const formFieldClasses = getFormFieldClasses(state, focus)
    const input = state.options ? renderInputWithOptions(state) : renderInput(state)
    const helpTextToggle = state.helpText ? renderHelpTextToggle(state) : null
    return (
      div(`#${name}${formFieldClasses}`, [
        div('.formField-label',
          label({ htmlFor: state.id }, [
            state.errorMessage || state.label,
            span('.colorProfile.medium', state.required ? ' *' : '')
          ])
        ),
        input,
        helpTextToggle
      ])
    )
  })

export default view
