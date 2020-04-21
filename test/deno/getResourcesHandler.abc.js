import { assertEquals, assertNotEquals } from 'https://deno.land/std/testing/asserts.ts'
import i18next from 'https://deno.land/x/i18next/index.js'
import { Application } from 'https://deno.land/x/abc/mod.ts'
import i18nextMiddleware from '../../index.js'
const { test } = Deno

test('getResourcesHandler abc', async () => {
  // before
  i18next.init({
    fallbackLng: 'en',
    preload: ['en', 'de'],
    saveMissing: true,
    resources: {
      en: {
        translation: { hi: 'there' }
      }
    }
  })
  const app = new Application()
  app.get('/', i18nextMiddleware.getResourcesHandler(i18next))
  await app.start({ port: 7002 })

  // test
  const res = await fetch('http://localhost:7002?lng=en&ns=translation')
  assertEquals(res.status, 200)
  assertEquals(res.headers.get('cache-control'), 'no-cache')
  assertEquals(res.headers.get('pragma'), 'no-cache')
  assertEquals(await res.json(), {
    en: {
      translation: { hi: 'there' }
    }
  })

  // after
  await app.close()
})
