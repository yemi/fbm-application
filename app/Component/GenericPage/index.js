/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {compose, equals, filter, prop, map, path} from 'ramda'

const view = map(props =>
  <div>
    <h2 className="mega textCenter tr1">{props.title}</h2>
    <div className="h3 thin textCenter tr2">{props.subtitle}</div>
  </div>
)

const main = props$ => {
  const isGenericPage = compose(equals('generic'), prop('type'))
  const genericPage$ = filter(isGenericPage, props$)
  const vTree$ = view(genericPage$)
  return {
    DOM: vTree$
  }
}

export default main
