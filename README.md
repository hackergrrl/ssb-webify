# ssb-webify

> convert a local file hierarchy into a scuttlebutt website

## CLI Usage

```
$ npm install --global ssb-webify

$ ssb-webify
USAGE: ssb-webify FILE|DIRECTORY

$ ssb-webify index.html
HASH    : &WIH358/QoylVo+BwGxUWu3WzyaVVAMYvFnhdzGG8Uwo=.sha256
WEB HASH: %26WIH358%2FQoylVo%2BBwGxUWu3WzyaVVAMYvFnhdzGG8Uwo%3D.sha256
```

You can plug the resulting web hash into any ssb software that supports
websites (currently only [patchfoo](https://github.com/ssbc/patchfoo)) and view
it.

The [resolver](https://github.com/noffle/ssb-web-resolver) takes care of
recursively looking up blobs to find the webpage or file you want to view and
calls it up from your local `sbot`.

## API

You can also use this module as an API.

```js
var webify = require('ssb-webify')
```

### webify(filename, cb)

Recursively *webify* `filename`, which is a file or directory. `cb` is called
with the signature `cb(err, id)`, where `id` is the ssb blob id of the website
root.

## License

ISC
