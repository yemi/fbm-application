/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {prop, map, path} from 'ramda'

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
      <form className="cell--xs center">
        {fieldGroups}
      </form>
    </div>
  )
}

const renderGenericPage = page =>
  <div>
    <h2 className="mega textCenter tr1">{page.title}</h2>
    <div className="h3 thin textCenter tr2">{page.subtitle}</div>
  </div>

const renderPage = state => {
  const activePage = prop(state.activeRoute, state.pages)
  console.log(activePage.type)
  switch (activePage.type) {
    case 'generic': return renderGenericPage(activePage);
    case 'step': return renderFormPage(activePage);
  }
}

export default renderPage
