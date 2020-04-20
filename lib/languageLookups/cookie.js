const setHeader = (res, name, value) => {
  if (typeof res.setHeader === 'function' && !(res._headerSent || res.headersSent)) return res.setHeader(name, value)
  if (typeof res.header === 'function') return res.header(name, value)
  if (res.headers && typeof res.headers.set === 'function') return res.headers.set(name, value)
  console.log('no possibility found to set header')
}

const parseCookies = (req) => {
  const list = {}
  const rc = req.headers && req.headers.cookie
  rc && rc.split(';').forEach((cookie) => {
    const parts = cookie.split('=')
    list[parts.shift().trim()] = decodeURI(parts.join('='))
  })
  return list
}

// eslint-disable-next-line no-control-regex
const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/

const serializeCookie = (name, val, options) => {
  const opt = options || {}
  const value = encodeURIComponent(val)
  let str = name + '=' + value
  if (opt.maxAge > 0) {
    const maxAge = opt.maxAge - 0
    if (isNaN(maxAge)) throw new Error('maxAge should be a Number')
    str += '; Max-Age=' + Math.floor(maxAge)
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError('option domain is invalid')
    }
    str += '; Domain=' + opt.domain
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError('option path is invalid')
    }
    str += '; Path=' + opt.path
  }
  if (opt.expires) {
    if (typeof opt.expires.toUTCString !== 'function') {
      throw new TypeError('option expires is invalid')
    }
    str += '; Expires=' + opt.expires.toUTCString()
  }
  if (opt.httpOnly) str += '; HttpOnly'
  if (opt.secure) str += '; Secure'
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === 'string' ? opt.sameSite.toLowerCase() : opt.sameSite
    switch (sameSite) {
      case true:
        str += '; SameSite=Strict'
        break
      case 'lax':
        str += '; SameSite=Lax'
        break
      case 'strict':
        str += '; SameSite=Strict'
        break
      case 'none':
        str += '; SameSite=None'
        break
      default:
        throw new TypeError('option sameSite is invalid')
    }
  }
  return str
}

export default {
  name: 'cookie',

  lookup (req, res, options) {
    let found

    if (options.lookupCookie && typeof req !== 'undefined') {
      const cookies = req.cookies || parseCookies(req)
      found = cookies[options.lookupCookie]
    }

    return found
  },

  cacheUserLanguage (req, res, lng, options = {}) {
    if (options.lookupCookie && req !== 'undefined') {
      let expirationDate = options.cookieExpirationDate
      if (!expirationDate) {
        expirationDate = new Date()
        expirationDate.setFullYear(expirationDate.getFullYear() + 1)
      }

      const cookieOptions = {
        expires: expirationDate,
        domain: options.cookieDomain,
        httpOnly: false,
        overwrite: true
      }

      if (options.cookieSecure) cookieOptions.secure = options.cookieSecure

      setHeader(res, 'Set-Cookie', serializeCookie(options.lookupCookie, lng, cookieOptions))
    }
  }
}
