/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {prop, map, path} from 'ramda'

const view = map(state => {
  const activePage = prop(state.activeRoute, state.pages)
  return (
    <div>
      <h2 className="mega textCenter tr1">{activePage.title}</h2>
      <div className="h3 thin textCenter tr2">{activePage.subtitle}</div>
    </div>
  )
})

const main = state$ => {
  const vTree$ = view(state$)
  return {
    DOM: vTree$
  }
}

export default main
