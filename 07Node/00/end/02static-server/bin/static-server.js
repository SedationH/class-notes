#!/usr/bin/env node

const path = require('path')
const chalk = require('chalk')
const { program } = require('commander')
const pkg = require(path.join(__dirname, '..', 'package.json'))
const StaticServer = require('../index.js')

const DEFAULT_PORT = 3000

program
  .version(pkg.name + '@' + pkg.version)
  .usage('<root_path> [options]')
  .option(
    '-p, --port <n>',
    'the port to listen to for incoming HTTP connections',
    DEFAULT_PORT
  )
  .parse(process.argv)

const rootPath = path.resolve(process.argv[2] || '')

const options = {
  ...program.opts(),
  rootPath,
}

const server = new StaticServer(options)

server.start(() => {
  console.log(chalk.blue('*'), 'Static server successfully started.')
  console.log(
    chalk.blue('*'),
    'Serving files at:',
    chalk.cyan(`http://localhost:${options.port}`)
  )
  console.log(
    chalk.blue('*'),
    'Press',
    chalk.yellow.bold('Ctrl+C'),
    chalk.red.bold('to shutdown.')
  )

  return server
})
