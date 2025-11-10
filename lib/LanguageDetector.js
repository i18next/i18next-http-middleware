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
    ignoreCase: true,

    convertDetectedLanguage: (l) => l
  })
}

function getFallbackLngs (fallbackLng, code) {
  if (!fallbackLng) return []
  if (typeof fallbackLng === 'function') fallbackLng = fallbackLng(code)
  if (typeof fallbackLng === 'string') return [fallbackLng]
  if (Array.isArray(fallbackLng)) return fallbackLng

  if (!code) return fallbackLng.default || []

  // assume we have an object defining fallbacks
  let found = fallbackLng[code]
  if (!found) found = fallbackLng.default

  return found || []
}

class LanguageDetector {
  constructor (services, options = {}, allOptions = {}) {
    this.type = 'languageDetector'
    this.detectors = {}

    this.init(services, options, allOptions)
  }

  init (services, options = {}, allOptions = {}) {
    this.services = services
    this.options = utils.defaults(options, this.options || {}, getDefaults())
    this.allOptions = allOptions

    if (typeof this.options.convertDetectedLanguage === 'string' && this.options.convertDetectedLanguage.indexOf('15897') > -1) {
      this.options.convertDetectedLanguage = (l) => l.replace('-', '_')
    }

    this.addDetector(cookieLookup)
    this.addDetector(querystringLookup)
    this.addDetector(pathLookup)
    this.addDetector(headerLookup)
    this.addDetector(sessionLookup)
  }

  addDetector (detector) {
    this.detectors[detector.name] = detector
  }

  detect (req, res, detectionOrder) {
    if (arguments.length < 2) return
    if (!detectionOrder) detectionOrder = this.options.order

    let found
    detectionOrder.forEach(detectorName => {
      if (found || !this.detectors[detectorName]) return

      let detections = this.detectors[detectorName].lookup(req, res, this.options)
      if (!detections) return
      if (!Array.isArray(detections)) detections = [detections]

      detections = detections
        .filter((d) => d !== undefined && d !== null && !utils.hasXSS(d))
        .map((d) => this.options.convertDetectedLanguage(d))

      if (this.services.languageUtils.getBestMatchFromCodes) { // new i18next v19.5.0
        found = this.services.languageUtils.getBestMatchFromCodes(detections)
        if (found) {
          const fallbacks = getFallbackLngs(this.allOptions.fallbackLng, found)
          if (this.options.ignoreCase) {
            if (detections.length === 0 || (detections.map(d => d.toLowerCase()).indexOf(found.toLowerCase()) < 0 && fallbacks.map(d => d.toLowerCase()).indexOf(found.toLowerCase()) > -1)) found = undefined
          } else {
            if (detections.length === 0 || (detections.indexOf(found) < 0 && fallbacks.indexOf(found) > -1)) found = undefined
          }
        }
        if (found) req.i18nextLookupName = detectorName
      } else {
        found = detections.length > 0 ? detections[0] : null // a little backward compatibility
      }
    })

    if (!found) {
      const fallbacks = getFallbackLngs(this.allOptions.fallbackLng)
      if (Array.isArray(fallbacks)) {
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
