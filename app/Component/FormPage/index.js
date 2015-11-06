import {Rx} from '@cycle/core'
import view from './view'
import {filter, prop, flatten, path, compose, equals, map} from 'ramda'
import {merge, flatMapLatest, mapIndexed, rxJust} from '../../helpers'
import inputField from '../../Widget/InputField'

const amendPageWithChildren = DOM => page => {
  const fieldGroups = mapIndexed((fieldGroup, i) => ({
    ...fieldGroup,
    fields: fieldGroup.fields.map((field, y) => {
      const minRows = prop('min-rows', field)
      const props$ = rxJust({ ...field, minRows, fieldGroupIndex: i, fieldIndex: y })
      return {
        ...field,
        inputField: inputField({DOM, props$}, field.id)
      }
    })
  }), page.fieldGroups)
  const newPage = { ...page, fieldGroups }
  return newPage
}

const makeInputFieldAction$ = (actionKey, amendedPage$) => {
  const getActionFromInputFields$ = actionKey => page => {
    const getInputFieldAction = path(['inputField', actionKey])
    const getActionsFromFields = compose(map(getInputFieldAction), prop('fields'))
    const getActionsFromFieldGroups = compose(flatten, map(getActionsFromFields), prop('fieldGroups'))
    const actions = getActionsFromFieldGroups(page)
    const action$ = merge(actions)
    return action$
  }
  const inputFieldAction$ = flatMapLatest(getActionFromInputFields$(actionKey), amendedPage$)
  return inputFieldAction$
}

const main = (DOM, props$) => {
  const isFormPage = compose(equals('step'), prop('type'))
  const formPage$ = filter(isFormPage, props$)
  const amendedPage$ = map(amendPageWithChildren(DOM), formPage$)
  const vTree$ = view(amendedPage$)
  const inputFieldEdit$ = makeInputFieldAction$('edit$', amendedPage$)
  return {
    DOM: vTree$,
    inputFieldEdit$: inputFieldEdit$
  }
}

export default main
