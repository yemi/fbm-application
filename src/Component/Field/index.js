/** @jsx hJSX */
import {Rx} from '@cycle/core'
import {hJSX} from '@cycle/dom'
import {compose, map, prop} from 'ramda'
import {combineLatest, merge, head, concat} from '../../helpers'
import {log} from '../../utils'

function inputField(responses) {
  function intent(DOM) {
    return {
      valueChange$: DOM.select('.input').events('change')
        .map(ev => ev.target.value)
    }
  }

  function model(context, actions) {
    return context.props.get('*').map(props => ({props}))
  }

  function view(state$) {
    return state$.map(state => {
      let {label, id, key, type, value} = state.props
      return (
        <div className="field" key={key}>
          <div>{label}</div>
          <input type={type} value={value ? value : ''} id={id} />
          <div>{value}</div>
        </div>
      )
    });
  }

  let actions = intent(responses.DOM);
  let vtree$ = view(model(responses, actions));

  return {
    DOM: vtree$,
    events: {
      newValue: actions.valueChange$
    }
  };
}

export default inputField
