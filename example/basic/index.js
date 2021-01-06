const express = require('express')
const i18next = require('i18next')
const i18nextMiddleware = require('i18next-http-middleware')
// const i18nextMiddleware = require('../../../i18next-http-middleware')
const Backend = require('i18next-fs-backend')
// const Backend = require('../../../i18next-fs-backend')

const app = express()
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
    // nonExplicitSupportedLngs: true,
    // supportedLngs: ['en', 'de'],
    load: 'languageOnly',
    saveMissing: true
  })

app.use(i18nextMiddleware.handle(i18next))

app.get('/', (req, res) => {
  res.send(JSON.stringify({
    'req.language': req.language,
    'req.i18n.language': req.i18n.language,
    'req.i18n.languages': req.i18n.languages,
    'req.i18n.languages[0]': req.i18n.languages[0],
    'req.t("home.title")': req.t('home.title')
  }, null, 2))
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})

// curl localhost:8080 -H 'Accept-Language: de-de'
