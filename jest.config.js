const path = require('path')
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: path.resolve(__dirname, 'public', 'coverage'),
  testTimeout: 50000
}
