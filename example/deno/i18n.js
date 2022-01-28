import i18next from 'https://deno.land/x/i18next/index.js'
// import i18next from 'https://raw.githubusercontent.com/i18next/i18next/master/src/index.js'
// import i18next from 'https://cdn.jsdelivr.net/gh/i18next/i18next/src/index.js'
import Backend from 'https://deno.land/x/i18next_fs_backend/index.js'
// import Backend from 'https://cdn.jsdelivr.net/gh/i18next/i18next-fs-backend/index.js'
// import Backend from 'https://raw.githubusercontent.com/i18next/i18next-fs-backend/master/index.js'
// import Backend from '../../../i18next-fs-backend/lib/index.js'

import i18nextMiddleware from 'https://deno.land/x/i18next_http_middleware/index.js'
// import i18nextMiddleware from 'https://raw.githubusercontent.com/i18next/i18next-http-middleware/master/index.js'
// import i18nextMiddleware from '../../../i18next-http-middleware/index.js'

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    // debug: true,
    initImmediate: false, // setting initImediate to false, will load the resources synchronously
    backend: {
      // eslint-disable-next-line no-path-concat
      loadPath: 'locales/{{lng}}/{{ns}}.json',
      // eslint-disable-next-line no-path-concat
      addPath: 'locales/{{lng}}/{{ns}}.missing.json'
    },
    fallbackLng: 'en',
    preload: ['en', 'de'],
    saveMissing: true
  })

export const i18n = i18next
export const middleware = i18nextMiddleware
