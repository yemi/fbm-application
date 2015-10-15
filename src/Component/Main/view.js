/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {combineLatest} from '../../helpers'

const view = (contentVTree$, footerVTree$) =>
  combineLatest(contentVTree$, footerVTree$, (contentVTree, footerVTree) => {
    return (
      <div className="container page text-center">
        {contentVTree}
        {footerVTree}
      </div>
    )
  })

export default view
