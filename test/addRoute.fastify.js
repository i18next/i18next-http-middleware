import expect from 'expect.js'
import i18nextMiddleware from '../index.js'
import i18next from 'i18next'
import fastify from 'fastify'

i18next.init({
  fallbackLng: 'en',
  preload: ['en', 'de'],
  saveMissing: true
})

describe('addRoute fastify', () => {
  describe('and handling a request', () => {
    it('should return the appropriate resource', (done) => {
      const app = fastify()
      // app.register(i18nextMiddleware.plugin, { i18next })
      app.addHook('preHandler', i18nextMiddleware.handle(i18next))
      const handle = (req, res) => {
        expect(req).to.have.property('lng', 'en')
        expect(req).to.have.property('locale', 'en')
        expect(req).to.have.property('language', 'en')
        expect(req).to.have.property('languages')
        expect(req.languages).to.eql(['en'])
        expect(req).to.have.property('i18n')
        expect(req).to.have.property('t')
        expect(req.t('key')).to.eql('key')
        res.send(req.t('key'))
      }
      i18nextMiddleware.addRoute(i18next, '/myroute/:lng/:ns', ['en'], app, 'get', handle)

      app.inject({
        method: 'GET',
        url: '/myroute/en/test'
      }, (err, res) => {
        expect(err).not.to.be.ok()
        expect(res.headers).to.property('content-language', 'en')
        expect(res.payload).to.eql('key')
        done()
      })
    })
  })
})
