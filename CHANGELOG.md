## [v3.9.1](https://github.com/i18next/i18next-http-middleware/compare/v3.9.0...v3.9.1)
- Adds missing TS declaration and options argument. [#99](https://github.com/i18next/i18next-http-middleware/pull/99)

## [v3.9.0](https://github.com/i18next/i18next-http-middleware/compare/v3.8.3...v3.9.0)
- Fresh 2 support [#98](https://github.com/i18next/i18next-http-middleware/pull/98)

## [v3.8.3](https://github.com/i18next/i18next-http-middleware/compare/v3.8.2...v3.8.3)
- Supports the parsing of Deno headers (fixes [#94](https://github.com/i18next/i18next-http-middleware/issues/94)) [#95](https://github.com/i18next/i18next-http-middleware/pull/95)

## [v3.8.2](https://github.com/i18next/i18next-http-middleware/compare/v3.8.1...v3.8.2)
- fix: properly handle fallbackLng when configured as an object with `default` property or language-specific fallback chains [#92](https://github.com/i18next/i18next-http-middleware/issues/92)

## [v3.8.1](https://github.com/i18next/i18next-http-middleware/compare/v3.8.0...v3.8.1)
- Try to fix Language detector doesn't fall back to basic language when dialect is present [#91](https://github.com/i18next/i18next-http-middleware/issues/91) by making sure fix for [#26](https://github.com/i18next/i18next-http-middleware/issues/26) is still working

## [v3.8.0](https://github.com/i18next/i18next-http-middleware/compare/v3.7.4...v3.8.0)
- Introduce 'cookieHttpOnly' option to configure HttpOnly cookie [#89](https://github.com/i18next/i18next-http-middleware/pull/89)

## [v3.7.4](https://github.com/i18next/i18next-http-middleware/compare/v3.7.3...v3.7.4)
- check for common xss attack patterns on detected language

## [v3.7.3](https://github.com/i18next/i18next-http-middleware/compare/v3.7.2...v3.7.3)
- add shortcut for resolvedLanguage

## [v3.7.2](https://github.com/i18next/i18next-http-middleware/compare/v3.7.1...v3.7.2)
- fix: Fastify no longer complains about the type [#83](https://github.com/i18next/i18next-http-middleware/pull/83)

## [v3.7.1](https://github.com/i18next/i18next-http-middleware/compare/v3.7.0...v3.7.1)
- Just to be sure, sanitize the Content-Language response header. (Eventhough there is no known/reproducible vulnerability yet #80)

## [v3.7.0](https://github.com/i18next/i18next-http-middleware/compare/v3.6.0...v3.7.0)
- support i18next v24

## [v3.6.0](https://github.com/i18next/i18next-http-middleware/compare/v3.5.0...v3.6.0)
- introduce convertDetectedLanguage option

## [v3.5.0](https://github.com/i18next/i18next-http-middleware/compare/v3.4.1...v3.5.0)
- fix: separate cjs and mjs typings

## [v3.4.1](https://github.com/i18next/i18next-http-middleware/compare/v3.4.0...v3.4.1)
- fix(languageDetector): handle es-419 special case [#65](https://github.com/i18next/i18next-http-middleware/pull/65)

## [v3.4.0](https://github.com/i18next/i18next-http-middleware/compare/v3.3.2...v3.4.0)
- support koa [#61](https://github.com/i18next/i18next-http-middleware/issues/61)

## [v3.3.2](https://github.com/i18next/i18next-http-middleware/compare/v3.3.1...v3.3.2)
- deno: oak fix [#59](https://github.com/i18next/i18next-http-middleware/issues/59)

## [v3.3.1](https://github.com/i18next/i18next-http-middleware/compare/v3.3.0...v3.3.1)
- Support TS5 types exports

## [v3.3.0](https://github.com/i18next/i18next-http-middleware/compare/v3.2.2...v3.3.0)
- fallback in getResourcesHandler to check also in route params

## [v3.2.2](https://github.com/i18next/i18next-http-middleware/compare/v3.2.1...v3.2.2)
- optimize header based language detection for 3 char languages [#54](https://github.com/i18next/i18next-http-middleware/issues/54)

## [v3.2.1](https://github.com/i18next/i18next-http-middleware/compare/v3.2.0...v3.2.1)
- fix issue missing i18n.t and t functions before authenticating [#52](https://github.com/i18next/i18next-http-middleware/pull/52)

## [v3.2.0](https://github.com/i18next/i18next-http-middleware/compare/v3.1.6...v3.2.0)
- HapiJs support [#50](https://github.com/i18next/i18next-http-middleware/pull/50)

## [v3.1.6](https://github.com/i18next/i18next-http-middleware/compare/v3.1.5...v3.1.6)
- add Fastify type support [#47](https://github.com/i18next/i18next-http-middleware/pull/47)

## [v3.1.5](https://github.com/i18next/i18next-http-middleware/compare/v3.1.4...v3.1.5)
- fallbackLng option can also be a function

## [v3.1.4](https://github.com/i18next/i18next-http-middleware/compare/v3.1.3...v3.1.4)
- fix for [point-of-view](https://github.com/fastify/point-of-view)
- update all dependencies

## [v3.1.3](https://github.com/i18next/i18next-http-middleware/compare/v3.1.2...v3.1.3)
- optimize getQuery() function to check if req.query is iterable

## [v3.1.2](https://github.com/i18next/i18next-http-middleware/compare/v3.1.1...v3.1.2)
- fix the type of the lookup method [#37](https://github.com/i18next/i18next-http-middleware/pull/37)

## [v3.1.1](https://github.com/i18next/i18next-http-middleware/compare/v3.1.0...v3.1.1)
- make sure no undefined language is detected

## [v3.1.0](https://github.com/i18next/i18next-http-middleware/compare/v3.0.6...v3.1.0)
- added types

## [v3.0.6](https://github.com/i18next/i18next-http-middleware/compare/v3.0.5...v3.0.6)
- ignoreCase option true by default

## [v3.0.5](https://github.com/i18next/i18next-http-middleware/compare/v3.0.4...v3.0.5)
- introduce ignoreCase option

## [v3.0.4](https://github.com/i18next/i18next-http-middleware/compare/v3.0.3...v3.0.4)
- fix language detection algorithm to handle fallbackLng correctly

## [v3.0.3](https://github.com/i18next/i18next-http-middleware/compare/v3.0.2...v3.0.3)
- prevent URIError with cookie language detector

## [v3.0.2](https://github.com/i18next/i18next-http-middleware/compare/v3.0.1...v3.0.2)
- transpile also esm

## [v3.0.1](https://github.com/i18next/i18next-http-middleware/compare/v3.0.0...v3.0.1)
- introduce lookupHeaderRegex option

## [v3.0.0](https://github.com/i18next/i18next-http-middleware/compare/v2.1.2...v3.0.0)
- **BREAKING** needs i18next >= 19.5.0
- let i18next figure out which detected lng is best match

## [v2.1.2](https://github.com/i18next/i18next-http-middleware/compare/v2.1.1...v2.1.2)
- fix: get whitelist from correct property

## [v2.1.1](https://github.com/i18next/i18next-http-middleware/compare/v2.1.0...v2.1.1)
- extend httpFunctions getQuery to handle some edge cases

## [v2.1.0](https://github.com/i18next/i18next-http-middleware/compare/v2.0.0...v2.1.0)
- LanguageDetector: cookie, new option: cookiePath

## [v2.0.0](https://github.com/i18next/i18next-http-middleware/compare/v1.3.1...v2.0.0)
- potentially BREAKING: change cookie defaults: cookieSameSite: 'strict'
