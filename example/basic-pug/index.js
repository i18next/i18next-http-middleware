const express = require('express')
const i18next = require('i18next')
const i18nextMiddleware = require('i18next-http-middleware')
const i18nextBackend = require('i18next-fs-backend')

const app = express()

app.set('view engine', 'pug');
app.set('view options', { pretty: true });
app.disable('x-powered-by');
app.set('trust proxy', true);
app.locals = { config: { whatever: 'this is' } };

const port = process.env.PORT || 8080

i18next
  .use(i18nextBackend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    debug: true,
    fallbackLng: 'en',
    preload: ['de', 'en'],
    saveMissing: true,
    backend: {
      // eslint-disable-next-line no-path-concat
      loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json',
      // eslint-disable-next-line no-path-concat
      addPath: __dirname + '/locales/{{lng}}/{{ns}}.missing.json'
    },
    detection: {
      order: ['querystring', 'cookie'],
      caches: ['cookie'],
      lookupQuerystring: 'locale',
      lookupCookie: 'locale',
      ignoreCase: true,
      cookieSecure: false
    }
  })
app.use(i18nextMiddleware.handle(i18next))

app.get('/', (req, res) => {
  res.render('index')
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
