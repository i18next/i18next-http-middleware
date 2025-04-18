const express = require('express')
const i18next = require('i18next')
const i18nextMiddleware = require('i18next-http-middleware')
// const i18nextMiddleware = require('../../../i18next-http-middleware')
const Backend = require('i18next-fs-backend')
// const Backend = require('../../../i18next-fs-backend')

const app = express()
const port = process.env.PORT || 8080

// const customDetector = {
//   name: 'customDetector',
//   lookup: (req) => {
//     console.log('Custom detector lookup');
//     console.log('req.query.custom', req.query.custom);

//     switch (req.query.custom) {
//       case 'en':
//         return 'en-US';
//       case 'fr':
//         return 'fr-FR';
//       default:
//         return 'en-US';
//     }
//   }
// }
// const languageDetector = new i18nextMiddleware.LanguageDetector()
// languageDetector.addDetector(customDetector)

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

app.use(i18nextMiddleware.handle(i18next))

app.get('/', (req, res) => {
  res.send(JSON.stringify({
    'req.language': req.language,
    'req.i18n.resolvedLanguage': req.i18n.resolvedLanguage,
    'req.i18n.language': req.i18n.language,
    'req.i18n.languages': req.i18n.languages,
    'req.i18n.languages[0]': req.i18n.languages[0],
    'req.t("home.title")': req.t('home.title')
  }, null, 2))
})

app.get('/missingtest', (req, res) => {
  req.t('nonExisting', 'some default value')
  res.send('check the locales files...')
})

// loadPath for client: http://localhost:8080/locales/{{lng}}/{{ns}}.json
app.use('/locales', express.static('locales'))

// or instead of static
// app.get('/locales/:lng/:ns', i18nextMiddleware.getResourcesHandler(i18next))
// app.get('/locales/:lng/:ns', i18nextMiddleware.getResourcesHandler(i18next, { cache: false }))
// loadPath for client: http://localhost:8080/locales/{{lng}}/{{ns}}

// missing keys make sure the body is parsed (i.e. with [body-parser](https://github.com/expressjs/body-parser#bodyparserjsonoptions))
app.post('/locales/add/:lng/:ns', i18nextMiddleware.missingKeyHandler(i18next))
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


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})

// curl localhost:8080 -H 'Accept-Language: de-de'
