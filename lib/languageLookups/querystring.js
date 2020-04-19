export default {
  name: 'querystring',

  lookup (req, res, options) {
    let found

    if (options.lookupQuerystring !== undefined && typeof req !== 'undefined') {
      if (req.query) {
        found = req.query[options.lookupQuerystring]
      } else if (req.url && req.url.indexOf('?')) {
        const urlParams = new URLSearchParams(req.url.substring(req.url.indexOf('?')))
        found = urlParams.get(options.lookupQuerystring)
      }
    }

    return found
  }
}
