/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import R from 'ramda'
import {log, slash} from '../../utils'

const getPathToStep = (targetStepIndex, props) => {
  const maxStepIndex = props.totalSteps - 1
  const minStepIndex = 0
  const safeStepIndex = targetStepIndex > props.activeStep
    ? R.min(maxStepIndex, targetStepIndex)
    : R.max(minStepIndex, targetStepIndex)
  const isPageStep = R.propEq('type', 'step')
  const hasTargetStepIndex = R.compose(R.equals(safeStepIndex), R.prop('index'))
  const getStepPath = R.compose(R.head, R.keys, R.pickBy(R.both(isPageStep, hasTargetStepIndex)))
  const stepPath = getStepPath(props.pages)
  return stepPath
}

const getPrevAndNextUrls = props => {
  const prevStepUrl = slash(getPathToStep(props.activeStep - 1, props))
  const nextStepUrl = slash(getPathToStep(props.activeStep + 1, props))
  return {prevStepUrl, nextStepUrl}
}

const renderPostErrors = ({postErrors}) =>
  <div className="mb20">
    Oops! Something went wrong with the information you entered. <a href="#">Please take care of it now.</a>
  </div>

const renderStepIndicator = props => {
  const activeStep = props.activeStep + 1
  return (
    <span className="h5 medium colorSubdue mh20">
      {activeStep} of {props.totalSteps}
    </span>
  )
}

const getPrevLinkClasses = props => {
  const hidden = props.activeStep === 0 ? 'hidden' : ''
  return `button button--secondary mh05 ${hidden}`
}

const getNextLinkClasses = props => {
  const disabled = props.canContinue ? '' : 'button--disabled'
  return `button ${disabled} mh05`
}

const activeStepIsLastStep = props => props.activeStep === props.totalSteps - 1

const getNextLinkId = props => {
  const id = activeStepIsLastStep(props) ? 'submit' : 'stepContinue'
  return id
}

const view = R.map(props => {
  const {prevStepUrl, nextStepUrl} = getPrevAndNextUrls(props)
  const postErrors = true ? null : renderPostErrors(props) // TODO: Do post error check
  const stepIndicator = renderStepIndicator(props)
  const nextLinkClasses = getNextLinkClasses(props)
  const prevLinkClasses = getPrevLinkClasses(props)
  const nextLinkId = getNextLinkId(props)
  return (
    <footer className="textCenter bgWhite pv20">
      {postErrors}
      <a href={prevStepUrl}
         id="stepBack"
         className={prevLinkClasses}>
        Back
      </a>
      {stepIndicator}
      <a href={props.canContinue && R.not(activeStepIsLastStep(props)) ? nextStepUrl : '#'}
         id={nextLinkId}
         className={nextLinkClasses}>
        Continue
      </a>
    </footer>
  )
})

export default view
