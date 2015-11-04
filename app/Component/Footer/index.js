/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {not, head, keys, pickBy, isEmpty, identity, max, min, nth, map, compose, both, equals, prop, propEq} from 'ramda'
import {log, slash} from '../../utils'

const getPathToStep = (targetStepIndex, state) => {
  const maxStepIndex = state.totalSteps - 1
  const minStepIndex = 0
  const safeStepIndex = targetStepIndex > state.activeStep
    ? min(maxStepIndex, targetStepIndex)
    : max(minStepIndex, targetStepIndex)
  const isPageStep = propEq('type', 'step')
  const hasTargetStepIndex = compose(equals(safeStepIndex), prop('index'))
  const getStepPath = compose(head, keys, pickBy(both(isPageStep, hasTargetStepIndex)))
  const stepPath = getStepPath(state.pages)
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
  return (
    <span className="h5 medium colorSubdue mh20">
      {activeStep} of {state.totalSteps}
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

const activeStepIsLastStep = state => state.activeStep === state.totalSteps - 1

const getNextLinkId = state => {
  const id = activeStepIsLastStep(state) ? 'submit' : 'stepContinue'
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
      <a href={state.canContinue && not(activeStepIsLastStep(state)) ? nextStepUrl : '#'}
         id={nextLinkId}
         className={nextLinkClasses}>
        Continue
      </a>
    </footer>
  )
}

export default renderFooter
