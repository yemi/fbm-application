/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import R from 'ramda'
import {log, slash} from '../../utils'

const getUrlToStep = (targetStepIndex, props) => {
  const maxStepIndex = props.totalSteps - 1
  const minStepIndex = 0
  const safeStepIndex = targetStepIndex > props.activeStep
    ? R.min(maxStepIndex, targetStepIndex)
    : R.max(minStepIndex, targetStepIndex)
  const isPageStep = R.propEq('type', 'step')
  const hasTargetStepIndex = R.compose(R.equals(safeStepIndex), R.prop('index'))
  const getStepPath = R.compose(R.head, R.keys, R.pickBy(R.both(isPageStep, hasTargetStepIndex)))
  const stepPath = getStepPath(props.pages)
  return slash(stepPath)
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

const getPrevButtonClasses = props => {
  const hidden = props.activeStep === 0 ? 'hidden' : ''
  return `button button--secondary mh05 ${hidden}`
}

const getNextButtonClasses = props => {
  const disabled = props.canContinue ? '' : 'button--disabled'
  return `button ${disabled} mh05`
}

const renderNextStepButton = props => {
  const nextStepUrl = getUrlToStep(props.activeStep + 1, props)
  const nextButtonClasses = getNextButtonClasses(props)
  return (
    <a href={nextStepUrl}
       id="stepNext"
       className={nextButtonClasses}>
      Continue
    </a>
  )
}

const renderSubmitButton = props => {
  const nextButtonClasses = getNextButtonClasses(props)
  return (
    <button id="submit" className={nextButtonClasses}>
       Submit application
    </button>
  )
}

const activeStepIsLastStep = props => props.activeStep === props.totalSteps - 1

const renderNextButton = props =>
  activeStepIsLastStep(props) ? renderSubmitButton(props) : renderNextStepButton(props)

const view = R.map(props => {
  const prevStepUrl = getUrlToStep(props.activeStep - 1, props)
  const postErrors = true ? null : renderPostErrors(props) // TODO: Do post error check
  const stepIndicator = renderStepIndicator(props)
  const prevButtonClasses = getPrevButtonClasses(props)
  const nextButton = renderNextButton(props)
  return (
    <footer className="textCenter bgWhite pv20">
      {postErrors}
      <a href={prevStepUrl}
         id="stepBack"
         className={prevButtonClasses}>
        Back
      </a>
      {stepIndicator}
      {nextButton}
    </footer>
  )
})

export default view
