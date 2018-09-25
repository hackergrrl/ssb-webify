var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn
var collect = require('collect-stream')
var once = require('once')

module.exports = {
  init: init,
  publish: publish,
  update: update
}

function init (cb) {
  cb = once(cb)

  var p = spawn('sbot', 'publish --type web-init'.split(' '))

  collect(p.stdout, function (err, res) {
    if (err) return cb(err)
    try {
      var json = JSON.parse(res)
      return cb(null, json.key)
    } catch (e) {
      return cb(e)
    }
  })

  p.once('exit', function (code) {
    if (code) cb(new Error('sbot error code ' + code))
  })
}

function publish (filename, cb) {
  if (fs.statSync(filename).isDirectory()) {
    wrapDirRec(filename, done)
  } else {
    wrapFile(filename, done)
  }

  function done (err, hash) {
    if (err) return cb(err)
    cb(null, hash)
  }
}

function update (site, hash, cb) {
  var args = ['publish', '--type', 'web-root', '--root', hash, '--site', site]
  spawn('sbot', args)
    .once('exit', cb)
}

function wrapData (data, cb) {
  var p = spawn('sbot', ['blobs.add'])
  p.stdin.end(data)
  collect(p.stdout, function (err, res) {
    cb(err, res ? res.toString().trim() : undefined)
  })
}

function wrapFile (filename, cb) {
  var data = fs.readFileSync(filename)
  wrapData(data, cb)
}

function wrapDirRec (dirname, cb) {
  fs.readdir(dirname, function (err, names) {
    if (err) return cb(err)

    var fullnames = names
      .filter(function (name) {
        return !name.startsWith('.')
      })
      .map(function (name) {
        return {
          full: path.join(dirname, name),
          local: name
        }
      })

    var res = {
      links: {}
    }

    var pending = fullnames.length + 1

    fullnames.forEach(function (name) {
      var fullname = name.full
      var shortname = name.local
      var stat = fs.statSync(fullname)
      if (stat.isDirectory()) {
        wrapDirRec(fullname, function (err, hash) {
          if (err) return done(err)
          res.links[shortname] = hash
          done()
        })
      } else if (stat.isFile()) {
        wrapFile(fullname, function (err, hash) {
          if (err) return done(err)
          res.links[shortname] = hash
          done()
        })
      } else {
        console.log('skipping', shortname)
        done()
      }
    })

    done()

    var error
    function done (err) {
      if (err) error = err
      if (--pending) return
      if (error) return cb(error)

      wrapData(JSON.stringify(res), cb)
    }
  })
}
