/** @jsx hJSX */
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import {compose, map, prop} from 'ramda'
import {combineLatest, merge, head, concat} from '../../helpers'
import {log} from '../../utils'

const intent = (DOM, name = '') => ({
  valueChange$: DOM.select(`.${name} input`).events('change')
    .map(ev => ev.target.value).map(log)
})

const model = (props$, actions) => {
  const state$ = props$
  return state$
}

const view = (state$, name = '') => {
  return state$.map(state => {
    const {label, id, required, key, type, value, errorMessage} = state
    return (
      <div className={name}>
        <div>{label}</div>
        <input type={type} value={value ? value : ''} id={id} />
        <div>{value}</div>
      </div>
    )
  })
}

const inputField = ({DOM, props$}, name = '') => {
  const actions = intent(DOM, name)
  const state$ = model(props$, actions)
  const vtree$ = view(state$, name)

  return {
    DOM: vtree$,
    edit$: actions.valueChange$
  }
}

export default inputField
