import { expect } from 'jsr:@std/expect'
import i18next from 'https://deno.land/x/i18next/index.js'
import i18nextMiddleware from '../../index.js'
const { test } = Deno
import { App } from "jsr:@fresh/core";

i18next
  .init({
    preload: ["en", "fr"],
    fallbackLng: "en",
    saveMissing: true,
    resources: {
      en: {
        translation: { hi: 'there' }
      }
    }
  });

test('getResourcesHandler fresh', async () => {
  const app = new App()
    .use(i18nextMiddleware.freshPlugin(i18next))
    .get('/', i18nextMiddleware.getResourcesHandler(i18next))
  const handler = app.handler()
  const res = await handler(
    new Request('http://localhost?lng=en&ns=translation')
  );
  expect(res.status).toEqual(200)
  expect(await res.json()).toEqual({
    en: {
      translation: { hi: 'there' }
    }
  })
})
