import R from 'ramda'
import H from '../../helpers'
import U from '../../utils'
import view from './view'
import updatePage from './updatePage'
import FormField from '../../Widget/FormField'

const amendPropsWithChildren = DOM => props => {
  const fieldGroups = H.mapIndexed((fieldGroup, i) => ({
    ...fieldGroup,
    fields: H.mapIndexed((field, y) => {
      const minRows = R.prop('min-rows', field)
      const props$ = H.rxJust({ ...field, minRows, fieldGroupIndex: i, fieldIndex: y })
      return {
        ...field,
        formField: FormField({DOM, props$}, field.id)
      }
    }, fieldGroup.fields)
  }), props.fieldGroups)
  const newProps = { ...props, fieldGroups }
  return newProps
}

const makeFormFieldAction$ = (actionKey, amendedProps$) => {
  const getActionFromFormFields$ = actionKey => props => {
    const getFormFieldAction = R.path(['formField', actionKey])
    const getActionsFromFields = R.compose(R.map(getFormFieldAction), R.prop('fields'))
    const getActionsFromFieldGroups = R.compose(R.flatten, R.map(getActionsFromFields), R.prop('fieldGroups'))
    const actions = getActionsFromFieldGroups(props)
    const action$ = H.merge(actions)
    return action$
  }
  const formFieldAction$ = H.flatMapLatest(getActionFromFormFields$(actionKey), amendedProps$)
  return formFieldAction$
}

const main = ({DOM, props$}) => {
  const amendedProps$ = R.map(amendPropsWithChildren(DOM), props$).shareReplay(1)
  const formFieldEdit$ = makeFormFieldAction$('edit$', amendedProps$)
  return {
    DOM: view(amendedProps$),
    edit$: H.withLatestFrom(updatePage, formFieldEdit$, props$)
  }
}

export default main
