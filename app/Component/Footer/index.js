/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {isEmpty, identity, max, min, nth, map, compose, prop} from 'ramda'
import {log, slash} from '../../utils'

const getPathToStep = (step, state) => {
  const maxStep = state.steps.length - 1
  const minStep = 0
  const safeStep = step > state.activeStep ? min(maxStep, step) : max(minStep, step)
  const getStepPath = compose(prop('slug'), nth(safeStep))
  const stepPath = getStepPath(state.steps)
  return stepPath
}

const getPrevAndNextUrls = state => {
  const prevStepUrl = slash(getPathToStep(state.activeStep - 1, state))
  const nextStepUrl = slash(getPathToStep(state.activeStep + 1, state))
  return {prevStepUrl, nextStepUrl}
}

const renderPostErrors = ({postErrors}) =>
  <div className="mb20">
    Oops! Something went wrong with the information you entered. <a href="#">Please take care of it now.</a>
  </div>

const renderStepIndicator = state => {
  const activeStep = state.activeStep + 1
  const totalSteps = state.steps.length
  return (
    <span className="h5 medium colorSubdue mh20">
      {activeStep} of {totalSteps}
    </span>
  )
}

const getPrevLinkClasses = state => {
  const hidden = state.activeStep === 0 ? 'hidden' : ''
  return `button button--secondary mh05 ${hidden}`
}

const getNextLinkClasses = state => {
  const disabled = state.canContinue ? '' : 'button--disabled'
  return `button ${disabled} mh05`
}

const getNextLinkId = state => {
  const totalSteps = state.steps.length
  const activeStepIsLastStep = state.activeStep === totalSteps - 1
  const id = activeStepIsLastStep ? 'submit' : 'stepContinue'
  return id
}

const renderFooter = state => {
  const {prevStepUrl, nextStepUrl} = getPrevAndNextUrls(state)
  const postErrors = true ? null : renderPostErrors(state) // TODO: Do post error check
  const stepIndicator = renderStepIndicator(state)
  const nextLinkClasses = getNextLinkClasses(state)
  const prevLinkClasses = getPrevLinkClasses(state)
  const nextLinkId = getNextLinkId(state)
  return (
    <footer className="textCenter bgWhite pv20">
      {postErrors}
      <a href={prevStepUrl}
         id="stepBack"
         className={prevLinkClasses}>
        Back
      </a>
      {stepIndicator}
      <a href={state.canContinue ? nextStepUrl : '#'}
         id={nextLinkId}
         className={nextLinkClasses}>
        Continue
      </a>
    </footer>
  )
}

export default renderFooter
