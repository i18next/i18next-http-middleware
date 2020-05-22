// eslint-disable-next-line no-control-regex
const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/

const serializeCookie = (name, val, options) => {
  const opt = options || {}
  opt.path = opt.path || '/'
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
      const cookies = options.getCookies(req)
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
      if (options.cookieSameSite) cookieOptions.sameSite = options.cookieSameSite

      let existingCookie = options.getHeader(res, 'set-cookie') || options.getHeader(res, 'Set-Cookie') || []
      if (!Array.isArray(existingCookie)) existingCookie = [existingCookie]
      existingCookie = existingCookie.filter((c) => c.indexOf(`${options.lookupCookie}=`) !== 0)
      existingCookie.push(serializeCookie(options.lookupCookie, lng, cookieOptions))
      options.setHeader(res, 'Set-Cookie', existingCookie.length === 1 ? existingCookie[0] : existingCookie)
    }
  }
}
