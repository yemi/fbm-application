/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {combineLatest} from '../../helpers'
import {path, map, nth} from 'ramda'
import renderStep from '../Step'
import renderFooter from '../Footer'

const view = map(state =>
  <div className="container page text-center">
    {renderStep(state)}
    {renderFooter(state)}
  </div>
)

export default view
