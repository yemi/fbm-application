/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {nth, map} from 'ramda'
import renderField from '../Field'

const renderContent = state$ => {
  const vTree$ = map(state => {
    const step = nth(state.activeStep, state.steps)
    // const renderedFields = map(renderField, step.fields)
    // <div>{renderedFields}</div>
        // <input-field key="1" label="Weight" unit="kg" min="40" initial="120" max="140" />

    return (
      <div>
        <h1>{step.title}</h1>
        <p>{step.subtitle}</p>
        <input-field id="company-name" label="Company name" type="text" value="valuz" key="1" />
      </div>
    )
  }, state$)

  return {
    DOM: vTree$
  }
}

export default renderContent
