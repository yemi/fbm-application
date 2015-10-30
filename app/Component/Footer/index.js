/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {isEmpty, identity, max, min, nth, map, compose, prop} from 'ramda'
import {log} from 'util'

const getPathToStep = (step, state) => {
  const maxStep = state.steps.length - 1
  const minStep = 0
  const safeStep = step > state.activeStep ? min(maxStep, step) : max(minStep, step)
  const getStepPath = compose(prop('slug'), nth(safeStep))
  const stepPath = getStepPath(state.steps)
  return stepPath
}

const getPrevAndNextLinks = state => {
  const prevStepPath = getPathToStep(state.activeStep - 1, state)
  const nextStepPath = getPathToStep(state.activeStep + 1, state)
  const prevLink = `#${prevStepPath}`
  const nextLink = `#${nextStepPath}`
  return {prevLink, nextLink}
}

const renderPostErrors = ({postErrors}) =>
  <div className="mb20">
    Oops! Something went wrong with the information you entered. <a href="#">Please take care of it now.</a>
  </div>

const renderStepIndicator = state => {
  const activeStep = state.activeStep + 1
  const totalSteps = state.totalSteps
  return (
    <span className="h5 medium colorSubdue mh20">
      {activeStep} of {totalSteps}
    </span>
  )
}

const prevLinkClasses = "button button--secondary mh05"

const getNextLinkClasses = state => {
  const disabled = state.canContinue ? '' : 'button--disabled'
  return `button ${disabled} mh05`
}

const getNextLinkId = state => {
  const activeStepIsLastStep = state.activeStep === state.totalSteps - 1
  const id = activeStepIsLastStep ? 'submit' : 'stepContinue'
  return id
}

const renderFooter = state => {
  const {prevLink, nextLink} = getPrevAndNextLinks(state)
  const postErrors = isEmpty(state.postErrors) ? null : renderPostErrors(state)
  const stepIndicator = renderStepIndicator(state)
  const nextLinkClasses = getNextLinkClasses(state)
  const nextLinkId = getNextLinkId(state)
  return (
    <footer className="textCenter bgWhite pv20">
      {postErrors}
      <a href={prevLink}
         id="stepBack"
         className={prevLinkClasses}>
        Back
      </a>
      {stepIndicator}
      <a href={state.canContinue ? nextLink : '#'}
         id={nextLinkId}
         className={nextLinkClasses}>
        Continue
      </a>
    </footer>
  )
}

export default renderFooter
