import Immutable from 'immutable'

function log (a) { console.log(a); return a }

const fields = [
  {
    name: "Company name",
    key: "company-name",
    val: ""
  },
  {
    name: "Company type",
    key: "company-type",
    val: ""
  },
  {
    name: "Website",
    key: "website",
    val: ""
  }
]

let util = {
  log: log,
  fields: fields
}

export default util = util
