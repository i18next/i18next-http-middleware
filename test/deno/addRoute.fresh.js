import { expect } from 'jsr:@std/expect'
import i18next from 'https://deno.land/x/i18next/index.js'
import i18nextMiddleware from '../../index.js'
const { test } = Deno
import { App } from "jsr:@fresh/core";

i18next
  .init({
    preload: ["en", "fr"],
    fallbackLng: "en"
  });

test('addRoute fresh', async () => {
  const routeHandle = (ctx) => {
    expect(ctx.state.lng).toEqual('en')
    expect(ctx.state.locale).toEqual('en')
    expect(ctx.state.language).toEqual('en')
    expect(ctx.state.languages).toEqual( ['en'])
    expect(ctx.state.i18n).not.toBeUndefined()
    expect(ctx.state.t).not.toBeUndefined()

    expect(ctx.state.t('key')).toEqual('key')
    return new Response(ctx.state.t('key'))
  }
  const app = new App()
    .use(i18nextMiddleware.freshPlugin(i18next))
  i18nextMiddleware.addRoute(i18next, '/myroute/:lng/:ns', ['en'], app, 'get', routeHandle)
  const handler = app.handler()
  const res = await handler(
    new Request('http://localhost/myroute/en/test')
  );
  expect(await res.text()).toEqual('key')
})
