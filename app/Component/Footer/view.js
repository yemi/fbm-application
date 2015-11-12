/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import R from 'ramda'
import U from '../../utils'

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
  return U.slash(stepPath)
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

const renderDisabledButton = text => <span className="button button--disabled">{text}</span>

const renderLinkButton = (text, url, extraClasses = '') => <a href={url} className={`button ${extraClasses}`}>{text}</a>

const renderPrevButton = props => {
  const prevStepUrl = getUrlToStep(props.activeStep - 1, props)
  return props.activeStep === 0 ? null : renderLinkButton('Back', prevStepUrl, 'button--secondary')
}

const renderNextStepButton = props => {
  const nextStepUrl = getUrlToStep(props.activeStep + 1, props)
  return props.canContinue 
    ? renderLinkButton('Continue', nextStepUrl) 
    : renderDisabledButton('Continue')
}

const renderSubmitButton = props => {
  const buttonText = props.loading ? 'Loading...' : 'Submit application'
  return props.canContinue
    ? <button id="submit" className="button">{buttonText}</button>
    : renderDisabledButton('Submit application')
}

const activeStepIsLastStep = props => props.activeStep === props.totalSteps - 1

const renderNextButton = props =>
  activeStepIsLastStep(props) 
    ? renderSubmitButton(props) 
    : renderNextStepButton(props)

const view = R.map(props => {
  const postErrors = true ? null : renderPostErrors(props) // TODO: Do post error check
  const stepIndicator = renderStepIndicator(props)
  const prevButton = renderPrevButton(props)
  const nextButton = renderNextButton(props)
  return (
    <footer className="textCenter bgWhite pv20">
      {postErrors}
      {prevButton}
      {stepIndicator}
      {nextButton}
    </footer>
  )
})

export default view
