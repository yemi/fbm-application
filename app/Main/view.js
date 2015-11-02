/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {map} from 'ramda'
import renderPage from '../Component/Page'
import renderFooter from '../Component/Footer'

const view = map(state =>
  <div className="wrapper bgWhite solidTop">
    <div className="cell pv80">
      {renderPage(state)}
      {renderFooter(state)}
    </div>
  </div>
)

export default view
