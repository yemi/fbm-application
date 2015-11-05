/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {map, prop} from 'ramda'
import renderFooter from '../Component/Footer'
import {combineLatest} from '../helpers'

const renderPage = (state, formPageVTree, genericPageVTree) => {
  const activePage = prop(state.activeRoute, state.pages)
  const page = activePage.type === 'step' ? formPageVTree : genericPageVTree
  return page
}

const view = (state$, formPageVTree$, genericPageVTree$) =>
  combineLatest(state$, formPageVTree$, genericPageVTree$, (state, formPageVTree, genericPageVTree) =>
    <div className="wrapper bgWhite solidTop">
      <div className="cell pv80">
        {renderPage(state, formPageVTree, genericPageVTree)}
        {renderFooter(state)}
      </div>
    </div>
  )


export default view
