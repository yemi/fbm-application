/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {nth, map, path} from 'ramda'

const renderStep = state => {
  const step = nth(state.activeStep, state.steps)
  const fields = map(path(['inputField', 'DOM']), step.fields)
  return (
    <div>
      <h1 className="mega tr1">{step.title}</h1>
      <div className="h3 thin tr2">{step.subtitle}</div>
      <div className="cell--xs center">
        {fields}
      </div>
    </div>
  )
}

export default renderStep
