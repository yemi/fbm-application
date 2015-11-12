import {h} from '@cycle/dom'
import R from 'ramda'
import U from '../../utils'

const {footer, button, div, a, span} = require("hyperscript-helpers")(h)

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
  div('.mb20', [
    span('Oops! Something went wrong with the information you entered.'),
    a({ href: '#' }, 'Please take care of it now.')
  ]
)

const renderStepIndicator = props => {
  const activeStep = props.activeStep + 1
  return (
    span('.h5.medium.colorSubdue.mh20',
      `${activeStep} of ${props.totalSteps}`
    )
  )
}

const renderDisabledButton = text => span('.button.button--disabled', text)

const renderLinkButton = (text, url, extraClasses = '') => a(`.button${extraClasses}`, { href: url }, text)

const renderPrevButton = props => {
  const prevStepUrl = getUrlToStep(props.activeStep - 1, props)
  return props.activeStep === 0 ? null : renderLinkButton('Back', prevStepUrl, '.button--secondary')
}

const renderNextStepButton = props => {
  const nextStepUrl = getUrlToStep(props.activeStep + 1, props)
  return props.canContinue 
    ? renderLinkButton('Continue', nextStepUrl) 
    : renderDisabledButton('Continue')
}

const renderSubmitButton = props => {
  const buttonText = props.isLoading ? 'Loading...' : 'Submit application'
  return props.canContinue && R.not(props.isLoading)
    ? button('#submit.button', buttonText)
    : renderDisabledButton(buttonText)
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
    footer('.textCenter.bgWhite.pv20', [
      postErrors,
      prevButton,
      stepIndicator,
      nextButton
    ])
  )
})

export default view
