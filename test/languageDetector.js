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

    it('detect 3 char lngs', () => {
      const req = {
        headers: {
          'accept-language': 'haw-US'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('haw-US')
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

    it('detect region with numbers', () => {
      const req = {
        headers: {
          'accept-language': 'es-419'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('es-419')
      // expect(res).to.eql({})
    })

    it('parses weight correctly', () => {
      const req = {
        headers: {
          'accept-language': 'pt;q=0.9,es-419;q=0.8,en;q=0.7'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('pt')
      // expect(res).to.eql({})
    })

    it('parses weight out of order correctly', () => {
      const req = {
        headers: {
          'accept-language': 'es-419;q=0.7,en;q=0.8,pt;q=0.9'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('pt')
      // expect(res).to.eql({})
    })

    it('sets weight to 1 as default', () => {
      const req = {
        headers: {
          'accept-language': 'pt-BR,pt;q=0.9,es-419;q=0.8,en;q=0.7'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('pt-BR')
      // expect(res).to.eql({})
    })
  })

  describe('path', () => {
    it('detect', () => {
      const req = {
        url: '/fr-fr/some/route'
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('fr-FR')
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

describe('language detector (ISO 15897 locales)', () => {
  const ld = new LanguageDetector(i18next.services, { order: ['session', 'querystring', 'path', 'cookie', 'header'], cookieSameSite: 'none', convertDetectedLanguage: 'Iso15897' })

  describe('cookie', () => {
    it('detect', () => {
      const req = {
        headers: {
          cookie: 'i18next=de-CH'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('de_CH')
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
      ld.cacheUserLanguage(req, res, 'it_IT', ['cookie'])
      expect(req).to.eql({})
      expect(res).to.have.property('headers')
      expect(res.headers).to.have.property('Set-Cookie')
      expect(res.headers['Set-Cookie']).to.match(/i18next=it_IT/)
      expect(res.headers['Set-Cookie']).to.match(/Path=\//)
      expect(res.headers['Set-Cookie']).to.match(/my=cookie/)
      expect(res.headers['Set-Cookie']).to.match(/SameSite=None/)
    })
  })

  describe('header', () => {
    it('detect', () => {
      const req = {
        headers: {
          'accept-language': 'de-DE'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('de_DE')
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
      expect(lng).to.eql('zh_Hans')
      // expect(res).to.eql({})
    })

    it('detect 3 char lngs', () => {
      const req = {
        headers: {
          'accept-language': 'haw-US'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('haw_US')
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

    it('detect region with numbers', () => {
      const req = {
        headers: {
          'accept-language': 'es-419'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('es_419')
      // expect(res).to.eql({})
    })

    it('parses weight correctly', () => {
      const req = {
        headers: {
          'accept-language': 'pt-PT;q=0.9,es-419;q=0.8,en;q=0.7'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('pt_PT')
      // expect(res).to.eql({})
    })

    it('parses weight out of order correctly', () => {
      const req = {
        headers: {
          'accept-language': 'es-419;q=0.7,en;q=0.8,pt-PT;q=0.9'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('pt_PT')
      // expect(res).to.eql({})
    })

    it('sets weight to 1 as default', () => {
      const req = {
        headers: {
          'accept-language': 'pt-BR,pt;q=0.9,es-419;q=0.8,en;q=0.7'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('pt_BR')
      // expect(res).to.eql({})
    })
  })

  describe('path', () => {
    it('detect', () => {
      const req = {
        url: '/fr-fr/some/route'
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('fr_fr')
      // expect(res).to.eql({})
    })
  })

  describe('querystring', () => {
    it('detect', () => {
      const req = {
        url: '/fr/some/route?lng=de-CH'
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('de_CH')
      // expect(res).to.eql({})
    })
  })

  describe('session', () => {
    it('detect', () => {
      const req = {
        session: {
          lng: 'de-AT'
        }
      }
      const res = {}
      const lng = ld.detect(req, res)
      expect(lng).to.eql('de_AT')
      // expect(res).to.eql({})
    })

    it('cacheUserLanguage', () => {
      const req = {
        session: {
          lng: 'de-DE'
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
