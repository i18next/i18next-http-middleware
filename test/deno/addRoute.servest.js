import { assertEquals, assertNotEquals } from 'https://deno.land/std/testing/asserts.ts'
import i18next from 'https://deno.land/x/i18next/index.js'
import { createApp } from 'https://servestjs.org/@v1.0.0-rc2/mod.ts'
import i18nextMiddleware from '../../index.js'
const { test } = Deno

test('addRoute servestjs', async () => {
  // before
  i18next.init({
    fallbackLng: 'en',
    preload: ['en', 'de'],
    saveMissing: true
  })
  const app = createApp()
  app.use(i18nextMiddleware.handle(i18next))

  // test
  const routeHandle = async (req) => {
    assertEquals(req.lng, 'en')
    assertEquals(req.locale, 'en')
    assertEquals(req.language, 'en')
    assertEquals(req.languages, ['en'])
    assertNotEquals(req.i18n, undefined)
    assertNotEquals(req.t, undefined)

    assertEquals(req.t('key'), 'key')
    await req.respond({
      status: 200,
      headers: new Headers({
        'content-type': 'text/plain',
      }),
      body: req.t('key')
    })
  }
  i18nextMiddleware.addRoute(i18next, '/myroute/:lng/test', ['en'], app, 'get', routeHandle)
  const listener = await app.listen({ port: 7001 })

  const res = await fetch('http://localhost:7001/myroute/en/test')
  assertEquals(res.status, 200)
  assertEquals(await res.text(), 'key')
  assertEquals(res.headers.get('content-language'), 'en')

  // after
  await listener.close()
})
