const execa = require('execa')
const chalk = require('chalk')

const keychain = {
  askForSudo: async () => {
    try {
      const process = await execa('sudo', ['echo', '"OK"'])
      // console.log(chalk.yellow(process.cmd))
      if (process.stderr) {
        console.log(chalk.red(process.stderr))
        return false
      }
      return true
    } catch (process) {
      // console.log(chalk.red(process.cmd))
      console.log(error.stderr)
      return false
    }
  },
  getKeychain: async domain => {
    try {
      const process = await execa('security', ['list-keychains', '-d', domain])
      // console.log(chalk.yellow(process.cmd))
      return process.stdout.trim().replace(/"/g, '')
    } catch (process) {
      // console.log(chalk.red(process.cmd))
      console.log(error.stderr)
      return false
    }
  },
  find: async (name, keychain) => {
    try {
      const process = await execa('security', [
        'find-certificate',
        '-c',
        name,
        '-p',
        keychain,
      ])
      // console.log(chalk.yellow(process.cmd))
      if (process.stdout.includes('-----BEGIN CERTIFICATE-----')) {
        return true // found cert
      }
      return false
    } catch (process) {
      // console.log(chalk.red(process.cmd))
      if (process.code == 44) {
        return false
      }
      throw new Error(process.stderr)
    }
  },
  add: async (cert, keychain) => {
    try {
      const process = await execa('security', [
        'add-trusted-cert',
        '-r',
        'trustRoot',
        '-k',
        keychain,
        cert,
      ])
      // console.log(chalk.yellow(process.cmd))
      if (process.stderr) {
        return false
      }
      return true
    } catch (error) {
      console.log(error.stderr)
      return false
    }
  },
  remove: async (name, keychain) => {
    try {
      const process = await execa('security', [
        'delete-certificate',
        '-c',
        name,
        '-t',
        keychain,
      ])
      // console.log(chalk.yellow(process.cmd))
      if (process.stderr) {
        return false
      }
      return true
    } catch (error) {
      console.log(error.stderr)
      return false
    }
  },
}

module.exports = keychain
