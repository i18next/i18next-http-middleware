// deno run --allow-net --allow-read index.js
import { Application } from 'https://deno.land/x/abc/mod.ts'
import { config } from "https://deno.land/x/dotenv/mod.ts"
import { i18n, middleware } from './i18n.js'
import { renderFile } from 'https://deno.land/x/dejs/mod.ts'

const port = config.PORT || 8080
const app = new Application()

app.renderer = {
  render(name, data) {
    return renderFile(`./views/${name}.html`, data)
  }
}

const handle = middleware.handle(i18n)

app.use((next) =>
  (c) => {
    handle(c)
    return next(c)
  }
)

app.get('/', (c) => c.render('index', { t: c.request.t, i18n: c.request.i18n }))
app.get('/raw', (c) => c.request.t('home.title'))

app.start({ port })

console.log(i18n.t('server.started', { port }))
console.log(i18n.t('server.started', { port, lng: 'de' }))
