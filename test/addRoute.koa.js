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

describe('addRoute koa', () => {
  describe('and handling a request', () => {
    const app = new Koa()
    app.use(i18nextMiddleware.koaPlugin(i18next))
    let server

    before((done) => {
      server = app.listen(7002, done)
    })
    after((done) => server.close(done))

    it('should return the appropriate resource', (done) => {
      app.use(i18nextMiddleware.handle(i18next))
      const handle = (ctx) => {
        expect(ctx).to.have.property('lng', 'en')
        expect(ctx).to.have.property('locale', 'en')
        expect(ctx).to.have.property('language', 'en')
        expect(ctx).to.have.property('languages')
        expect(ctx.languages).to.eql(['en'])
        expect(ctx).to.have.property('i18n')
        expect(ctx).to.have.property('t')
        expect(ctx.t('key')).to.eql('key')
        ctx.body = ctx.t('key')
      }
      i18nextMiddleware.addRoute(i18next, '/myroute/:lng/:ns', ['en'], router, 'get', handle)

      app.use(router.routes())

      request(server)
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
