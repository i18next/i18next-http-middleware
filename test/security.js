import expect from 'expect.js'
import i18next from 'i18next'
import * as utils from '../lib/utils.js'
import LanguageDetector from '../lib/LanguageDetector.js'
import { getResourcesHandler, missingKeyHandler } from '../lib/index.js'

// Tests covering the security fixes shipped in 3.9.3.
// See CHANGELOG.md for the associated advisories.

describe('security', () => {
  describe('utils.setPath', () => {
    it('drops writes targeting __proto__, constructor, prototype', () => {
      const target = {}
      utils.setPath(target, ['__proto__', 'polluted'], 'yes')
      utils.setPath(target, ['constructor', 'polluted'], 'yes')
      utils.setPath(target, ['prototype', 'polluted'], 'yes')
      expect(({}).polluted).to.be(undefined)
      expect(Object.prototype.polluted).to.be(undefined)
    })

    it('still writes safe nested paths', () => {
      const target = {}
      utils.setPath(target, ['en', 'common'], { k: 'v' })
      expect(target.en.common.k).to.eql('v')
    })
  })

  describe('utils.sanitizeHeaderValue', () => {
    it('strips CR, LF, NUL and other control characters', () => {
      expect(utils.sanitizeHeaderValue('en\r\nX-Injected: bad')).to.eql('enX-Injected: bad')
      expect(utils.sanitizeHeaderValue('en\u0000')).to.eql('en')
      expect(utils.sanitizeHeaderValue('de-DE')).to.eql('de-DE')
    })

    it('passes non-string values through unchanged', () => {
      expect(utils.sanitizeHeaderValue(undefined)).to.be(undefined)
      expect(utils.sanitizeHeaderValue(null)).to.be(null)
    })
  })

  describe('utils.hasXSS', () => {
    it('detects event handlers regardless of attribute position', () => {
      // regression: /<\s*\w+\s*on\w+\s*=.*?>/i missed these
      expect(utils.hasXSS('<input autofocus onfocus=alert(1)>')).to.be(true)
      expect(utils.hasXSS('<details open ontoggle=alert(1)>')).to.be(true)
      expect(utils.hasXSS('<body id=x onscroll=alert(1)>')).to.be(true)
    })

    it('still rejects obvious script tags and javascript: URIs', () => {
      expect(utils.hasXSS('<script>alert(1)</script>')).to.be(true)
      expect(utils.hasXSS('javascript:alert(1)')).to.be(true)
    })

    it('accepts normal language codes', () => {
      expect(utils.hasXSS('en')).to.be(false)
      expect(utils.hasXSS('de-DE')).to.be(false)
      expect(utils.hasXSS('zh-Hant')).to.be(false)
    })
  })

  describe('missingKeyHandler', () => {
    it('ignores __proto__/constructor/prototype keys in the request body', () => {
      const saved = []
      const fakeI18next = {
        services: {
          backendConnector: {
            saveMissing (lngs, ns, key, value) { saved.push({ lngs, ns, key, value }) }
          }
        }
      }
      const handler = missingKeyHandler(fakeI18next, {
        getParams: () => ({ lng: 'en', ns: 'translation' }),
        getBody: () => ({ key1: 'value1', __proto__: { isAdmin: true }, constructor: 'x', key2: 'value2' }),
        send: (_res, msg) => msg,
        setStatus: () => {}
      })
      handler({}, {})
      const keys = saved.map(s => s.key)
      expect(keys).to.contain('key1')
      expect(keys).to.contain('key2')
      expect(keys).not.to.contain('__proto__')
      expect(keys).not.to.contain('constructor')
      expect(keys).not.to.contain('prototype')
      expect(({}).isAdmin).to.be(undefined)
    })
  })

  describe('utils.isSafeLangIdentifier (strict — for `lng`)', () => {
    it('accepts arbitrary language codes (i18next permits any shape)', () => {
      expect(utils.isSafeLangIdentifier('en')).to.be(true)
      expect(utils.isSafeLangIdentifier('de-DE')).to.be(true)
      expect(utils.isSafeLangIdentifier('en_US')).to.be(true)
      expect(utils.isSafeLangIdentifier('zh-Hant-HK')).to.be(true)
      expect(utils.isSafeLangIdentifier('pirate-speak')).to.be(true)
      expect(utils.isSafeLangIdentifier('my-custom.ns')).to.be(true)
    })

    it('rejects path-traversal and prototype-pollution payloads', () => {
      expect(utils.isSafeLangIdentifier('__proto__')).to.be(false)
      expect(utils.isSafeLangIdentifier('constructor')).to.be(false)
      expect(utils.isSafeLangIdentifier('prototype')).to.be(false)
      expect(utils.isSafeLangIdentifier('../etc/passwd')).to.be(false)
      expect(utils.isSafeLangIdentifier('..')).to.be(false)
      expect(utils.isSafeLangIdentifier('foo/bar')).to.be(false)
      expect(utils.isSafeLangIdentifier('foo\\bar')).to.be(false)
      expect(utils.isSafeLangIdentifier('en\r\nX-Injected: bad')).to.be(false)
      expect(utils.isSafeLangIdentifier('en\u0000')).to.be(false)
      expect(utils.isSafeLangIdentifier('')).to.be(false)
      expect(utils.isSafeLangIdentifier('a'.repeat(200))).to.be(false)
      expect(utils.isSafeLangIdentifier(null)).to.be(false)
      expect(utils.isSafeLangIdentifier({ toString: () => 'en' })).to.be(false)
    })

    it('is still exported as `isSafeIdentifier` for 3.9.3 backwards compat', () => {
      expect(utils.isSafeIdentifier).to.be(utils.isSafeLangIdentifier)
    })
  })

  describe('utils.isSafeNsIdentifier (loose — for `ns`, allows `/`)', () => {
    it('accepts nested namespace names with forward slashes', () => {
      expect(utils.isSafeNsIdentifier('a/b')).to.be(true)
      expect(utils.isSafeNsIdentifier('foo/bar/baz')).to.be(true)
      expect(utils.isSafeNsIdentifier('common')).to.be(true)
    })

    it('still rejects every concrete attack pattern from the 3.9.3 advisory', () => {
      expect(utils.isSafeNsIdentifier('__proto__')).to.be(false)
      expect(utils.isSafeNsIdentifier('..')).to.be(false)
      expect(utils.isSafeNsIdentifier('../etc/passwd')).to.be(false)
      expect(utils.isSafeNsIdentifier('a/../b')).to.be(false)
      expect(utils.isSafeNsIdentifier('foo\\bar')).to.be(false)
      expect(utils.isSafeNsIdentifier('ns\r\n')).to.be(false)
      expect(utils.isSafeNsIdentifier('ns\u0000')).to.be(false)
      expect(utils.isSafeNsIdentifier('')).to.be(false)
      expect(utils.isSafeNsIdentifier('a'.repeat(200))).to.be(false)
    })
  })

  describe('getResourcesHandler', () => {
    it('drops unsafe lng/ns values but accepts arbitrary safe ones', async () => {
      const i18n = i18next.createInstance()
      await i18n.init({
        fallbackLng: 'en',
        ns: ['translation'],
        resources: { en: { translation: { hi: 'hello' } } }
      })

      const nsBefore = [...i18n.options.ns]

      const loadCalls = []
      i18n.services.backendConnector.load = (lngs, nss, cb) => {
        loadCalls.push({ lngs: [...lngs], nss: [...nss] })
        cb()
      }

      const handler = getResourcesHandler(i18n, {
        getQuery: () => ({
          // `nested/ns` is legitimate (nested namespace — kept).
          // `en/foo` is illegitimate for lng (no language code has `/`, dropped).
          lng: '__proto__ ../etc/passwd en pirate-speak en/foo',
          ns: '__proto__ ../secrets translation custom.ns nested/ns'
        }),
        getParams: () => ({}),
        setContentType: () => {},
        setHeader: () => {},
        getHeader: () => undefined,
        send: () => 'sent'
      })
      handler({}, {})

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(loadCalls).to.have.length(1)
      // attack payloads dropped; legitimate values (including non-BCP-47 ones) kept
      expect(loadCalls[0].lngs).to.eql(['en', 'pirate-speak'])
      expect(loadCalls[0].nss).to.eql(['translation', 'custom.ns', 'nested/ns'])
      expect(i18n.options.ns.filter(n => n.indexOf('..') > -1 || n === '__proto__')).to.eql([])
      expect(i18n.options.ns).to.contain(nsBefore[0])
      // nested ns was kept (regression guard for fs-backend#74 / follow-up 3.9.4)
      expect(i18n.options.ns).to.contain('nested/ns')
    })
  })

  describe('cookie SameSite=None enforces Secure', () => {
    it('adds Secure automatically when SameSite=None is set', () => {
      const ld = new LanguageDetector(i18next.services, {
        order: ['cookie'],
        cookieSameSite: 'none'
      })
      const res = { headers: {} }
      res.header = (name, value) => { res.headers[name] = value }
      ld.cacheUserLanguage({}, res, 'en', ['cookie'])
      const cookieStr = String(res.headers['Set-Cookie'])
      expect(cookieStr).to.match(/SameSite=None/)
      expect(cookieStr).to.match(/Secure/)
    })

    it('does not force Secure when SameSite is Lax', () => {
      const ld = new LanguageDetector(i18next.services, {
        order: ['cookie'],
        cookieSameSite: 'lax'
      })
      const res = { headers: {} }
      res.header = (name, value) => { res.headers[name] = value }
      ld.cacheUserLanguage({}, res, 'en', ['cookie'])
      const cookieStr = String(res.headers['Set-Cookie'])
      expect(cookieStr).to.match(/SameSite=Lax/)
      expect(cookieStr).not.to.match(/Secure/)
    })
  })
})
