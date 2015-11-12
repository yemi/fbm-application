import {h} from '@cycle/dom'
import R from 'ramda'

const {div, h2, form} = require("hyperscript-helpers")(h)

const renderFieldGroup = fieldGroup => {
  const fields = R.map(R.path(['formField', 'DOM']), fieldGroup.fields)
  return div('.formFieldGroup', fields)
}

const view = R.map(page => {
  const fieldGroups = R.map(renderFieldGroup, page.fieldGroups)
  return (
    div([
      h2('.mega.textCenter.tr1', page.title),
      div('.h3.thin.textCenter.tr2', page.subtitle),
      form('.cell--xs.center', fieldGroups)
    ])
  )
})

export default view
