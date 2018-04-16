var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn
var collect = require('collect-stream')

function wrapData (data, cb) {
  var p = spawn('sbot', ['blobs.add'])
  p.stdin.end(data)
  collect(p.stdout, function (err, res) {
    cb(err, res ? res.toString().trim() : undefined)
  })
}

function wrapFile (filename, cb) {
  console.log('wrapping', filename)
  var data = fs.readFileSync(filename, 'utf-8')
  wrapData(data, cb)
}

function wrapDirRec (dirname, cb) {
  console.log('wrapping', dirname)

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
      var name = name.local
      var stat = fs.statSync(fullname)
      if (stat.isDirectory()) {
        wrapDirRec(fullname, function (err, hash) {
          if (err) return done(err)
          res.links[name] = hash
          done()
        })
      } else if (stat.isFile()) {
        wrapFile(fullname, function (err, hash) {
          if (err) return done(err)
          res.links[name] = hash
          done()
        })
      } else {
        console.log('skip', name)
        done()
      }
    })

    done()

    var error
    function done (err) {
      if (err) error = err
      console.log('pending', pending-1)
      if (--pending) return
      if (error) return cb(error)

      console.log('done')
      wrapData(JSON.stringify(res), cb)
    }
  })
}

if (!process.argv[2]) {
  console.error('USAGE: ssb-webify FILE|DIR')
  process.exit(1)
}

wrapDirRec(process.argv[2], function (err, hash) {
  console.log(hash, encodeURIComponent(hash))
})
