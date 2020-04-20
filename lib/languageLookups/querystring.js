const getUrl = (req) => {
  if (req.url) return req.url
  if (req.raw && req.raw.url) return req.raw.url
  console.log('no possibility found to get url')
}

export default {
  name: 'querystring',

  lookup (req, res, options) {
    let found

    if (options.lookupQuerystring !== undefined && typeof req !== 'undefined') {
      if (req.query) {
        found = req.query[options.lookupQuerystring]
      } else if (getUrl(req) && getUrl(req).indexOf('?')) {
        const urlParams = new URLSearchParams(getUrl(req).substring(getUrl(req).indexOf('?')))
        found = urlParams.get(options.lookupQuerystring)
      }
    }

    return found
  }
}
