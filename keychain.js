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
    } catch (error) {
      // console.log(chalk.red(error.cmd))
      console.log(error.stderr)
      return false
    }
  },
  getKeychain: async (domain, keychain = 'login') => {
    try {
      const process = await execa('security', ['list-keychains', '-d', domain])
      // console.log(chalk.yellow(process.cmd))
      const keychains = process.stdout.split('\n').map(str =>
        str
          .trim()
          .toLowerCase()
          .replace(/"/g, '')
      )
      const activeKeychain = keychains.find(s => s.search(keychain) >= 0)

      if (activeKeychain) {
        return activeKeychain
      } else {
        return false
      }
    } catch (error) {
      // console.log(chalk.red(error.cmd))
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
    } catch (error) {
      // console.log(chalk.red(error.cmd))
      if (error.code == 44) {
        return false
      }
      throw new Error(error.stderr)
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
