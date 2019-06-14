# ssb-webify

> convert a local file hierarchy into a scuttlebutt website

## CLI Usage

### Static website (one-time publish)

```
$ npm install --global ssb-webify

$ mkdir my_site
$ echo '<h1>hello world</h1>' > my_site/index.html

$ ssb-webify publish my_site
Published static website: &WIH358/QoylVo+BwGxUWu3WzyaVVAMYvFnhdzGG8Uwo=.sha256 (%26WIH358%2FQoylVo%2BBwGxUWu3WzyaVVAMYvFnhdzGG8Uwo%3D.sha256)
```

### Dynamic website (can edit; same URL)

```
$ npm install --global ssb-webify

$ mkdir my_site
$ echo '<h1>hello world</h1>' > my_site/index.html

$ ssb-webify init
Initialized new ssb-web site: %aH7TzpolO4FmTQxOVyCeHI2QJavv6amL2xgLBIEk8Ro=.sha256 (%25aH7TzpolO4FmTQxOVyCeHI2QJavv6amL2xgLBIEk8Ro%3D.sha256)

$ ssb-webify publish my_site
Published dynamic website: %aH7TzpolO4FmTQxOVyCeHI2QJavv6amL2xgLBIEk8Ro=.sha256 (%25aH7TzpolO4FmTQxOVyCeHI2QJavv6amL2xgLBIEk8Ro%3D.sha256)

$ echo '<h1>hello world</h1><p>version two</p>' > my_site/index.html

$ ssb-webify publish my_site
Published dynamic website: %aH7TzpolO4FmTQxOVyCeHI2QJavv6amL2xgLBIEk8Ro=.sha256 (%25aH7TzpolO4FmTQxOVyCeHI2QJavv6amL2xgLBIEk8Ro%3D.sha256)
```

You can plug the resulting web hash (the one in parentheses) into any ssb
software that supports websites (currently only
[patchfoo](https://github.com/ssbc/patchfoo) and public
[ssb-viewers](https://github.com/ssbc/ssb-viewer)s) and view it.

The [resolver](https://github.com/noffle/ssb-web-resolver) takes care of
recursively looking up blobs to find the webpage or file you want to view and
calls it up from your local `sbot`.

## API

You can also use this module as an API.

```js
var webify = require('ssb-webify')
```

### webify.publish(filename, cb)

Recursively *webify and publish* `filename`, which is a file or directory. `cb`
is called with the signature `cb(err, id)`, where `id` is the ssb blob id of the
website root.

Right now this only publishes the blobs (ie. a static website).

### webify.init(cb)

Publishes a `web-init` message to sbot and returns the key.

The published message's `content` just looks like

```json
{
  "type": "web-init"
}
```

but its `key` is now the identifier for the mutable website.

### webify.update(siteKey, hash, cb)

Publishes a message updating the website key `siteKey` to the website at `hash`.

For example, creating a dynamic website and updating it might look like this:

```js
webify.init(function (_, key) {
  webify.publish('my_site/', function (_, hash) {
    webify.update(key, hash, function () {
      console.log('done')
    })
  })
})
```

The published message's `content` looks like

```json
{
  "type": "web-root",
  "root": "&9DBDncPbI3cvrGFhpZuF5xNIDlZTRsFLg50CybNuZQs=.sha256",
  "site": "%RzC0zlEBmeGbQNmVvzKXEED9h+nNRTBLgyS3lWg9gSA=.sha256"
}
```

where `root` is the new blob to point the website at, and `site` is the identifier (key) from `webify.init()`.

## License

ISC
