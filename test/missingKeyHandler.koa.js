import expect from 'expect.js'
import i18nextMiddleware from '../index.js'
import i18next from 'i18next'
import Koa from 'koa'
import Router from '@koa/router'
import request from 'supertest'

const router = Router()
i18next.init({
  fallbackLng: 'en',
  preload: ['en', 'de'],
  saveMissing: true
})

describe('missingKeyHandler koa', () => {
  describe('handling a request', () => {
    const app = new Koa()
    let server

    before((done) => {
      server = app.listen(7002, done)
    })
    after((done) => server.close(done))

    it('should work', (done) => {
      router.post('/:lng/:ns', i18nextMiddleware.missingKeyHandler(i18next))

      app.use(router.routes())

      request(server)
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
