const Koa = require('koa')
const router = require('@koa/router')()
const koaBody = require('koa-body').default
const serve = require('koa-static')
const mount = require('koa-mount')
const i18next = require('i18next')
const i18nextMiddleware = require('i18next-http-middleware')
// const i18nextMiddleware = require('../../../i18next-http-middleware')
const Backend = require('i18next-fs-backend')
// const Backend = require('../../../i18next-fs-backend')

const app = new Koa()
app.use(koaBody({
  jsonLimit: '1kb'
}))
const port = process.env.PORT || 8080

i18next
  .use(Backend)
  // .use(languageDetector)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    // debug: true,
    // detection: {
    //   order: ['customDetector']
    // },
    backend: {
      // eslint-disable-next-line no-path-concat
      loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json',
      // eslint-disable-next-line no-path-concat
      addPath: __dirname + '/locales/{{lng}}/{{ns}}.missing.json'
    },
    fallbackLng: 'en',
    // nonExplicitSupportedLngs: true,
    // supportedLngs: ['en', 'de'],
    load: 'languageOnly',
    saveMissing: true
  })

app.use(i18nextMiddleware.koaPlugin(i18next))

router.get('/', ctx => {
  ctx.body = JSON.stringify({
    'ctx.language': ctx.language,
    'ctx.i18n.language': ctx.i18n.language,
    'ctx.i18n.languages': ctx.i18n.languages,
    'ctx.i18n.languages[0]': ctx.i18n.languages[0],
    'ctx.t("home.title")': ctx.t('home.title')
  }, null, 2)
})


router.get('/missingtest', ctx => {
  ctx.t('nonExisting', 'some default value')
  ctx.body = 'check the locales files...'
})

// loadPath for client: http://localhost:8080/locales/{{lng}}/{{ns}}.json
app.use(mount('/locales', serve('./locales')))

// or instead of static
// router.get('/locales/:lng/:ns', i18nextMiddleware.getResourcesHandler(i18next))
// loadPath for client: http://localhost:8080/locales/{{lng}}/{{ns}}

// missing keys make sure the body is parsed (i.e. with [body-parser](https://github.com/expressjs/body-parser#bodyparserjsonoptions))
router.post('/locales/add/:lng/:ns', i18nextMiddleware.missingKeyHandler(i18next))
// The client can be configured with i18next-http-backend, for example like this: 
// import HttpBackend from 'i18next-http-backend'
// i18next.use(HttpBackend).init({
//   lng: 'en',
//   fallbackLng: 'en',
//   backend: {
//     loadPath: 'http://localhost:8080/locales/{{lng}}/{{ns}}.json',
//     addPath: 'http://localhost:8080/locales/add/{{lng}}/{{ns}}'
//   }
// })

app.use(router.routes())

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})

// curl localhost:8080 -H 'Accept-Language: de-de'
