/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {map} from 'ramda'

const renderField = field =>
  <div className="field">
    <div>{field.name}</div>
    <input type="text" value={field.val ? field.val : ''} id={field.key} />
    <div>{field.val}</div>
  </div>

export default renderField
