/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {nth, map} from 'ramda'
import renderField from '../Field'

const renderContent = state$ => {
  const vTree$ = map(state => {
    const step = nth(state.activeStep, state.steps)
    const renderedFields = map(renderField, step.fields)

    return (
      <div>
        <h1>{step.title}</h1>
        <p>{step.subtitle}</p>
        <div>{renderedFields}</div>
      </div>
    )
  }, state$)

  return {
    DOM: vTree$
  }
}

export default renderContent
