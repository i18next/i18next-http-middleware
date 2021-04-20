import * as utils from './utils.js'
import cookieLookup from './languageLookups/cookie.js'
import querystringLookup from './languageLookups/querystring.js'
import pathLookup from './languageLookups/path.js'
import headerLookup from './languageLookups/header.js'
import sessionLookup from './languageLookups/session.js'
import { extendOptionsWithDefaults } from './httpFunctions.js'

function getDefaults () {
  return extendOptionsWithDefaults({
    order: [/* 'path', 'session' */ 'querystring', 'cookie', 'header'],
    lookupQuerystring: 'lng',
    lookupCookie: 'i18next',
    lookupSession: 'lng',
    lookupFromPathIndex: 0,

    // cache user language
    caches: false, // ['cookie']
    // cookieExpirationDate: new Date(),
    // cookieDomain: 'myDomain'
    // cookiePath: '/my/path'
    cookieSameSite: 'strict',
    ignoreCase: true
  })
}

class LanguageDetector {
  constructor (services, options = {}, allOptions = {}) {
    this.type = 'languageDetector'
    this.async = true
    this.detectors = {}

    this.init(services, options, allOptions)
  }

  init (services, options = {}, allOptions = {}) {
    this.services = services
    this.options = utils.defaults(options, this.options || {}, getDefaults())
    this.allOptions = allOptions

    this.addDetector(cookieLookup)
    this.addDetector(querystringLookup)
    this.addDetector(pathLookup)
    this.addDetector(headerLookup)
    this.addDetector(sessionLookup)
  }

  addDetector (detector) {
    this.detectors[detector.name] = detector
  }

  async detect (req, res, detectionOrder) {
    if (arguments.length < 2) {
      const setLng = req
      setLng()
      return
    }
    if (!detectionOrder) detectionOrder = this.options.order

    let found
    for (const detectorName of detectionOrder) {
      if (found || !this.detectors[detectorName]) break

      let detections = await this.detectors[detectorName].lookup(req, res, this.options)
      if (!detections) continue
      if (!Array.isArray(detections)) detections = [detections]

      detections = detections.filter((d) => d !== undefined && d !== null)

      if (this.services.languageUtils.getBestMatchFromCodes) { // new i18next v19.5.0
        found = this.services.languageUtils.getBestMatchFromCodes(detections)
        if (found) {
          if (this.options.ignoreCase) {
            if (detections.map(d => d.toLowerCase()).indexOf(found.toLowerCase()) < 0) found = undefined
          } else {
            if (detections.indexOf(found) < 0) found = undefined
          }
        }
        if (found) req.i18nextLookupName = detectorName
      } else {
        found = detections.length > 0 ? detections[0] : null // a little backward compatibility
      }
    }

    if (!found) {
      let fallbacks = this.allOptions.fallbackLng
      if (typeof fallbacks === 'string') fallbacks = [fallbacks]
      if (!fallbacks) fallbacks = []

      if (Object.prototype.toString.apply(fallbacks) === '[object Array]') {
        found = fallbacks[0]
      } else {
        found = fallbacks[0] || (fallbacks.default && fallbacks.default[0])
      }
    };

    return found
  }

  cacheUserLanguage (req, res, lng, caches) {
    if (arguments.length < 3) return
    if (!caches) caches = this.options.caches
    if (!caches) return
    caches.forEach(cacheName => {
      if (this.detectors[cacheName] && this.detectors[cacheName].cacheUserLanguage && res.cachedUserLanguage !== lng) {
        this.detectors[cacheName].cacheUserLanguage(req, res, lng, this.options)
        res.cachedUserLanguage = lng
      }
    })
  }
}

LanguageDetector.type = 'languageDetector'

export default LanguageDetector
