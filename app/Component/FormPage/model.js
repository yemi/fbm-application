import R from 'ramda'
import H from '../helpers'
import U from '../utils'

const model = (props$, actions) => {

  // -- updateField :: FormField -> State -> State
  const updateField = ({value, fieldIndex, fieldGroupIndex, errorMessage}) => state => {
    const fieldsLens = U.lenses.fields(state.activeRoute, fieldGroupIndex)
    const fields = R.view(fieldsLens, state)
    const updateField = field => ({ ...field, value, errorMessage })
    const updatedFields = R.adjust(updateField, fieldIndex, fields)
    const newState = R.set(fieldsLens, updatedFields, state)
    return newState
  }

  // -- updateFieldsErrors :: FormField -> State -> State
  const updateFieldsErrors = ({errorMessage, id}) => state => {
    const fieldsErrors = errorMessage 
      ? R.assoc(id, errorMessage, state.fieldsErrors)
      : R.dissoc(id, state.fieldsErrors)
    const newState = { ...state, fieldsErrors }
    return newState
  }

  // -- allRequiredFieldsHaveValue :: Page -> Bool
  const allRequiredFieldsHaveValue = page => {
    const isFieldValid = field => (field.required && field.value) || R.not(field.required)
    const isFieldGroupValid = R.compose(R.all(isFieldValid), R.prop('fields'))
    const areFieldGroupsValid = R.compose(R.all(R.identity), R.flatten, R.map(isFieldGroupValid))
    return areFieldGroupsValid(page.fieldGroups)
  }

  // -- onFormFieldEdit$ :: Observable (State -> State)
  const onFormFieldEdit$ = R.map(formField =>
    R.compose(updateCanContinue, updateFieldsErrors(formField), updateField(formField))
  , actions.formFieldEdit$)

}

export default model
