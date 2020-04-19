import expect from 'expect.js'
import i18nextMiddleware from '../index.js'
import i18next from 'i18next'
import fastify from 'fastify'

i18next.init({
  fallbackLng: 'en',
  preload: ['en', 'de'],
  saveMissing: true,
  resources: {
    en: {
      translation: { hi: 'there' }
    }
  }
})

describe('getResourcesHandler fastify', () => {
  describe('handling a request', () => {
    it('should return the appropriate resource', (done) => {
      const app = fastify()
      app.get('/', i18nextMiddleware.getResourcesHandler(i18next))

      app.inject({
        method: 'GET',
        url: '/',
        query: {
          lng: 'en',
          ns: 'translation'
        }
      }, (err, res) => {
        expect(err).not.to.be.ok()
        expect(res.headers).to.property('content-type', 'application/json; charset=utf-8')
        expect(res.headers).to.property('cache-control', 'no-cache')
        expect(res.headers).to.property('pragma', 'no-cache')
        expect(res.json()).to.have.property('en')
        expect(res.json().en).to.have.property('translation')
        expect(res.json().en.translation).to.have.property('hi', 'there')
        done()
      })
    })
  })
})
