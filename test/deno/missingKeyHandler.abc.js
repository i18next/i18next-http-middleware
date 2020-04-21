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
  app.post('/:lng/:ns', i18nextMiddleware.missingKeyHandler(i18next))
  await app.start({ port: 7002 })

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
  await app.close()
})
