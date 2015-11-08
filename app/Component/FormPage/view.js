/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import R from 'ramda'

const renderFieldGroup = fieldGroup => {
  const fields = R.map(R.path(['formField', 'DOM']), fieldGroup.fields)
  return (
    <div class="formFieldGroup">
      {fields}
    </div>
  )
}

const view = R.map(page => {
  const fieldGroups = R.map(renderFieldGroup, page.fieldGroups)
  return (
    <div>
      <h2 className="mega textCenter tr1">{page.title}</h2>
      <div className="h3 thin textCenter tr2">{page.subtitle}</div>
      <form className="cell--xs center">
        {fieldGroups}
      </form>
    </div>
  )
})

export default view
