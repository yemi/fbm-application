/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import H from '../helpers'

const view = (footerVTree$, pageVTree$) =>
  H.combineLatest(footerVTree$, pageVTree$, (footerVTree, pageVTree) => {
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
