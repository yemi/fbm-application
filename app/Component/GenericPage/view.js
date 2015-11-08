/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import R from 'ramda'

const view = R.map(props =>
  <div>
    <h2 className="mega textCenter tr1">{props.title}</h2>
    <div className="h3 thin textCenter tr2">{props.subtitle}</div>
  </div>
)

export default view
