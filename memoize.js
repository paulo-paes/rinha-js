const globalCache = {}

function memoize(cb, func, scope, calleeName) {
  let key = calleeName + '.'
  key += func.parameters.reduce((prev, acc) => {
    return prev + acc.text + '.' + (scope[acc.text] || '') +'.'
  }, '')

  if (key in globalCache) {
    return globalCache[key]
  }

  const res = cb(func.value, scope)
  globalCache[key] = res
  return res
}

module.exports = memoize