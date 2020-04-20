export default {
  name: 'path',

  lookup (req, res, options) {
    let found

    if (req === undefined) {
      return found
    }

    if (options.lookupPath !== undefined && req.params) {
      found = options.getParams(req)[options.lookupPath]
    }

    if (!found && typeof options.lookupFromPathIndex === 'number' && options.getOriginalUrl(req)) {
      const path = options.getOriginalUrl(req).split('?')[0]
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
