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
    preload: ['en', 'de'],
    saveMissing: true
  })

app.use(i18nextMiddleware.handle(i18next))

app.get('/', (req, res) => {
  res.send(req.t('home.title'))
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
