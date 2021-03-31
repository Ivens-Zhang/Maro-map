const os = require('os');

function getIP () {
  let platform = os.platform()
  let network = os.networkInterfaces()
  let hostAddress = ''

  if (!network) {
    throw new Error('no network')
  }

  if (platform === 'win32') {
    hostAddress = network['WLAN'].filter(item => item.family === 'IPv4').shift().address
    return hostAddress
  } else {
    hostAddress = network['eth0'].filter(item => item.family === 'IPv4').shift().address
    return hostAddress
  }
}

module.exports = {
  hostAddress: getIP()
}