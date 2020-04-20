export default {
  name: 'session',

  lookup (req, res, options) {
    let found

    if (options.lookupSession !== undefined && typeof req && options.getSession(req)) {
      found = options.getSession(req)[options.lookupSession]
    }

    return found
  },

  cacheUserLanguage (req, res, lng, options = {}) {
    if (options.lookupSession && req && options.getSession(req)) {
      options.getSession(req)[options.lookupSession] = lng
    }
  }
}
