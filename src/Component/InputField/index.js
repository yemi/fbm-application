/** @jsx hJSX */
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import {compose, map, prop, path, pick} from 'ramda'
import {combineLatest, merge, head, concat} from '../../helpers'
import {log} from '../../utils'

const targetValue = path(['target', 'value'])

const intent = (DOM, name = '') => ({
  valueChange$: map(targetValue, DOM.select(`.${name} input`).events('input'))
})

const model = (actions, props$) => {
  const amendedProps$ = combineLatest(props$, actions.valueChange$, (props, newValue) => {
    const errorMessage = props.required && !newValue ? `${props.label} is required` : ''
    const value = newValue
    return { ...props, value, errorMessage }
  })
  return concat(props$, amendedProps$)
}

const view = (name = '') => map(({label, required, type, value, errorMessage}) => (
  <div className={name}>
    <div>{errorMessage || label}</div>
    <input type={type} value={value ? value : ''} />
    <div>{value}</div>
  </div>
))

const inputField = ({DOM, props$}, name = '') => {
  const actions = intent(DOM, name)
  const state$ = model(actions, props$)
  const vtree$ = view(name)(state$)
  return {
    DOM: vtree$,
    edit$: state$.skip(1)
  }
}

export default inputField
