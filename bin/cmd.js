#!/usr/bin/env node

var path = require('path')
var fs = require('fs')
var webify = require('..')
var argv = require('minimist')(process.argv)
var mkdirp = require('mkdirp')
var spawn = require('child_process').spawn

var cmd = argv._[2]
if (!cmd) return printUsageAndDie()

if (cmd === 'publish') {
  if (!argv._[3]) return printUsageAndDie()
  var filename = argv._[3]
  webify.publish(filename, function (err, hash) {
    if (err) throw err
    var keydir = path.join('.ssb-web', 'key')
    console.log('1', keydir)
    if (fs.existsSync(keydir)) {
      console.log('2')
      var key = fs.readFileSync(path.join('.ssb-web', 'key'), 'utf-8')
      fs.writeFileSync(path.join('.ssb-web', 'root'), hash, 'utf-8')
      var args = ['publish', '--type', 'web-root', '--root', hash, '--site', key]
      spawn('sbot', args)
        .once('exit', function (code) {
          if (!code) console.log('Published dynamic ssb-web site:', key, '('+encodeURIComponent(key)+')')
          else console.log('error', code)
        })
    } else {
      console.log('Published static ssb-web site:', hash, '('+encodeURIComponent(hash)+')')
    }
  })
}

if (cmd === 'init') {
  if (fs.existsSync(path.join('.ssb-web', 'key'))) {
    console.log('ERROR: A .ssb-web directory already exists here.')
    process.exit(1)
  }
  webify.init(function (err, key) {
    mkdirp.sync('.ssb-web')
    fs.writeFileSync(path.join('.ssb-web', 'key'), key, 'utf-8')
    console.log('Initialized new ssb-web site:', key, '('+encodeURIComponent(key)+')')
  })
}

function printUsageAndDie () {
  fs.createReadStream(path.join(__dirname, 'USAGE')).pipe(process.stdout)
    .once('end', function () {
      process.exit(0)
    })
}
