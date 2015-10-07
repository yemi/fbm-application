import {pick, map} from 'ramda'

const localStorageSink = map(pick(['steps']))

export default {localStorageSink}
