const fastify = require('fastify')
const i18next = require('i18next')
const i18nextMiddleware = require('i18next-http-middleware')
// const i18nextMiddleware = require('../../cjs')
const Backend = require('i18next-fs-backend')
// const Backend = require('../../../i18next-fs-backend')

const app = fastify()
const port = process.env.PORT || 8080

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    // debug: true,
    backend: {
      // eslint-disable-next-line no-path-concat
      loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json',
      // eslint-disable-next-line no-path-concat
      addPath: __dirname + '/locales/{{lng}}/{{ns}}.missing.json'
    },
    fallbackLng: 'en',
    preload: ['en', 'de'],
    saveMissing: true
  })

app.register(i18nextMiddleware.plugin, { i18next })
// app.addHook('preHandler', i18nextMiddleware.handle(i18next))

app.setErrorHandler(function (error, request, reply) {
  reply.send(request.t('error'))
})

app.get('/', (req, res) => {
  res.send(req.t('home.title'))
})

app.get('/err', (req, res) => {
  throw 'some err'
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
