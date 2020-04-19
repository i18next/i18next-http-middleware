import expect from 'expect.js'
import i18nextMiddleware from '../index.js'
import i18next from 'i18next'
import express from 'express'
import request from 'supertest'

i18next.init({
  fallbackLng: 'en',
  preload: ['en', 'de'],
  saveMissing: true
})

describe('addRoute express', () => {
  describe('and handling a request', () => {
    const app = express()
    let server

    before((done) => {
      server = app.listen(7001, done)
    })
    after((done) => server.close(done))

    it('should return the appropriate resource', (done) => {
      app.use(i18nextMiddleware.handle(i18next))
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

      request(app)
        .get('/myroute/en/test')
        .expect('Content-Language', 'en')
        .expect(200, (err, res) => {
          expect(err).not.to.be.ok()
          expect(res.text).to.eql('key')
          done()
        })
    })
  })
})
