export default {
  name: 'querystring',

  lookup (req, res, options) {
    let found

    if (options.lookupQuerystring !== undefined && typeof req !== 'undefined') {
      if (options.getQuery(req)) {
        found = options.getQuery(req)[options.lookupQuerystring]
      }
      if (!found && options.getUrl(req) && options.getUrl(req).indexOf('?')) {
        const lastPartOfUri = options.getUrl(req).substring(options.getUrl(req).indexOf('?'))
        if (typeof URLSearchParams !== 'undefined') {
          const urlParams = new URLSearchParams(lastPartOfUri)
          found = urlParams.get(options.lookupQuerystring)
        } else {
          const indexOfQsStart = lastPartOfUri.indexOf(`${options.lookupQuerystring}=`)
          if (indexOfQsStart > -1) {
            const restOfUri = lastPartOfUri.substring(options.lookupQuerystring.length + 2)
            if (restOfUri.indexOf('&') < 0) {
              found = restOfUri
            } else {
              found = restOfUri.substring(0, restOfUri.indexOf('&'))
            }
          }
        }
      }
    }

    return found
  }
}
