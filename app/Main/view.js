import {h} from '@cycle/dom'
import H from '../helpers'
import {DONE_ROUTE} from '../config'

const {div} = require("hyperscript-helpers")(h)

const view = (History, footerVTree$, pageVTree$) =>
  H.combineLatest(History, footerVTree$, pageVTree$, (location, footerVTree, pageVTree) => {
    const footer = location.pathname === DONE_ROUTE ? null : footerVTree
    return (
      div('.wrapper.bgWhite.solidTop', [
        div('.cell.pv80', [
          pageVTree,
          footer
        ])
      ])
    )
  })

export default view
