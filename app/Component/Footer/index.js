import Rx from 'rx'
import view from './view'

const main = props$ => {
  const vTree$ = view(props$)
  return {
    DOM: vTree$
  }
}

export default main
