import {Rx} from '@cycle/core'
import view from './view'
import {filter, prop, flatten, path, compose, equals, map} from 'ramda'
import {merge, flatMapLatest, mapIndexed, rxJust} from '../../helpers'
import inputField from '../../Widget/InputField'

const amendPropsWithChildren = DOM => props => {
  const fieldGroups = mapIndexed((fieldGroup, i) => ({
    ...fieldGroup,
    fields: fieldGroup.fields.map((field, y) => {
      const props$ = rxJust({ ...field, fieldGroupIndex: i, fieldIndex: y })
      return {
        ...field,
        inputField: inputField({DOM, props$}, field.id)
      }
    })
  }), props.fieldGroups)
  const newProps = { ...props, fieldGroups }
  return newProps
}

const makeInputFieldAction$ = (actionKey, amendedProps$) => {
  const getActionFromInputFields$ = actionKey => props => {
    const getInputFieldAction = path(['inputField', actionKey])
    const getActionsFromFields = compose(map(getInputFieldAction), prop('fields'))
    const getActionsFromFieldGroups = compose(flatten, map(getActionsFromFields), prop('fieldGroups'))
    const actions = getActionsFromFieldGroups(props)
    const action$ = merge(actions)
    return action$
  }
  const inputFieldAction$ = flatMapLatest(getActionFromInputFields$(actionKey), amendedProps$)
  return inputFieldAction$
}

const main = (DOM, props$) => {
  const isFormPage = compose(equals('step'), prop('type'))
  const formPage$ = filter(isFormPage, props$)
  const amendedProps$ = map(amendPropsWithChildren(DOM), formPage$)
  const vTree$ = view(amendedProps$)
  const inputFieldEdit$ = makeInputFieldAction$('edit$', amendedProps$)
  return {
    DOM: vTree$,
    inputFieldEdit$: inputFieldEdit$
  }
}

export default main
