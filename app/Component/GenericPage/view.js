import {h} from '@cycle/dom'
import R from 'ramda'

const {div, h2} = require("hyperscript-helpers")(h)

const view = R.map(props =>
  div([
    h2('.mega.textCenter.tr1', props.title),
    div('.h3.thin.textCenter.tr2', props.subtitle)
  ])
)

export default view
