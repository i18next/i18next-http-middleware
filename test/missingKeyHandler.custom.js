import expect from 'expect.js'
import i18nextMiddleware from '../index.js'
import i18next from 'i18next'

i18next.init({
  fallbackLng: 'en',
  preload: ['en', 'de'],
  saveMissing: true
})

describe('missingKeyHandler custom framework', () => {
  describe('handling a request', () => {
    const handle = i18nextMiddleware.missingKeyHandler(i18next, {
      getParams: (req) => req.p,
      send: (res, body) => res._send(res, body)
    })

    it('should work', (done) => {
      const req = {
        p: {
          lng: 'en',
          ns: 'translation'
        }
      }
      const res = {
        _send: (res, body) => {
          expect(body).to.eql('ok')
          done()
        }
      }
      handle(req, res)
    })
  })
})
