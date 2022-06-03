import * as utils from './utils.js'
import LD from './LanguageDetector.js'
import { extendOptionsWithDefaults } from './httpFunctions.js'

export const LanguageDetector = LD

const checkForCombinedReqRes = (req, res, next) => {
  if (!res) {
    if (req.request && req.response) {
      res = req.response
      if (!req.request.ctx) req.request.ctx = req
      req = req.request
      if (!next) next = () => {}
    } else if (req.respond) {
      res = req
      if (!next) next = () => {}
    }
  }
  return { req, res, next }
}

export function handle (i18next, options = {}) {
  extendOptionsWithDefaults(options)

  return function i18nextMiddleware (rq, rs, n) {
    const { req, res, next } = checkForCombinedReqRes(rq, rs, n)

    if (typeof options.ignoreRoutes === 'function') {
      if (options.ignoreRoutes(req, res, options, i18next)) {
        return next()
      }
    } else {
      const ignores =
        (options.ignoreRoutes instanceof Array && options.ignoreRoutes) || []
      for (let i = 0; i < ignores.length; i++) {
        if (options.getPath(req).indexOf(ignores[i]) > -1) return next()
      }
    }

    const i18n = i18next.cloneInstance({ initImmediate: false })
    i18n.on('languageChanged', lng => {
      // Keep language in sync
      req.language = req.locale = req.lng = lng

      if (options.attachLocals) res.locals = res.locals || {}
      if (res.locals) {
        res.locals.language = lng
        res.locals.languageDir = i18next.dir(lng)
      }

      if (lng && options.getHeader(res, 'Content-Language') !== lng) {
        options.setHeader(res, 'Content-Language', lng)
      }

      req.languages = i18next.services.languageUtils.toResolveHierarchy(lng)

      if (i18next.services.languageDetector) {
        i18next.services.languageDetector.cacheUserLanguage(req, res, lng)
      }
    })

    let lng = req.lng
    if (!lng && i18next.services.languageDetector) {
      lng = i18next.services.languageDetector.detect(req, res)
    }

    // set locale
    req.language = req.locale = req.lng = lng
    if (lng && options.getHeader(res, 'Content-Language') !== lng) {
      options.setHeader(res, 'Content-Language', lng)
    }
    req.languages = i18next.services.languageUtils.toResolveHierarchy(lng)

    // trigger sync to instance - might trigger async load!
    i18n.changeLanguage(lng || i18next.options.fallbackLng[0])

    if (req.i18nextLookupName === 'path' && options.removeLngFromUrl) {
      options.setUrl(
        req,
        utils.removeLngFromUrl(
          options.getUrl(req),
          i18next.services.languageDetector.options.lookupFromPathIndex
        )
      )
    }

    const t = i18n.t.bind(i18n)
    const exists = i18n.exists.bind(i18n)

    // assert for req
    req.i18n = i18n
    req.t = t

    // assert for res -> template
    if (options.attachLocals) res.locals = res.locals || {}
    if (res.locals) {
      res.locals.t = t
      res.locals.exists = exists
      res.locals.i18n = i18n
      res.locals.language = lng
      res.locals.languageDir = i18next.dir(lng)
    }

    if (i18next.services.languageDetector) {
      i18next.services.languageDetector.cacheUserLanguage(req, res, lng)
    }
    // load resources
    if (!req.lng) return next()
    i18next.loadLanguages(req.lng, () => next())
  }
}

export function plugin (instance, options, next) {
  options.attachLocals = true
  const middleware = handle(options.i18next, options)
  instance.addHook('preHandler', (request, reply, next) =>
    middleware(request, reply, next)
  )
  return next()
}

export const hapiPlugin = {
  name: 'i18next-http-middleware',
  version: '1',
  register: (server, options) => {
    options.attachLocals = true
    const middleware = handle(options.i18next, {
      ...options
    })
    server.ext('onPreAuth', (request, h) => {
      middleware(
        request,
        request.raw.res || h.response() || request.Response,
        () => h.continue
      )
      return h.continue
    })
  }
}

plugin[Symbol.for('skip-override')] = true

export function getResourcesHandler (i18next, options = {}) {
  extendOptionsWithDefaults(options)
  const maxAge = options.maxAge || 60 * 60 * 24 * 30

  return function (rq, rs) {
    const { req, res } = checkForCombinedReqRes(rq, rs)

    if (!i18next.services.backendConnector) {
      options.setStatus(res, 404)
      return options.send(
        res,
        'i18next-express-middleware:: no backend configured'
      )
    }

    const resources = {}

    options.setContentType(res, 'application/json')
    if (
      options.cache !== undefined
        ? options.cache
        : typeof process !== 'undefined' &&
          process.env &&
          process.env.NODE_ENV === 'production'
    ) {
      options.setHeader(res, 'Cache-Control', 'public, max-age=' + maxAge)
      options.setHeader(
        res,
        'Expires',
        new Date(new Date().getTime() + maxAge * 1000).toUTCString()
      )
    } else {
      options.setHeader(res, 'Pragma', 'no-cache')
      options.setHeader(res, 'Cache-Control', 'no-cache')
    }

    const languages = options.getQuery(req)[options.lngParam || 'lng']
      ? options.getQuery(req)[options.lngParam || 'lng'].split(' ')
      : []
    const namespaces = options.getQuery(req)[options.nsParam || 'ns']
      ? options.getQuery(req)[options.nsParam || 'ns'].split(' ')
      : []

    // extend ns
    namespaces.forEach(ns => {
      if (i18next.options.ns && i18next.options.ns.indexOf(ns) < 0) {
        i18next.options.ns.push(ns)
      }
    })

    i18next.services.backendConnector.load(languages, namespaces, function () {
      languages.forEach(lng => {
        namespaces.forEach(ns => {
          utils.setPath(
            resources,
            [lng, ns],
            i18next.getResourceBundle(lng, ns)
          )
        })
      })
    })

    return options.send(res, resources)
  }
}

export function missingKeyHandler (i18next, options = {}) {
  extendOptionsWithDefaults(options)

  return function (rq, rs) {
    const { req, res } = checkForCombinedReqRes(rq, rs)

    const lng = options.getParams(req)[options.lngParam || 'lng']
    const ns = options.getParams(req)[options.nsParam || 'ns']

    if (!i18next.services.backendConnector) {
      options.setStatus(res, 404)
      return options.send(
        res,
        'i18next-express-middleware:: no backend configured'
      )
    }

    const body = options.getBody(req)

    if (typeof body === 'function') {
      const promise = body()
      if (promise && typeof promise.then === 'function') {
        return new Promise(resolve => {
          promise.then(b => {
            for (const m in b) {
              i18next.services.backendConnector.saveMissing([lng], ns, m, b[m])
            }
            resolve(options.send(res, 'ok'))
          })
        })
      }
    }

    for (const m in body) {
      i18next.services.backendConnector.saveMissing([lng], ns, m, body[m])
    }

    return options.send(res, 'ok')
  }
}

export function addRoute (i18next, route, lngs, app, verb, fc) {
  if (typeof verb === 'function') {
    fc = verb
    verb = 'get'
  }

  // Combine `fc` and possible more callbacks to one array
  const callbacks = [fc].concat(Array.prototype.slice.call(arguments, 6))

  for (let i = 0, li = lngs.length; i < li; i++) {
    const parts = String(route).split('/')
    const locRoute = []
    for (let y = 0, ly = parts.length; y < ly; y++) {
      const part = parts[y]
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

    const routes = [locRoute.join('/')]
    app[verb || 'get'].apply(app, routes.concat(callbacks))
  }
}

export default {
  plugin,
  hapiPlugin,
  handle,
  getResourcesHandler,
  missingKeyHandler,
  addRoute,
  LanguageDetector
}
