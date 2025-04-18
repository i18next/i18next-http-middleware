import expect from 'expect.js'
import i18nextMiddleware from '../index.js'
import i18next from 'i18next'
import Hapi from '@hapi/hapi'

i18next.init({
  fallbackLng: 'en',
  preload: ['en', 'de'],
  saveMissing: true
})

describe('middleware hapi', () => {
  describe('handling an empty request', () => {
    const app = Hapi.server()

    before(async () => {
      await app.register({
        plugin: i18nextMiddleware.hapiPlugin,
        options: {
          i18next
        }
      })
      await app.initialize()
    })

    it('should extend request and response', async () => {
      app.route({
        method: 'GET',
        path: '/',
        handler: async (req, h) => {
          expect(req).to.have.property('lng', 'en')
          expect(req).to.have.property('locale', 'en')
          expect(req).to.have.property('resolvedLanguage', 'en')
          expect(req).to.have.property('language', 'en')
          expect(req).to.have.property('languages')
          expect(req.languages).to.eql(['en'])
          expect(req).to.have.property('i18n')
          expect(req).to.have.property('t')

          expect(req.t('key')).to.eql('key')
          return req.t('key')
        }
      })

      const res = await app.inject({
        method: 'GET',
        url: '/'
      })

      expect(res.headers).to.property('content-language', 'en')
      expect(res.payload).to.eql('key')
    })
  })
})
