import R from 'ramda'
import H from '../../helpers'
import U from '../../utils'
import view from './view'
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
  const proxyFormFieldEdit$ = new Rx.ReplaySubject(1)
  const amendedProps$ = R.map(amendPropsWithChildren(DOM), props$).shareReplay(1)
  const state$ = model(amendedProps$, proxyFormFieldEdit$)
  const vTree$ = view(state$)
  const formFieldEdit$ = makeFormFieldAction$('edit$', amendedProps$)
  replicateStream(formFieldEdit$, proxyFormFieldEdit$)
  return {
    DOM: vTree$,
    page$: state$
  }
}

export default main
