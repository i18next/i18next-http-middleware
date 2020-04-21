import { assertEquals, assertNotEquals } from 'https://deno.land/std/testing/asserts.ts'
import i18next from 'https://deno.land/x/i18next/index.js'
import { Application } from 'https://deno.land/x/abc/mod.ts'
import i18nextMiddleware from '../../index.js'
const { test } = Deno

test('addRoute abc', async () => {
  // before
  i18next.init({
    fallbackLng: 'en',
    preload: ['en', 'de'],
    saveMissing: true
  })
  const app = new Application()
  const handle = i18nextMiddleware.handle(i18next)
  app.use((next) =>
    (c) => {
      handle(c.request, c.response, () => {})
      return next(c)
    }
  )

  // test
  const routeHandle = (c) => {
    assertEquals(c.request.lng, 'en')
    assertEquals(c.request.locale, 'en')
    assertEquals(c.request.language, 'en')
    assertEquals(c.request.languages, ['en'])
    assertNotEquals(c.request.i18n, undefined)
    assertNotEquals(c.request.t, undefined)

    assertEquals(c.request.t('key'), 'key')
    return c.request.t('key')
  }
  i18nextMiddleware.addRoute(i18next, '/myroute/:lng/:ns', ['en'], app, 'get', routeHandle)
  await app.start({ port: 7001 })

  const res = await fetch('http://localhost:7001/myroute/en/test')
  assertEquals(res.status, 200)
  assertEquals(await res.text(), 'key')
  assertEquals(res.headers.get('content-language'), 'en')

  // after
  await app.close()
})
