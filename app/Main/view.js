/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import H from '../helpers'
import {DONE_ROUTE} from '../config'

const view = (History, footerVTree$, pageVTree$) =>
  H.combineLatest(History, footerVTree$, pageVTree$, (location, footerVTree, pageVTree) => {
    const footer = location.pathname === DONE_ROUTE ? null : footerVTree
    return (
      <div className="wrapper bgWhite solidTop">
        <div className="cell pv80">
          {pageVTree}
          {footer}
        </div>
      </div>
    )
  })

export default view
