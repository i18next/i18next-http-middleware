const getOriginalUrl = (req) => {
  if (req.originalUrl) return req.originalUrl
  if (req.raw && req.raw.originalUrl) return req.raw.originalUrl
  console.log('no possibility found to get originalUrl')
}

export default {
  name: 'path',

  lookup (req, res, options) {
    let found

    if (req === undefined) {
      return found
    }

    if (options.lookupPath !== undefined && req.params) {
      found = req.params[options.lookupPath]
    }

    if (!found && typeof options.lookupFromPathIndex === 'number' && getOriginalUrl(req)) {
      const path = getOriginalUrl(req).split('?')[0]
      const parts = path.split('/')
      if (parts[0] === '') { // Handle paths that start with a slash, i.e., '/foo' -> ['', 'foo']
        parts.shift()
      }

      if (parts.length > options.lookupFromPathIndex) {
        found = parts[options.lookupFromPathIndex]
      }
    }

    return found
  }
}
