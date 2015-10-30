/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {nth, map, path} from 'ramda'

const renderFieldGroup = fieldGroup => {
  const fields = map(path(['inputField', 'DOM']), fieldGroup.fields)
  return (
    <div class="inputFieldGroup">
      {fields}
    </div>
  )
}

const renderStep = state => {
  const step = nth(state.activeStep, state.steps)
  const fieldGroups = map(renderFieldGroup, step.fieldGroups)
  return (
    <div>
      <h2 className="mega textCenter tr1">{step.title}</h2>
      <div className="h3 thin textCenter tr2">{step.subtitle}</div>
      <div className="cell--xs center">
        {fieldGroups}
      </div>
    </div>
  )
}

export default renderStep
