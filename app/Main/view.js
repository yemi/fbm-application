/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {map} from 'ramda'
import renderStep from '../Component/Step'
import renderFooter from '../Component/Footer'

const view = map(state =>
  <div className="wrapper bgWhite solidTop">
    <div className="cell pv80">
      {renderStep(state)}
      {renderFooter(state)}
    </div>
  </div>
)

export default view
