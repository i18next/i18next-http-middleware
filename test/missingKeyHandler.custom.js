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
        },
        body: { miss: 'key' }
      }
      const res = {
        _send: (res, body) => {
          expect(body).to.eql('ok')
          done()
        }
      }
      handle(req, res)
    })

    it("passes the request instance's hasLoadedNamespace to saveMissing (i18next >= 26.7)", (done) => {
      const connector = i18next.services.backendConnector
      const saveMissing = connector.saveMissing
      const hasLoadedNamespace = () => true
      let args
      connector.saveMissing = (...a) => { args = a }
      const req = {
        p: { lng: 'en', ns: 'translation' },
        body: { miss: 'key' },
        i18n: { services: { utils: { hasLoadedNamespace } } }
      }
      const res = {
        _send: () => {
          connector.saveMissing = saveMissing
          expect(args.slice(0, 4)).to.eql([['en'], 'translation', 'miss', 'key'])
          expect(args[7]).to.be(hasLoadedNamespace)
          done()
        }
      }
      handle(req, res)
    })
  })
})
