import * as utils from './utils.js'
import LD from './LanguageDetector.js'

export const LanguageDetector = LD

const getPath = (req) => {
  if (req.path) return req.path
  if (req.raw && req.raw.path) return req.raw.path
  if (req.url) return req.url
  console.log('no possibility found to get path')
}
const getQuery = (req) => {
  if (req.query) return req.query
  if (req.raw && req.raw.query) return req.raw.query
  console.log('no possibility found to get query')
  return {}
}
const getParams = (req) => {
  if (req.params) return req.params
  if (req.raw && req.raw.params) return req.raw.params
  console.log('no possibility found to get params')
  return {}
}
const setHeader = (res, name, value) => {
  if (typeof res.setHeader === 'function' && !res.headersSent) return res.setHeader(name, value)
  if (typeof res.header === 'function') return res.header(name, value)
  if (res.headers && typeof res.headers.set === 'function') return res.headers.set(name, value)
  console.log('no possibility found to set header')
}
const contentType = (res, type) => {
  if (typeof res.contentType === 'function') return res.contentType(type)
  if (typeof res.type === 'function') return res.type(type)
  console.log('no possibility found to set contentType')
}
const status = (res, code) => {
  if (typeof res.status === 'function') return res.status(code)
  // eslint-disable-next-line no-return-assign
  if (res.status) return res.status = code
  console.log('no possibility found to set status')
}
const send = (res, body) => {
  if (typeof res.send === 'function') return res.send(body)
  console.log('no possibility found to send')
}

const extendOptionsWithDefaults = (options) => {
  options.getPath = options.getPath || getPath
  options.getParams = options.getParams || getParams
  options.getQuery = options.getQuery || getQuery
  options.setHeader = options.setHeader || setHeader
  options.contentType = options.contentType || contentType
  options.status = options.status || status
  options.send = options.send || send
  return options
}

export function handle (i18next, options = {}) {
  extendOptionsWithDefaults(options)

  return function i18nextMiddleware (req, res, next) {
    if (typeof options.ignoreRoutes === 'function') {
      if (options.ignoreRoutes(req, res, options, i18next)) {
        return next()
      }
    } else {
      const ignores = (options.ignoreRoutes instanceof Array && options.ignoreRoutes) || []
      for (var i = 0; i < ignores.length; i++) {
        if (options.getPath(req).indexOf(ignores[i]) > -1) return next()
      }
    }

    const i18n = i18next.cloneInstance({ initImmediate: false })
    i18n.on('languageChanged', (lng) => { // Keep language in sync
      req.language = req.locale = req.lng = lng

      if (res.locals) {
        res.locals.language = lng
        res.locals.languageDir = i18next.dir(lng)
      }

      if (lng) {
        options.setHeader(res, 'Content-Language', lng)
      }

      req.languages = i18next.services.languageUtils.toResolveHierarchy(lng)

      if (i18next.services.languageDetector) {
        i18next.services.languageDetector.cacheUserLanguage(req, res, lng)
      }
    })

    let lng = req.lng
    if (!lng && i18next.services.languageDetector) lng = i18next.services.languageDetector.detect(req, res)

    // set locale
    req.language = req.locale = req.lng = lng
    if (lng) {
      options.setHeader(res, 'Content-Language', lng)
    }
    req.languages = i18next.services.languageUtils.toResolveHierarchy(lng)

    // trigger sync to instance - might trigger async load!
    i18n.changeLanguage(lng || i18next.options.fallbackLng[0])

    if (req.i18nextLookupName === 'path' && options.removeLngFromUrl) {
      req.url = utils.removeLngFromUrl(req.url, i18next.services.languageDetector.options.lookupFromPathIndex)
    }

    const t = i18n.t.bind(i18n)
    const exists = i18n.exists.bind(i18n)

    // assert for req
    req.i18n = i18n
    req.t = t

    // assert for res -> template
    if (res.locals) {
      res.locals.t = t
      res.locals.exists = exists
      res.locals.i18n = i18n
      res.locals.language = lng
      res.locals.languageDir = i18next.dir(lng)
    }

    if (i18next.services.languageDetector) i18next.services.languageDetector.cacheUserLanguage(req, res, lng)
    // load resources
    if (!req.lng) return next()
    i18next.loadLanguages(req.lng, () => next())
  }
}

// export function plugin (instance, options, next) {
//   const middleware = handle(options.i18next, options)
//   instance.addHook('preHandler', (request, reply, next) => middleware(request, reply, next))
//   return next()
// }

export function getResourcesHandler (i18next, options = {}) {
  extendOptionsWithDefaults(options)
  const maxAge = options.maxAge || 60 * 60 * 24 * 30

  return function (req, res) {
    if (!i18next.services.backendConnector) {
      options.status(res, 404)
      return options.send(res, 'i18next-express-middleware:: no backend configured')
    }

    const resources = {}

    options.contentType(res, 'application/json')
    if (options.cache !== undefined ? options.cache : process.env.NODE_ENV === 'production') {
      options.setHeader(res, 'Cache-Control', 'public, max-age=' + maxAge)
      options.setHeader(res, 'Expires', (new Date(new Date().getTime() + maxAge * 1000)).toUTCString())
    } else {
      options.setHeader(res, 'Pragma', 'no-cache')
      options.setHeader(res, 'Cache-Control', 'no-cache')
    }

    const languages = options.getQuery(req)[options.lngParam || 'lng'] ? options.getQuery(req)[options.lngParam || 'lng'].split(' ') : []
    const namespaces = options.getQuery(req)[options.nsParam || 'ns'] ? options.getQuery(req)[options.nsParam || 'ns'].split(' ') : []

    // extend ns
    namespaces.forEach(ns => {
      if (i18next.options.ns && i18next.options.ns.indexOf(ns) < 0) i18next.options.ns.push(ns)
    })

    i18next.services.backendConnector.load(languages, namespaces, function () {
      languages.forEach(lng => {
        namespaces.forEach(ns => {
          utils.setPath(resources, [lng, ns], i18next.getResourceBundle(lng, ns))
        })
      })

      options.send(res, resources)
    })
  }
}

export function missingKeyHandler (i18next, options = {}) {
  extendOptionsWithDefaults(options)

  return function (req, res) {
    const lng = options.getParams(req)[options.lngParam || 'lng']
    const ns = options.getParams(req)[options.nsParam || 'ns']

    if (!i18next.services.backendConnector) {
      options.status(res, 404)
      return options.send(res, 'i18next-express-middleware:: no backend configured')
    }

    for (var m in req.body) {
      i18next.services.backendConnector.saveMissing([lng], ns, m, req.body[m])
    }
    options.send(res, 'ok')
  }
}

export function addRoute (i18next, route, lngs, app, verb, fc) {
  if (typeof verb === 'function') {
    fc = verb
    verb = 'get'
  }

  // Combine `fc` and possible more callbacks to one array
  var callbacks = [fc].concat(Array.prototype.slice.call(arguments, 6))

  for (var i = 0, li = lngs.length; i < li; i++) {
    var parts = String(route).split('/')
    var locRoute = []
    for (var y = 0, ly = parts.length; y < ly; y++) {
      var part = parts[y]
      // if the route includes the parameter :lng
      // this is replaced with the value of the language
      if (part === ':lng') {
        locRoute.push(lngs[i])
      } else if (part.indexOf(':') === 0 || part === '') {
        locRoute.push(part)
      } else {
        locRoute.push(i18next.t(part, { lng: lngs[i] }))
      }
    }

    var routes = [locRoute.join('/')]
    app[verb || 'get'].apply(app, routes.concat(callbacks))
  }
}

export default {
  // plugin,
  handle,
  getResourcesHandler,
  missingKeyHandler,
  addRoute,
  LanguageDetector
}
