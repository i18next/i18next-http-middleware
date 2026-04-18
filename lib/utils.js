export const UNSAFE_KEYS = ['__proto__', 'constructor', 'prototype']

// Returns true if `v` can be safely forwarded as a language code or namespace
// identifier to a backend connector. Denylist approach (i18next permits any
// language-code shape — https://www.i18next.com/how-to/faq#how-should-the-language-codes-be-formatted)
// that blocks the concrete attack patterns without restricting legitimate use:
//   - not one of `__proto__` / `constructor` / `prototype` (prototype pollution)
//   - no path separators `/` or `\` (path traversal / SSRF in fs/http backends)
//   - no `..` sequence (relative path traversal)
//   - no control characters (header injection downstream, log forging)
//   - non-empty, length <= 128
export function isSafeIdentifier (v) {
  if (typeof v !== 'string') return false
  if (v.length === 0 || v.length > 128) return false
  if (UNSAFE_KEYS.indexOf(v) > -1) return false
  if (v.indexOf('..') > -1) return false
  if (v.indexOf('/') > -1 || v.indexOf('\\') > -1) return false
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F]/.test(v)) return false
  return true
}

export function setPath (object, path, newValue) {
  let stack
  if (typeof path !== 'string') stack = [].concat(path)
  if (typeof path === 'string') stack = path.split('.')

  while (stack.length > 1) {
    let key = stack.shift()
    if (key.indexOf('###') > -1) key = key.replace(/###/g, '.')
    if (UNSAFE_KEYS.indexOf(key) > -1) return // guard against prototype pollution
    if (!object[key]) object[key] = {}
    object = object[key]
  }

  let key = stack.shift()
  if (key.indexOf('###') > -1) key = key.replace(/###/g, '.')
  if (UNSAFE_KEYS.indexOf(key) > -1) return // guard against prototype pollution
  object[key] = newValue
}

const arr = []
const each = arr.forEach
const slice = arr.slice

export function defaults (obj) {
  each.call(slice.call(arguments, 1), function (source) {
    if (source) {
      for (const prop in source) {
        if (obj[prop] === undefined) obj[prop] = source[prop]
      }
    }
  })
  return obj
}

export function extend (obj) {
  each.call(slice.call(arguments, 1), function (source) {
    if (source) {
      for (const prop in source) {
        obj[prop] = source[prop]
      }
    }
  })
  return obj
}

export function removeLngFromUrl (url, lookupFromPathIndex) {
  let first = ''
  let pos = lookupFromPathIndex

  if (url[0] === '/') {
    pos++
    first = '/'
  }

  // Build new url
  const parts = url.split('/')
  parts.splice(pos, 1)
  url = parts.join('/')
  if (url[0] !== '/') url = first + url

  return url
}

export function escape (str) {
  return (str.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/`/g, '&#96;'))
}

// Strip control characters (CR, LF, NUL, other C0/C1) from a value before
// writing it into an HTTP header. Prevents HTTP response splitting on older
// Node.js, and unhandled ERR_INVALID_CHAR crashes on newer Node.js.
export function sanitizeHeaderValue (str) {
  if (typeof str !== 'string') return str
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\r\n\x00-\x1F\x7F]/g, '')
}

export function hasXSS (input) {
  if (typeof input !== 'string') return false

  // Common XSS attack patterns
  const xssPatterns = [
    /<\s*script.*?>/i,
    /<\s*\/\s*script\s*>/i,
    // event handlers on any tag position (not just first attribute)
    /<\s*\w+\s+[^>]*?\bon\w+\s*=/i,
    /javascript\s*:/i,
    /vbscript\s*:/i,
    /expression\s*\(/i,
    /eval\s*\(/i,
    /alert\s*\(/i,
    /document\.cookie/i,
    /document\.write\s*\(/i,
    /window\.location/i,
    /innerHTML/i
  ]

  return xssPatterns.some((pattern) => pattern.test(input))
}
