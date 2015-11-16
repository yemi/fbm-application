import R from 'ramda'
import H from '../helpers'
import U from '../utils'

const model = (props$, formFieldEdit$) => {

  // -- updateField :: FormField -> Props -> Props
  const updateField = ({value, fieldIndex, fieldGroupIndex, errorMessage}) => props => {
    const fieldsLens = U.lenses.fields(props.activeRoute, fieldGroupIndex)
    const fields = R.view(fieldsLens, props)
    const updateField = field => ({ ...field, value, errorMessage })
    const updatedFields = R.adjust(updateField, fieldIndex, fields)
    const newProps = R.set(fieldsLens, updatedFields, props)
    return newProps
  }

  // -- updateFieldsErrors :: FormField -> Props -> Props
  const updateFieldsErrors = ({errorMessage, id}) => props => {
    const fieldsErrors = errorMessage 
      ? R.assoc(id, errorMessage, props.fieldsErrors)
      : R.dissoc(id, props.fieldsErrors)
    const newProps = { ...props, fieldsErrors }
    return newProps
  }

  // -- allRequiredFieldsHaveValue :: Page -> Bool
  const allRequiredFieldsHaveValue = page => {
    const isFieldValid = field => (field.required && field.value) || R.not(field.required)
    const isFieldGroupValid = R.compose(R.all(isFieldValid), R.prop('fields'))
    const areFieldGroupsValid = R.compose(R.all(R.identity), R.flatten, R.map(isFieldGroupValid))
    return areFieldGroupsValid(page.fieldGroups)
  }

  // -- amendedProps$ :: Observable Props
  const amendedProps$ = U.combineLatest(props$, formFieldEdit$, (props, formField) => {
    const newProps = R.compose(updateFieldsErrors(formField), updateField(formField))(props)
    return newProps
  })

  return H.concat(props$, amendedProps$)
}

export default model
