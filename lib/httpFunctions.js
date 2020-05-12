export const getPath = (req) => {
  if (req.path) return req.path
  if (req.raw && req.raw.path) return req.raw.path
  if (req.url) return req.url
  console.log('no possibility found to get path')
}
export const getUrl = (req) => {
  if (req.url) return req.url
  if (req.raw && req.raw.url) return req.raw.url
  console.log('no possibility found to get url')
}
export const setUrl = (req, url) => {
  if (req.url) {
    req.url = url
    return
  }
  console.log('no possibility found to get url')
}
export const getOriginalUrl = (req) => {
  if (req.originalUrl) return req.originalUrl
  if (req.raw && req.raw.originalUrl) return req.raw.originalUrl
  return getUrl(req)
}
export const getQuery = (req) => {
  if (req.query) return req.query
  if (req.raw && req.raw.query) return req.raw.query
  if (req.ctx && req.ctx.queryParams) return req.ctx.queryParams
  console.log('no possibility found to get query')
  return {}
}
export const getParams = (req) => {
  if (req.params) return req.params
  if (req.raw && req.raw.params) return req.raw.params
  if (req.ctx && req.ctx.params) return req.ctx.params
  console.log('no possibility found to get params')
  return {}
}
export const getHeaders = (req) => {
  if (req.headers) return req.headers
  console.log('no possibility found to get headers')
}
export const getCookies = (req) => {
  if (req.cookies) return req.cookies
  if (getHeaders(req)) {
    const list = {}
    const rc = getHeaders(req).cookie
    rc && rc.split(';').forEach((cookie) => {
      const parts = cookie.split('=')
      list[parts.shift().trim()] = decodeURI(parts.join('='))
    })
    return list
  }
  console.log('no possibility found to get cookies')
}
export const getBody = (req) => {
  if (req.ctx && req.ctx.body) return req.ctx.body.bind(req.ctx)
  if (req.body) return req.body
  console.log('no possibility found to get body')
  return {}
}
export const getHeader = (res, name) => {
  if (res.getHeader) return res.getHeader(name)
  if (res.headers) return res.headers[name]
  if (getHeaders(res) && getHeaders(res)[name]) return getHeaders(res)[name]
  console.log('no possibility found to get header')
  return undefined
}
export const setHeader = (res, name, value) => {
  if(!(res._headerSent || res.headersSent)){
    if (typeof res.setHeader === 'function') return res.setHeader(name, value)
    if (typeof res.header === 'function') return res.header(name, value)
    if (res.headers && typeof res.headers.set === 'function') return res.headers.set(name, value)
  }
  console.log('no possibility found to set header')
}
export const setContentType = (res, type) => {
  if (typeof res.contentType === 'function') return res.contentType(type)
  if (typeof res.type === 'function') return res.type(type)
  setHeader(res, 'Content-Type', type)
}
export const setStatus = (res, code) => {
  if (typeof res.status === 'function') return res.status(code)
  // eslint-disable-next-line no-return-assign
  if (res.status) return res.status = code
  console.log('no possibility found to set status')
}
export const send = (res, body) => {
  if (typeof res.send === 'function') return res.send(body)
  return body
}
export const getSession = (req) => {
  if (req.session) return req.session
  if (req.raw && req.raw.session) return req.raw.session
  console.log('no possibility found to get session')
}

export const extendOptionsWithDefaults = (options = {}) => {
  options.getPath = options.getPath || getPath
  options.getOriginalUrl = options.getOriginalUrl || getOriginalUrl
  options.getUrl = options.getUrl || getUrl
  options.setUrl = options.setUrl || setUrl
  options.getParams = options.getParams || getParams
  options.getSession = options.getSession || getSession
  options.getQuery = options.getQuery || getQuery
  options.getCookies = options.getCookies || getCookies
  options.getBody = options.getBody || getBody
  options.getHeaders = options.getHeaders || getHeaders
  options.getHeader = options.getHeader || getHeader
  options.setHeader = options.setHeader || setHeader
  options.setContentType = options.setContentType || setContentType
  options.setStatus = options.setStatus || setStatus
  options.send = options.send || send
  return options
}
