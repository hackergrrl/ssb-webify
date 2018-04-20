#!/usr/bin/env node

var webify = require('.')

var filename = process.argv[2]
if (!filename) {
  console.error('USAGE: ssb-webify FILE|DIR')
  process.exit(1)
}

webify(filename, function (err, hash) {
  if (err) throw err
  console.log('HASH    : ' + hash)
  console.log('WEB HASH: ' + encodeURIComponent(hash))
})
