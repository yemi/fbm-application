/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {nth, map, path} from 'ramda'

const renderStep = state => {
  const step = nth(state.activeStep, state.steps)
  const fields = map(path(['inputField', 'DOM']), step.fields)
  return (
    <div>
      <h1>{step.title}</h1>
      <p>{step.subtitle}</p>
      {fields}
    </div>
  )
}

export default renderStep
