import {compose, map, prop, assoc} from 'ramda'
import {defaultState} from './model'

const eventToFieldInput = ev => ({ key: ev.target.id, val: ev.target.value })

const resToState = res => compose(
  assoc('totalSteps', toString(res.body.steps.length)),
  assoc('steps', res.body.steps),
  assoc('loading', false),
  assoc('routes', map(prop('slug'), res.body.steps))
)(defaultState)

const intent = (sources) => ({
  fieldInput$: map(eventToFieldInput, sources.DOM.select('input').events('input')),
  initState$: map(resToState, sources.HTTP.mergeAll()),
  routeChange$: sources.Route,
  postState$: sources.DOM.select('.continue').events('click')
})

export default intent
