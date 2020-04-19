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

describe('middleware express', () => {
  describe('handling an empty request', () => {
    const app = express()
    app.use(i18nextMiddleware.handle(i18next))
    let server

    before((done) => {
      server = app.listen(7001, done)
    })
    after((done) => server.close(done))

    it('should extend request and response', (done) => {
      app.get('/', (req, res) => {
        expect(req).to.have.property('lng', 'en')
        expect(req).to.have.property('locale', 'en')
        expect(req).to.have.property('language', 'en')
        expect(req).to.have.property('languages')
        expect(req.languages).to.eql(['en'])
        expect(req).to.have.property('i18n')
        expect(req).to.have.property('t')

        expect(req.t('key')).to.eql('key')
        res.send(req.t('key'))
      })

      request(app)
        .get('/')
        .expect('Content-Language', 'en')
        .expect(200, (err, res) => {
          expect(err).not.to.be.ok()
          expect(res.text).to.eql('key')

          done()
        })
    })
  })
})
