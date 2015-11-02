/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {prop, nth, map, path} from 'ramda'

const renderFieldGroup = fieldGroup => {
  const fields = map(path(['inputField', 'DOM']), fieldGroup.fields)
  return (
    <div class="inputFieldGroup">
      {fields}
    </div>
  )
}

const renderFormPage = page => {
  const fieldGroups = map(renderFieldGroup, page.fieldGroups)
  return (
    <div>
      <h2 className="mega textCenter tr1">{page.title}</h2>
      <div className="h3 thin textCenter tr2">{page.subtitle}</div>
      <div className="cell--xs center">
        {fieldGroups}
      </div>
    </div>
  )
}

const renderActiveStepPage = state => {
  const page = nth(state.activeStep, state.steps)
  const formPage = renderFormPage(page)
  return formPage
}

const renderStaticPage = state => {
  const page = prop(state.activeRoute.key, state.pages)
  return (
    <div>
      <h2 className="mega textCenter tr1">{page.title}</h2>
      <div className="h3 thin textCenter tr2">{page.subtitle}</div>
    </div>
  )
}

const renderPage = state => {
  switch (state.activeRoute.type) {
    case 'page': return renderStaticPage(state);
    default:
    case 'step': return renderActiveStepPage(state);
  }
}

export default renderPage
