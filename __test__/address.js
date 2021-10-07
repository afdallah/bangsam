const supertest = require('supertest')
const app = require('../app.js')
const request = supertest(app)
const dotenv = require('dotenv')
dotenv.config()

const { connectDB } = require('../setup-test.js')
connectDB(process.env.DB_CONNECTION_TEST)

const address = {
  id_prov: null,
  id_dist: null,
  id_reg: null
}

describe('Address endpoints', () => {
  describe('GET /address/provinces', () => {
    test('Should return array of province', (done) => {
      request.get('/address/provinces')
        .set('Content-Type', 'application/json')
        .then(res => {
          address.id_prov = res.body.data[0].id
          expect(res.statusCode).toBe(200)
          expect(res.body.status).toBe(true)
          expect(Array.isArray(res.body.data)).toBe(true)
          done()
        })
    })
  })

  describe('GET /address/districts/{id_prov}', () => {
    test('Should return array of districts', (done) => {
      request.get(`/address/districts/${address.id_prov}`)
        .set('Content-Type', 'application/json')
        .then(res => {
          address.id_dist = res.body.data[0].id
          expect(res.statusCode).toBe(200)
          expect(res.body.status).toBe(true)
          expect(Array.isArray(res.body.data)).toBe(true)
          done()
        })
    })
  })

  describe('GET /address/regencies/{id_dist}', () => {
    test('Should return array of districts', (done) => {
      request.get(`/address/regencies/${address.id_dist}`)
        .set('Content-Type', 'application/json')
        .then(res => {
          address.id_reg = res.body.data[0].id
          expect(res.statusCode).toBe(200)
          expect(res.body.status).toBe(true)
          expect(Array.isArray(res.body.data)).toBe(true)
          done()
        })
    })
  })

  describe('GET /address/villages/{id_reg}', () => {
    test('Should return array of village', (done) => {
      request.get(`/address/villages/${address.id_reg}`)
        .set('Content-Type', 'application/json')
        .then(res => {
          expect(res.statusCode).toBe(200)
          expect(res.body.status).toBe(true)
          expect(Array.isArray(res.body.data)).toBe(true)
          done()
        })
    })
  })
})
