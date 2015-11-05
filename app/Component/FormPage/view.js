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

const view = map(page => {
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
})

export default view
