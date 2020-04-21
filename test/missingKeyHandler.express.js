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

describe('missingKeyHandler express', () => {
  describe('handling a request', () => {
    const app = express()
    let server

    before((done) => {
      server = app.listen(7001, done)
    })
    after((done) => server.close(done))

    it('should work', (done) => {
      app.post('/:lng/:ns', i18nextMiddleware.missingKeyHandler(i18next))

      request(app)
        .post('/en/translation')
        .send({ miss: 'key' })
        .expect(200, (err, res) => {
          expect(err).not.to.be.ok()
          expect(res.text).to.eql('ok')
          done()
        })
    })
  })
})
