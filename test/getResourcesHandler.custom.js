import expect from 'expect.js'
import i18nextMiddleware from '../index.js'
import i18next from 'i18next'

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

describe('getResourcesHandler custom framework', () => {
  describe('handling a request', () => {
    const handle = i18nextMiddleware.getResourcesHandler(i18next, {
      getQuery: (req) => req.q,
      setContentType: (res, type) => {
        res.type = type
      },
      setHeader: (res, name, value) => {
        res.h[name] = value
      },
      send: (res, body) => res._send(res, body)
    })

    it('should return the appropriate resource', (done) => {
      const req = {
        q: {
          lng: 'en',
          ns: 'translation'
        }
      }
      const res = {
        h: {},
        _send: (res, body) => {
          expect(res).to.have.property('type', 'application/json')
          expect(res).to.have.property('h')
          expect(res.h).to.have.property('Cache-Control', 'no-cache')
          expect(res.h).to.have.property('Pragma', 'no-cache')
          expect(body).to.have.property('en')
          expect(body.en).to.have.property('translation')
          expect(body.en.translation).to.have.property('hi', 'there')
          done()
        }
      }
      handle(req, res)
    })
  })
})
