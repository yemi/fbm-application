import R from 'ramda'
import U from '../../utils'

// -- updateField :: FormField -> Props -> Props
const updateField = ({value, fieldIndex, fieldGroupIndex, errorMessage}) => props => {
  const fieldsLens = U.lenses.fields(fieldGroupIndex)
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

// -- validatePage :: Props -> Bool
const validatePage = props => {
  const isFieldValid = field => (field.required && field.value) || R.not(field.required)
  const isFieldGroupValid = R.compose(R.all(isFieldValid), R.prop('fields'))
  const areFieldGroupsValid = R.compose(R.all(R.identity), R.flatten, R.map(isFieldGroupValid))
  const isValid = areFieldGroupsValid(props.fieldGroups) && R.isEmpty(props.fieldsErrors)
  const newProps = { ...props, isValid }
  return newProps
}

// -- updatePage :: FormField -> Props -> Props
const updatePage = (formField, props) => {
  const newProps = R.compose(validatePage, updateFieldsErrors(formField), updateField(formField))(props)
  return newProps
}

export default updatePage
