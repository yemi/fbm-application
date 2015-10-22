/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {identity, max, min, nth, map, compose, prop} from 'ramda'
import {Maybe} from 'ramda-fantasy'
import {log} from 'util'

const getLinks = state => {
  const prevStep = max(0, state.activeStep - 1)
  const nextStep = min(state.steps.length - 1, state.activeStep + 1)
  const prevLink = compose(map(prop('slug')), Maybe, nth(prevStep))(state.steps)
  const nextLink = compose(map(prop('slug')), Maybe, nth(nextStep))(state.steps)

  return { prevLink:Maybe.maybe('', identity, prevLink), nextLink:Maybe.maybe('', identity, nextLink) }
}

const renderFooter = state => {
  const {prevLink, nextLink} = getLinks(state)
  const stepsIndicator = (state.activeStep + 1) + ' of ' + state.totalSteps
  const loadingIndicator = state.loading ? <div className="alert alert-info pos-f-t m-t-lg">Loading</div> : null

  return (
    <footer className="navbar navbar-fixed-bottom">
      <div className="footer-inner btn-toolbar">
        <a href={'#' + prevLink} className="back btn">Back</a>
        <a href={'#' + nextLink} className={'continue btn btn-success ' + (state.canContinue ? '' : 'disabled')}>Continue</a>
        <div className="m-t">{stepsIndicator}</div>
        {loadingIndicator}
      </div>
    </footer>
  )
}


export default renderFooter
