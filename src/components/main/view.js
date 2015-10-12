/** @jsx hJSX */
import {identity, max, min, nth, map, compose, prop} from 'ramda'
import {defaultState} from './model'
import {Maybe} from 'ramda-fantasy'
import {hJSX} from '@cycle/dom'
import {log} from 'util'
import {combineLatest} from '../../helpers'

const view = (contentVTree$, footerVTree$) =>
  combineLatest(contentVTree$, footerVTree$, (contentVTree, footerVTree) => {
    return (
      <div className="container page text-center">
        {contentVTree}
        {footerVTree}
      </div>
    )
  })

export default view
