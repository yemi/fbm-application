import {identity, adjust, max, min, nth, gte, toString, findIndex, equals, any, map, reduce, merge, concat, append, replace, compose, match, prop, propEq, eqProps, path, assoc, assocPath} from 'ramda'
import {defaultState} from './model'
import {Maybe} from 'ramda-fantasy'
import {h} from '@cycle/dom'

const getLinks = state => {
  const prevStep = max(0, state.currentStep - 1)
  const nextStep = min(state.steps.length - 1, state.currentStep + 1)
  const prevLink = compose(map(prop('slug')), Maybe, nth(prevStep))(state.steps)
  const nextLink = compose(map(prop('slug')), Maybe, nth(nextStep))(state.steps)

  return { prevLink:Maybe.maybe('', identity, prevLink), nextLink:Maybe.maybe('', identity, nextLink) }
}

const renderFields = map(field =>
  h('div', { className: 'field' }, [
    h('div', field.name), h('input', { type: 'text', value: field.val ? field.val : '', id: field.key }),
    h('div', field.val)
  ]))

const view = $state => $state
  .startWith(defaultState)
  // .map(log)
  .map(state => {
    const activeStep = path(['steps', state.currentStep], state)
    const fields = Maybe(path(['steps', state.currentStep, 'fields'], state))
    const {prevLink, nextLink} = getLinks(state)
    return (
      h('div', { className: 'container page text-center' }, [
        h('h1', activeStep ? activeStep.title : ''),
        h('div', Maybe.maybe([], renderFields, fields)),
        h('footer', { className: 'navbar navbar-dark navbar-fixed-bottom'}, [
          h('div', { className: 'footer-inner btn-toolbar' }, [
            h('a', { className: 'back btn', href: "#" + prevLink }, 'Back'),
            h('a', { className: 'continue btn btn-success', href: "#" + nextLink }, 'Continue'),
            h('div', { className: 'm-t' }, state.loading ? '' : (state.currentStep + 1) + ' of ' + state.totalSteps),
            state.loading ? h('div', { className: 'alert alert-info pos-f-t m-t-lg' }, 'Loooading') : null
          ])
        ])
      ])
    )
  })

export default view
