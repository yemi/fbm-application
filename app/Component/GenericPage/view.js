/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {map} from 'ramda'

const view = map(props =>
  <div>
    <h2 className="mega textCenter tr1">{props.title}</h2>
    <div className="h3 thin textCenter tr2">{props.subtitle}</div>
  </div>
)

export default view
