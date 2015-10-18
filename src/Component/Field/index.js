/** @jsx hJSX */
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import {compose, map, prop} from 'ramda'
import {combineLatest, merge, head, concat} from '../../helpers'
import {log} from '../../utils'

function inputField(sources) {
  function intent(DOM) {
    return {
      valueChange$: DOM.select('input').events('change')
        .map(ev => ev.target.value)
    }
  }

  function model(context, actions) {
    const props$ = context.props.get('*')

    return props$.map(props => ({props}))
  }

  function view(state$) {
    return state$.map(state => {
      console.log(state)
      const {label, id, key, type, value} = state.props
      return (
        <div>
          <div>{label}</div>
          <input type={type} value={value ? value : ''} id={id} />
          <div>{value}</div>
        </div>
      )
    })
  }

  const actions = intent(sources.DOM)
  const state$ = model(sources, actions)
  const vtree$ = view(state$)

  return {
    DOM: vtree$,
    events: {
      newValue: state$
    }
  }
}

export default inputField
