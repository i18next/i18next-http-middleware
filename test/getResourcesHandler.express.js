import expect from 'expect.js'
import i18nextMiddleware from '../index.js'
import i18next from 'i18next'
import express from 'express'
import request from 'supertest'

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

describe('getResourcesHandler express', () => {
  describe('handling a request', () => {
    const app = express()
    let server

    before((done) => {
      server = app.listen(7001, done)
    })
    after((done) => server.close(done))

    it('should return the appropriate resource', (done) => {
      app.get('/', i18nextMiddleware.getResourcesHandler(i18next))

      request(app)
        .get('/')
        .query({
          lng: 'en',
          ns: 'translation'
        })
        .expect('content-type', /json/)
        .expect('cache-control', 'no-cache')
        .expect('pragma', 'no-cache')
        .expect(200, (err, res) => {
          expect(err).not.to.be.ok()
          expect(res.body).to.have.property('en')
          expect(res.body.en).to.have.property('translation')
          expect(res.body.en.translation).to.have.property('hi', 'there')
          done()
        })
    })
  })

  describe('handling a request for a language not loaded yet by an async backend', () => {
    const i18n = i18next.createInstance()
    i18n.use({
      type: 'backend',
      init () {},
      read (lng, ns, callback) {
        setTimeout(() => callback(null, { hi: `there (${lng})` }), 10)
      }
    }).init({ fallbackLng: 'en' })

    const app = express()
    app.get('/', i18nextMiddleware.getResourcesHandler(i18n))

    it('should wait for the backend and return the loaded resource', (done) => {
      request(app)
        .get('/')
        .query({
          lng: 'de',
          ns: 'translation'
        })
        .expect('content-type', /json/)
        .expect(200, (err, res) => {
          expect(err).not.to.be.ok()
          expect(res.body).to.eql({ de: { translation: { hi: 'there (de)' } } })
          done()
        })
    })
  })
})
