const specialCases = ['hans', 'hant', 'latn', 'cyrl', 'cans', 'mong', 'arab']

export default {
  name: 'header',

  lookup (req, res, options) {
    let found

    if (typeof req !== 'undefined') {
      const headers = options.getHeaders(req)
      if (!headers) return found

      const locales = []
      const acceptLanguage = options.lookupHeader ? headers[options.lookupHeader] : headers['accept-language']

      if (acceptLanguage) {
        let lookupRegex = /(([a-z]{2,3})-?([A-Z]{2})?)\s*;?\s*(q=([0-9.]+))?/gi
        if (acceptLanguage.indexOf('-') > 0) {
          const foundSpecialCase = specialCases.find((s) => acceptLanguage.toLowerCase().indexOf(`-${s}`) > 0)
          if (foundSpecialCase) lookupRegex = /(([a-z]{2,3})-?([A-Z]{4})?)\s*;?\s*(q=([0-9.]+))?/gi
        }
        const lngs = []; let i; let m
        const rgx = options.lookupHeaderRegex || lookupRegex

        do {
          m = rgx.exec(acceptLanguage)
          if (m) {
            const lng = m[1]; const weight = m[5] || '1'; const q = Number(weight)
            if (lng && !isNaN(q)) {
              lngs.push({ lng, q })
            }
          }
        } while (m)

        lngs.sort(function (a, b) {
          return b.q - a.q
        })

        for (i = 0; i < lngs.length; i++) {
          locales.push(lngs[i].lng)
        }

        if (locales.length) found = locales
      }
    }

    return found
  }
}
