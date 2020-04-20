export default {
  name: 'querystring',

  lookup (req, res, options) {
    let found

    if (options.lookupQuerystring !== undefined && typeof req !== 'undefined') {
      if (options.getQuery(req)) {
        found = options.getQuery(req)[options.lookupQuerystring]
      }
      if (!found && options.getUrl(req) && options.getUrl(req).indexOf('?')) {
        const urlParams = new URLSearchParams(options.getUrl(req).substring(options.getUrl(req).indexOf('?')))
        found = urlParams.get(options.lookupQuerystring)
      }
    }

    return found
  }
}
