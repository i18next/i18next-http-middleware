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

describe('middleware koa', () => {
  describe('handling an empty request', () => {
    const app = new Koa()
    app.use(i18nextMiddleware.koaPlugin(i18next))
    let server

    before((done) => {
      server = app.listen(7002, done)
    })
    after((done) => server.close(done))

    it('should extend request and response', (done) => {
      router.get('/', (ctx) => {
        expect(ctx).to.have.property('lng', 'en')
        expect(ctx).to.have.property('locale', 'en')
        expect(ctx).to.have.property('resolvedLanguage', 'en')
        expect(ctx).to.have.property('language', 'en')
        expect(ctx).to.have.property('languages')
        expect(ctx.languages).to.eql(['en'])
        expect(ctx).to.have.property('i18n')
        expect(ctx).to.have.property('t')

        expect(ctx.t('key')).to.eql('key')
        ctx.body = ctx.t('key')
      })

      app.use(router.routes())

      request(server)
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
