/** @jsx hJSX */
import {hJSX} from '@cycle/dom'
import {combineLatest} from '../../helpers'
import {path, map, nth} from 'ramda'

// const view = (contentVTree$, footerVTree$) =>
//   combineLatest(contentVTree$, footerVTree$, (contentVTree, footerVTree) => {
//     return (
//       <div className="container page text-center">
//         {contentVTree}
//         {footerVTree}
//       </div>
//     )
//   })

const renderStep = step => {
  const fields = map(path(['inputField', 'DOM']), step.fields)
  return (
    <div>
      <h1>{step.title}</h1>
      <p>{step.subtitle}</p>
      {fields}
    </div>
  )
}

const view = map(state => {
  const step = nth(state.activeStep, state.steps)

  return (
    <div className="container page text-center">
      {renderStep(step)}
    </div>
  )
})

export default view
