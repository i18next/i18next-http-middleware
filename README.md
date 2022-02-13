# Introduction

[![Actions](https://github.com/i18next/i18next-http-middleware/workflows/node/badge.svg)](https://github.com/i18next/i18next-http-middleware/actions?query=workflow%3Anode)
[![Actions deno](https://github.com/i18next/i18next-http-middleware/workflows/deno/badge.svg)](https://github.com/i18next/i18next-http-middleware/actions?query=workflow%3Adeno)
[![Travis](https://img.shields.io/travis/i18next/i18next-http-middleware/master.svg?style=flat-square)](https://travis-ci.org/i18next/i18next-http-middleware)
[![npm version](https://img.shields.io/npm/v/i18next-http-middleware.svg?style=flat-square)](https://www.npmjs.com/package/i18next-http-middleware)

This is a middleware to be used with Node.js web frameworks like express or Fastify and also for Deno.

It's based on the deprecated [i18next-express-middleware](https://github.com/i18next/i18next-express-middleware) and can be used as a drop-in replacement.
_It's not bound to a specific http framework anymore._

## Advice:

To get started with server side internationalization, you may also have a look at [this blog post](https://dev.to/adrai/how-does-server-side-internationalization-i18n-look-like-5f4c) also using [using i18next-http-middleware](https://dev.to/adrai/how-does-server-side-internationalization-i18n-look-like-5f4c#ssr).

# Getting started

```bash
# npm package
$ npm install i18next-http-middleware
```

## wire up i18next to request object

```js
var i18next = require('i18next')
var middleware = require('i18next-http-middleware')
var express = require('express')

i18next.use(middleware.LanguageDetector).init({
  preload: ['en', 'de', 'it'],
  ...otherOptions
})

var app = express()
app.use(
  middleware.handle(i18next, {
    ignoreRoutes: ['/foo'] // or function(req, res, options, i18next) { /* return true to ignore */ }
  })
)

// in your request handler
app.get('myRoute', (req, res) => {
  var lng = req.language // 'de-CH'
  var lngs = req.languages // ['de-CH', 'de', 'en']
  req.i18n.changeLanguage('en') // will not load that!!! assert it was preloaded

  var exists = req.i18n.exists('myKey')
  var translation = req.t('myKey')
})

// in your views, eg. in pug (ex. jade)
div = t('myKey')
```

### Fastify usage

```js
var i18next = require('i18next')
var middleware = require('i18next-http-middleware')
var fastify = require('fastify')

i18next.use(middleware.LanguageDetector).init({
  preload: ['en', 'de', 'it'],
  ...otherOptions
})

var app = fastify()
app.register(i18nextMiddleware.plugin, {
  i18next,
  ignoreRoutes: ['/foo'] // or function(req, res, options, i18next) { /* return true to ignore */ }
})
// or
// app.addHook('preHandler', i18nextMiddleware.handle(i18next, {
//   ignoreRoutes: ['/foo'] // or function(req, res, options, i18next) { /* return true to ignore */ }
// }))

// in your request handler
app.get('myRoute', (request, reply) => {
  var lng = request.language // 'de-CH'
  var lngs = v.languages // ['de-CH', 'de', 'en']
  request.i18n.changeLanguage('en') // will not load that!!! assert it was preloaded

  var exists = request.i18n.exists('myKey')
  var translation = request.t('myKey')
})
```

### Hapi usage

```js
const i18next = require('i18next')
const middleware = require('i18next-http-middleware')
const Hapi = require('@hapi/hapi')

i18next.use(middleware.LanguageDetector).init({
  preload: ['en', 'de', 'it'],
  ...otherOptions
})

const server = Hapi.server({
  port: port,
  host: '0.0.0.0',

const app = fastify()

await app.register({
  plugin: i18nextMiddleware.hapiPlugin,
  options: {
    i18next,
    ignoreRoutes: ['/foo'] // or function(req, res, options, i18next) { /* return true to ignore
  }
})

// in your request handler
app.route({
  method: 'GET',
  path: '/myRoute',
  handler: (request, h) => {
    var lng = request.language // 'de-CH'
    var lngs = v.languages // ['de-CH', 'de', 'en']
    request.i18n.changeLanguage('en') // will not load that!!! assert it was preloaded

    var exists = request.i18n.exists('myKey')
    var translation = request.t('myKey')
  }
})

```

### Deno usage

#### abc

```js
import i18next from 'https://deno.land/x/i18next/index.js'
import Backend from 'https://cdn.jsdelivr.net/gh/i18next/i18next-fs-backend/index.js'
import i18nextMiddleware from 'https://deno.land/x/i18next_http_middleware/index.js'
import { Application } from 'https://deno.land/x/abc/mod.ts'
import { config } from 'https://deno.land/x/dotenv/dotenv.ts'

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    // debug: true,
    backend: {
      // eslint-disable-next-line no-path-concat
      loadPath: 'locales/{{lng}}/{{ns}}.json',
      // eslint-disable-next-line no-path-concat
      addPath: 'locales/{{lng}}/{{ns}}.missing.json'
    },
    fallbackLng: 'en',
    preload: ['en', 'de']
  })

const port = config.PORT || 8080
const app = new Application()
const handle = i18nextMiddleware.handle(i18next)
app.use((next) => (c) => {
  handle(c.request, c.response, () => {})
  return next(c)
})
app.get('/', (c) => c.request.t('home.title'))
await app.start({ port })
```

#### ServestJS

```js
import i18next from 'https://deno.land/x/i18next/index.js'
import Backend from 'https://cdn.jsdelivr.net/gh/i18next/i18next-fs-backend/index.js'
import i18nextMiddleware from 'https://deno.land/x/i18next_http_middleware/index.js'
import { createApp } from 'https://servestjs.org/@v1.0.0-rc2/mod.ts'
import { config } from 'https://deno.land/x/dotenv/dotenv.ts'

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    // debug: true,
    backend: {
      // eslint-disable-next-line no-path-concat
      loadPath: 'locales/{{lng}}/{{ns}}.json',
      // eslint-disable-next-line no-path-concat
      addPath: 'locales/{{lng}}/{{ns}}.missing.json'
    },
    fallbackLng: 'en',
    preload: ['en', 'de']
  })

const port = config.PORT || 8080
const app = createApp()
app.use(i18nextMiddleware.handle(i18next))
app.get('/', async (req) => {
  await req.respond({
    status: 200,
    headers: new Headers({
      'content-type': 'text/plain'
    }),
    body: req.t('home.title')
  })
})
await app.listen({ port })
```

## add routes

```js
// missing keys make sure the body is parsed (i.e. with [body-parser](https://github.com/expressjs/body-parser#bodyparserjsonoptions))
app.post('/locales/add/:lng/:ns', middleware.missingKeyHandler(i18next))

// multiload backend route
app.get('/locales/resources.json', middleware.getResourcesHandler(i18next))
// can be used like:
// GET /locales/resources.json
// GET /locales/resources.json?lng=en
// GET /locales/resources.json?lng=en&ns=translation
```

## add localized routes

You can add your routes directly to the express app

```js
var express = require('express'),
  app = express(),
  i18next = require('i18next'),
  FilesystemBackend = require('i18next-fs-backend'),
  i18nextMiddleware = require('i18next-http-middleware'),
  port = 3000

i18next
  .use(i18nextMiddleware.LanguageDetector)
  .use(FilesystemBackend)
  .init({ preload: ['en', 'de', 'it'], ...otherOptions }, () => {
    i18nextMiddleware.addRoute(
      i18next,
      '/:lng/key-to-translate',
      ['en', 'de', 'it'],
      app,
      'get',
      (req, res) => {
        //endpoint function
      }
    )
  })
app.use(i18nextMiddleware.handle(i18next))
app.listen(port, () => {
  console.log('Server listening on port', port)
})
```

or to an express router

```js
var express = require('express'),
  app = express(),
  i18next = require('i18next'),
  FilesystemBackend = require('i18next-fs-backend'),
  i18nextMiddleware = require('i18next-http-middleware'),
  router = require('express').Router(),
  port = 3000

i18next
  .use(i18nextMiddleware.LanguageDetector)
  .use(FilesystemBackend)
  .init({ preload: ['en', 'de', 'it'], ...otherOptions }, () => {
    i18nextMiddleware.addRoute(
      i18next,
      '/:lng/key-to-translate',
      ['en', 'de', 'it'],
      router,
      'get',
      (req, res) => {
        //endpoint function
      }
    )
    app.use('/', router)
  })
app.use(i18nextMiddleware.handle(i18next))
app.listen(port, () => {
  console.log('Server listening on port', port)
})
```

## custom http server

Define your own functions to handle your custom request or response

```js
middleware.handle(i18next, {
  getPath: (req) => req.path,
  getUrl: (req) => req.url,
  setUrl: (req, url) => (req.url = url),
  getQuery: (req) => req.query,
  getParams: (req) => req.params,
  getBody: (req) => req.body,
  setHeader: (res, name, value) => res.setHeader(name, value),
  setContentType: (res, type) => res.contentType(type),
  setStatus: (res, code) => res.status(code),
  send: (res, body) => res.send(body)
})
```

## language detection

Detects user language from current request. Comes with support for:

- path
- cookie
- header
- querystring
- session

Based on the i18next language detection handling: https://www.i18next.com/misc/creating-own-plugins#languagedetector

Wiring up:

```js
var i18next = require('i18next')
var middleware = require('i18next-http-middleware')

i18next.use(middleware.LanguageDetector).init(i18nextOptions)
```

As with all modules you can either pass the constructor function (class) to the i18next.use or a concrete instance.

## Detector Options

```js
{
  // order and from where user language should be detected
  order: [/*'path', 'session', */ 'querystring', 'cookie', 'header'],

  // keys or params to lookup language from
  lookupQuerystring: 'lng',
  lookupCookie: 'i18next',
  lookupHeader: 'accept-language',
  lookupHeaderRegex: /(([a-z]{2})-?([A-Z]{2})?)\s*;?\s*(q=([0-9.]+))?/gi,
  lookupSession: 'lng',
  lookupPath: 'lng',
  lookupFromPathIndex: 0,

  // cache user language, you can define if an how the detected language should be "saved" => 'cookie' and/or 'session'
  caches: false, // ['cookie']

  ignoreCase: true, // ignore case of detected language

  // optional expire and domain for set cookie
  cookieExpirationDate: new Date(),
  cookieDomain: 'myDomain',
  cookiePath: '/my/path',
  cookieSecure: true, // if need secure cookie
  cookieSameSite: 'strict' // 'strict', 'lax' or 'none'
}
```

Options can be passed in:

**preferred** - by setting options.detection in i18next.init:

```js
var i18next = require('i18next')
var middleware = require('i18next-http-middleware')

i18next.use(middleware.LanguageDetector).init({
  detection: options
})
```

on construction:

```js
var middleware = require('i18next-http-middleware')
var lngDetector = new middleware.LanguageDetector(null, options)
```

via calling init:

```js
var middleware = require('i18next-http-middleware')

var lngDetector = new middleware.LanguageDetector()
lngDetector.init(options)
```

## Adding own detection functionality

### interface

```js
module.exports = {
  name: 'myDetectorsName',

  lookup: function (req, res, options) {
    // options -> are passed in options
    return 'en'
  },

  cacheUserLanguage: function (req, res, lng, options) {
    // options -> are passed in options
    // lng -> current language, will be called after init and on changeLanguage
    // store it
  }
}
```

### adding it

```js
var i18next = require('i18next')
var middleware = require('i18next-http-middleware')

var lngDetector = new middleware.LanguageDetector()
lngDetector.addDetector(myDetector)

i18next.use(lngDetector).init({
  detection: options
})
```

---

<h3 align='center'>Gold Sponsors</h3>

<p align='center'>
  <a href='https://locize.com/' target='_blank'>
    <img src='https://raw.githubusercontent.com/i18next/i18next/master/assets/locize_sponsor_240.gif' width='240px'>
  </a>
</p>
