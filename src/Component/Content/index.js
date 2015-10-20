/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {nth, map} from 'ramda'

const renderFields = field => <input-field className="field"
                                           id={field.id}
                                           errorMessage={field.errorMessage}
                                           required={field.required}
                                           label={field.label}
                                           type={field.type}
                                           value={field.value} />

const renderContent = state$ => {
  const vTree$ = map(state => {
    const step = nth(state.activeStep, state.steps)
    const fields = map(renderFields, step.fields)

    return (
      <div>
        <h1>{step.title}</h1>
        <p>{step.subtitle}</p>
        {fields}
      </div>
    )
  }, state$)

  return {
    DOM: vTree$
  }
}

export default renderContent
