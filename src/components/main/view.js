/** @jsx hJSX */
import {identity, max, min, nth, map, compose, prop} from 'ramda'
import {defaultState} from './model'
import {Maybe} from 'ramda-fantasy'
import {hJSX} from '@cycle/dom'
import {log} from '../../util'

const getLinks = state => {
  const prevStep = max(0, state.currentStep - 1)
  const nextStep = min(state.steps.length - 1, state.currentStep + 1)
  const prevLink = compose(map(prop('slug')), Maybe, nth(prevStep))(state.steps)
  const nextLink = compose(map(prop('slug')), Maybe, nth(nextStep))(state.steps)

  return { prevLink:Maybe.maybe('', identity, prevLink), nextLink:Maybe.maybe('', identity, nextLink) }
}

const renderFields = map(field =>
  <div className="field">
    <div>{field.name}</div>
    <input type="text" value={field.val ? field.val : ''} id={field.key} />
    <div>{field.val}</div>
  </div>
)

const view = $state => $state
  .startWith(defaultState)
  .map(log)
  .map(state => {
    const activeStep = nth(state.currentStep, state.steps)
    const fields = compose(map(prop('fields')), Maybe, nth(state.currentStep))(state.steps)
    const {prevLink, nextLink} = getLinks(state)
    const stepsIndicator = (state.currentStep + 1) + ' of ' + state.totalSteps
    const loadingIndicator = state.loading ? <div className="alert alert-info pos-f-t m-t-lg">Loading</div> : null
    return (
      <div className="container page text-center">
        <h1>{activeStep ? activeStep.title : ''}</h1>
        <div>{Maybe.maybe([], renderFields, fields)}</div>
        <footer className="navbar navbar-fixed-bottom">
          <div className="footer-inner btn-toolbar">
            <a href={'#' + prevLink} className="back btn">Back</a>
            <a href={'#' + nextLink} className="continue btn btn-success">Continue</a>
            <div className="m-t">{stepsIndicator}</div>
            {loadingIndicator}
          </div>
        </footer>
      </div>
    )
  })

export default view
