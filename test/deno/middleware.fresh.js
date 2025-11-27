import expect from 'expect.js'
import { assertEquals, assertNotEquals } from 'https://deno.land/std/testing/asserts.ts'
import i18next from 'https://deno.land/x/i18next/index.js'
import i18nextMiddleware from '../../index.js'
const { test } = Deno
import { App } from "jsr:@fresh/core";

i18next
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    preload: ["en", "fr"],
    fallbackLng: "en",
    resources: {
      en: {
        translation: { hi: "hello" }
      },
      fr: {
        translation: { hi: "bonjour" }
      }
    }
  });

test('middleware fresh', async () => {
  const handler = new App()
    .use(i18nextMiddleware.freshPlugin(i18next))
    .get("/", (ctx) => {
      return new Response(ctx.state.t('hi'))
    })
    .handler();

  const headers = new Headers()
  headers.append('Accept-Language', 'fr')
  const res = await handler(
    new Request('http://localhost',
    { headers }
  ));
  const resHeaders = Object.fromEntries(res.headers.entries())
  expect(resHeaders).to.have.property('content-language')
  expect(resHeaders['content-language']).to.eql('fr')
  expect(await res.text()).to.eql("bonjour")
})
