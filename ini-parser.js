const ini = require('ini')

const IniSyncLoader = (_, content) => {
  console.log(content)

  const config = ini.parse(content)

  // console.log(config)

  config.dns = Object.keys(config.dns)

  return config
}

module.exports = { IniSyncLoader }
