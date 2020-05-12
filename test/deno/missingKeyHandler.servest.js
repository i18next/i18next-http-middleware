import { assertEquals, assertNotEquals } from 'https://deno.land/std/testing/asserts.ts'
import i18next from 'https://deno.land/x/i18next/index.js'
import { createApp } from 'https://servestjs.org/@v1.0.0-rc2/mod.ts'
import i18nextMiddleware from '../../index.js'
const { test } = Deno

test('missingKeyHandler servestjs', async () => {
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
  app.post(new RegExp('^/(.+)/(.+)'), i18nextMiddleware.missingKeyHandler(i18next, {
    getParams: (req) => ({
      lng: req.match[1],
      ns: req.match[2]
    }),
    send: (req, body) => req.respond({
      status: 200,
      body
    })
  }))
  const listener = await app.listen({ port: 7002 })

  // test
  const res = await fetch('http://localhost:7002/en/translation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ miss: 'key' })
  })
  assertEquals(res.status, 200)
  assertEquals(await res.text(), 'ok')

  // after
  await listener.close()
})
