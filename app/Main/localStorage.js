import {pick, map} from 'ramda'

const localStorageSink = map(pick(['steps', 'canContinue']))

export default {localStorageSink}