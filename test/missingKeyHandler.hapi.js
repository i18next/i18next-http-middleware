import expect from 'expect.js'
import i18nextMiddleware from '../index.js'
import i18next from 'i18next'
import Hapi from '@hapi/hapi'

i18next.init({
  fallbackLng: 'en',
  preload: ['en', 'de'],
  saveMissing: true
})

describe('missingKeyHandler hapi', () => {
  describe('handling a request', () => {
    const app = Hapi.server()

    before(async () => {
      await app.register({
        plugin: i18nextMiddleware.hapiPlugin,
        options: {
          i18next
        }
      })
      await app.initialize()
    })

    it('should work', async () => {
      app.route({
        method: 'POST',
        path: '/{lng}/{ns}',
        handler: i18nextMiddleware.missingKeyHandler(i18next)
      })

      const res = await app.inject({
        method: 'POST',
        url: '/en/translation',
        payload: { miss: 'key' }
      })

      expect(res.result).to.eql('ok')
    })
  })
})
