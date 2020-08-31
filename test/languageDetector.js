import expect from 'expect.js'
import i18next from 'i18next'
import LanguageDetector from '../lib/LanguageDetector.js'

i18next.init()

describe('language detector', () => {
  const ld = new LanguageDetector(i18next.services, { order: ['session', 'querystring', 'path', 'cookie', 'header'], cookieSameSite: 'none' })

  describe('cookie', () => {
    it('detect', () => {
      const req = {
        headers: {
          cookie: 'i18next=de'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('de')
      // expect(res).to.eql({})
    })

    it('shouldn\'t fail on URI malformed from cookie content', () => {
      const req = {
        headers: {
          cookie: 'i18next=%'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('%')
    })

    it('cacheUserLanguage', () => {
      const req = {}
      const res = {
        headers: {
          'Set-Cookie': 'my=cookie'
        }
      }
      res.header = (name, value) => { res.headers[name] = value }
      ld.cacheUserLanguage(req, res, 'it', ['cookie'])
      expect(req).to.eql({})
      expect(res).to.have.property('headers')
      expect(res.headers).to.have.property('Set-Cookie')
      expect(res.headers['Set-Cookie']).to.match(/i18next=it/)
      expect(res.headers['Set-Cookie']).to.match(/Path=\//)
      expect(res.headers['Set-Cookie']).to.match(/my=cookie/)
      expect(res.headers['Set-Cookie']).to.match(/SameSite=None/)
    })
  })

  describe('header', () => {
    it('detect', () => {
      const req = {
        headers: {
          'accept-language': 'de'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('de')
      // expect(res).to.eql({})
    })

    it('detect special', () => {
      const req = {
        headers: {
          'accept-language': 'zh-Hans'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('zh-Hans')
      // expect(res).to.eql({})
    })

    it('detect with custom regex', () => {
      const req = {
        headers: {
          'accept-language': 'zh-Hans'
        }
      }
      const res = {}
      const ldCustom = new LanguageDetector(i18next.services, { order: ['header'], lookupHeaderRegex: /(([a-z]{4})-?([A-Z]{2})?)\s*;?\s*(q=([0-9.]+))?/gi })
      const lng = ldCustom.detect(req, res)
      expect(lng).to.eql('Hans')
      // expect(res).to.eql({})
    })
  })

  describe('path', () => {
    it('detect', () => {
      const req = {
        url: '/fr/some/route'
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('fr')
      // expect(res).to.eql({})
    })
  })

  describe('querystring', () => {
    it('detect', () => {
      const req = {
        url: '/fr/some/route?lng=de'
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('de')
      // expect(res).to.eql({})
    })
  })

  describe('session', () => {
    it('detect', () => {
      const req = {
        session: {
          lng: 'de'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('de')
      // expect(res).to.eql({})
    })

    it('cacheUserLanguage', () => {
      const req = {
        session: {
          lng: 'de'
        }
      }
      const res = {}
      ld.cacheUserLanguage(req, res, 'it', ['session'])
      expect(req).to.have.property('session')
      expect(req.session).to.have.property('lng', 'it')
      // expect(res).to.eql({})
    })
  })
})
