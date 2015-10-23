/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {combineLatest} from '../helpers'
import {path, map, nth} from 'ramda'
import renderStep from '../Component/Step'
import renderFooter from '../Component/Footer'

const view = map(state =>
  <div className="wrapper bgWhite">
    <div className="cell textCenter pv80">
      {renderStep(state)}
      {renderFooter(state)}
    </div>
  </div>
)

export default view
