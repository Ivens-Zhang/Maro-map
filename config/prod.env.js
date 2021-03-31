'use strict'
const {hostAddress} = require('./getServerIP.js')

module.exports = {
  NODE_ENV: '"production"',
  VUE_APP_IP: `"${hostAddress}"`
}
