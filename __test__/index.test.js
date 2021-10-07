const supertest = require('supertest')
const app = require('../app.js')
const request = supertest(app)

describe('Test the root path', () => {
  test('It should response 404', (done) => {
    request.get('/haha').then((res) => {
      expect(res.text).toBe('The page you are looking for is not found')
      expect(res.statusCode).toBe(404)
      done()
    })
  })
})
