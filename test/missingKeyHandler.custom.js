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

    it('passes an error from saving a body that is read async on to the framework', (done) => {
      // a body read async (abc's `ctx.body()` on Deno): an error while saving used to be an
      // unhandled rejection, which ends a Node.js process, and the request never got an answer
      const connector = i18next.services.backendConnector
      const saveMissing = connector.saveMissing
      connector.saveMissing = () => { throw new Error('boom') }
      const handleAsync = i18nextMiddleware.missingKeyHandler(i18next, {
        getParams: (req) => req.p,
        getBody: (req) => () => Promise.resolve(req.b),
        send: () => {}
      })
      handleAsync({ p: { lng: 'en', ns: 'translation' }, b: { miss: 'key' } }, {}).then(
        () => { connector.saveMissing = saveMissing; done(new Error('resolved')) },
        (e) => {
          connector.saveMissing = saveMissing
          try { expect(e.message).to.be('boom') } catch (err) { return done(err) }
          done()
        }
      )
    })
  })
})
