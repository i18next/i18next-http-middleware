// import expect from 'expect.js'
import i18nextMiddleware from '../index.js'
import i18next from 'i18next'

i18next.init({
  fallbackLng: 'en',
  preload: ['en', 'de'],
  saveMissing: true
})

describe('addRoute custom framework', () => {
  describe('and handling a request', () => {
    it('should return the appropriate resource', (done) => {
      const app = { get: (route, fn) => {} }
      const handle = (req, res) => {}
      i18nextMiddleware.addRoute(i18next, '/myroute/:lng/:ns', ['en'], app, 'get', handle)
      done()
    })
  })
})
