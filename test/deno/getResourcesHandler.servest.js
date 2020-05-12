import { assertEquals, assertNotEquals } from 'https://deno.land/std/testing/asserts.ts'
import i18next from 'https://deno.land/x/i18next/index.js'
import { createApp } from 'https://servestjs.org/@v1.0.0-rc2/mod.ts'
import i18nextMiddleware from '../../index.js'
const { test } = Deno

test('getResourcesHandler servestjs', async () => {
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
  const app = createApp()
  app.get('/', i18nextMiddleware.getResourcesHandler(i18next, {
    send: (req, body) => req.respond({
      status: 200,
      body: JSON.stringify(body)
    })
  }))
  const listener = await app.listen({ port: 7002 })

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
  await listener.close()
})
