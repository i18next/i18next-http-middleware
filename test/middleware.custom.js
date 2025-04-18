import expect from 'expect.js'
import i18nextMiddleware from '../index.js'
import i18next from 'i18next'

i18next.init({
  fallbackLng: 'en',
  preload: ['en', 'de'],
  saveMissing: true
})

describe('middleware custom framework', () => {
  describe('handling an empty request', () => {
    const handle = i18nextMiddleware.handle(i18next, {})

    it('should extend request and response', (done) => {
      const req = {}
      const res = {}

      handle(req, res, () => {
        expect(req).to.have.property('lng', 'en')
        expect(req).to.have.property('locale', 'en')
        expect(req).to.have.property('resolvedLanguage', 'en')
        expect(req).to.have.property('language', 'en')
        expect(req).to.have.property('languages')
        expect(req.languages).to.eql(['en'])
        expect(req).to.have.property('i18n')
        expect(req).to.have.property('t')
        expect(res).to.eql({})

        expect(req.t('key')).to.eql('key')
        done()
      })
    })
  })

  describe('having possibility to set headers', () => {
    const handle = i18nextMiddleware.handle(i18next, {
      setHeader: (res, name, value) => {
        res.hdr[name] = value
      }
    })

    it('should extend request and response', (done) => {
      const req = {}
      const res = { hdr: {} }

      handle(req, res, () => {
        expect(req).to.have.property('lng', 'en')
        expect(req).to.have.property('locale', 'en')
        expect(req).to.have.property('resolvedLanguage', 'en')
        expect(req).to.have.property('language', 'en')
        expect(req).to.have.property('languages')
        expect(req.languages).to.eql(['en'])
        expect(req).to.have.property('i18n')
        expect(req).to.have.property('t')
        expect(res).to.eql({
          hdr: {
            'Content-Language': 'en'
          }
        })

        expect(req.t('key')).to.eql('key')
        done()
      })
    })
  })

  describe('ignoreRoutes', () => {
    const handle = i18nextMiddleware.handle(i18next, {
      ignoreRoutes: ['/to-ignore'],
      getPath: (req) => req.p
    })

    it('should ignore routes', (done) => {
      const req = { p: '/to-ignore' }
      const res = {}

      handle(req, res, () => {
        expect(req).not.to.have.property('lng')
        expect(req).not.to.have.property('locale')
        expect(req).not.to.have.property('resolvedLanguage')
        expect(req).not.to.have.property('language')
        expect(req).not.to.have.property('languages')
        expect(req).not.to.have.property('i18n')
        expect(req).not.to.have.property('t')
        expect(res).to.eql({})

        done()
      })
    })

    it('should not ignore other routes', (done) => {
      const req = { p: '/' }
      const res = {}

      handle(req, res, () => {
        expect(req).to.have.property('lng', 'en')
        expect(req).to.have.property('locale', 'en')
        expect(req).to.have.property('resolvedLanguage', 'en')
        expect(req).to.have.property('language', 'en')
        expect(req).to.have.property('languages')
        expect(req.languages).to.eql(['en'])
        expect(req).to.have.property('i18n')
        expect(req).to.have.property('t')
        expect(res).to.eql({})

        expect(req.t('key')).to.eql('key')
        done()
      })
    })
  })
})
