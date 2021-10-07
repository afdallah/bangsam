function excludeProps (obj, toExclude = '' || []) {
  if (typeof obj !== 'object') return new Error('Its not an object')
  const result = {}
  let filter = null

  for (const key in obj) {
    if (typeof toExclude === 'string') {
      filter = key === toExclude
    } else {
      filter = toExclude.includes(key)
    }

    if (filter) continue
    result[key] = obj[key]
  }

  return result
}

module.exports = {
  excludeProps
}
