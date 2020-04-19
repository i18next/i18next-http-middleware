import expect from 'expect.js'
import i18nextMiddleware from '../index.js'
import i18next from 'i18next'
import fastify from 'fastify'

i18next.init({
  fallbackLng: 'en',
  preload: ['en', 'de'],
  saveMissing: true
})

describe('middleware fastify', () => {
  describe('handling an empty request', () => {
    it('should extend request and response', (done) => {
      const app = fastify()
      // app.register(i18nextMiddleware.plugin, { i18next })
      app.addHook('preHandler', i18nextMiddleware.handle(i18next))

      app.get('/', async (req, res) => {
        expect(req).to.have.property('lng', 'en')
        expect(req).to.have.property('locale', 'en')
        expect(req).to.have.property('language', 'en')
        expect(req).to.have.property('languages')
        expect(req.languages).to.eql(['en'])
        expect(req).to.have.property('i18n')
        expect(req).to.have.property('t')

        expect(req.t('key')).to.eql('key')
        return req.t('key')
      })

      app.inject({
        method: 'GET',
        url: '/'
      }, (err, res) => {
        expect(err).not.to.be.ok()
        expect(res.headers).to.property('content-language', 'en')
        expect(res.payload).to.eql('key')

        done()
      })
    })
  })
})
