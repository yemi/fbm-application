/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {combineLatest} from '../helpers'

const view = (footerVTree$, pageVTree$) =>
  combineLatest(footerVTree$, pageVTree$, (footerVTree, pageVTree) => {
    return (
      <div className="wrapper bgWhite solidTop">
        <div className="cell pv80">
          {pageVTree}
          {footerVTree}
        </div>
      </div>
    )
  })

export default view
