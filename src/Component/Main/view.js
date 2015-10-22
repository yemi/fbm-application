/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {combineLatest} from '../../helpers'
import {path, map, nth} from 'ramda'
import renderStep from '../Step'
import renderFooter from '../Footer'

const view = map(state =>
  <div className="wrapper bgWhite">
    <div className="cell textCenter pv80">
      {renderStep(state)}
      {renderFooter(state)}
    </div>
  </div>
)

export default view
