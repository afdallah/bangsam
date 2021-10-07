const supertest = require('supertest')
const app = require('../app.js')
const request = supertest(app)
const bankFixture = require('./fixtures/bankFixture')
// const userFixture = require('./fixtures/userFixture')
const dotenv = require('dotenv')
dotenv.config()

const branch = bankFixture.create()
// const user = userFixture.create()

const update = {
  branch_name: 'toko ricky',
  phone_number: '0877656681',
  password_digest: 'ganteng.com',
  address: 'di jonggol kiri dikit',
  balance: 12000000,
  blocked: true
}

const { connectDB } = require('../setup-test.js')
connectDB(process.env.DB_CONNECTION_TEST)

let token = null

describe('Bank Collection', () => {
  describe('POST /branches/register', () => {
    test('Should create a new bank', (done) => {
      request.post('/branches/register')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(branch)).then((res) => {
          expect(res.statusCode).toBe(201)
          expect(res.body.status).toBe(true)
          expect(res.body.data).toHaveProperty('token')
          expect(res.body.data).toHaveProperty('phone_number')
          expect(res.body.data).toHaveProperty('address')
          expect(res.body.data).not.toHaveProperty('password_digest')
          done()
        })
    })

    test('Should not create a new branch due to duplicate phone number', (done) => {
      request.post('/branches/register')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(branch)).then((res) => {
          expect(res.statusCode).toBe(400)
          done()
        })
    })

    test('Should not create a new branch due to missmatch password', (done) => {
      const password = bankFixture.generate.internet.password()
      request.post('/branches/register')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ ...branch, password })).then((res) => {
          expect(res.statusCode).toBe(422)
          expect(res.body.message).toMatch('Your password and its confimation is not match')
          done()
        })
    })
  })

  describe('POST /branches/login', () => {
    test('Should login the branch account ', (done) => {
      request.post('/branches/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          phone_number: branch.phone_number,
          password: branch.password
        }))
        .then((res) => {
          const { data } = res.body

          token = data.token
          expect(res.statusCode).toBe(200)
          expect(data).toHaveProperty('token')
          done()
        })
    })

    test('Should not login the branch account due to empty phone field', (done) => {
      request.post('/branches/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          phone_number: '',
          password: branch.password
        }))
        .then((res) => {
          const { status, message } = res.body
          expect(res.statusCode).toBe(422)
          expect(status).toBe(false)
          expect(message).toMatch('Phone number is required')
          done()
        })
    })

    test('Should not login the branch account due to empty password', (done) => {
      request.post('/branches/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          phone_number: branch.phone_number,
          password: ''
        }))
        .then((res) => {
          const { status, message } = res.body
          expect(res.statusCode).toBe(422)
          expect(status).toBe(false)
          expect(message).toMatch('Password is required')
          done()
        })
    })

    test('Should not login the branch account due to wrong phone/password', (done) => {
      request.post('/branches/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          phone_number: branch.phone_number,
          password: bankFixture.generate.lorem.word()
        }))
        .then((res) => {
          const { status, message } = res.body
          expect(res.statusCode).toBe(422)
          expect(status).toBe(false)
          expect(message).toMatch('You phone number or password is incorrect')
          done()
        })
    })
  })

  describe('GET /branches', () => {
    test('Should returns all created branch from the record', (done) => {
      request.get('/branches')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .then((res) => {
          const { data } = res.body
          expect(res.statusCode).toBe(200)
          expect(Array.isArray(data.docs)).toEqual(true)
          done()
        })
    })
  })

  describe('GET /branches?query={branch_name}', () => {
    test('Should returns all branch by name', (done) => {
      request.get(`/branches?query=${branch.branch_name.slice(0, 5)}`)
        .set('Content-Type', 'application/json')
        .then((res) => {
          const { data } = res.body
          expect(res.statusCode).toBe(200)
          expect(Array.isArray(data.docs)).toEqual(true)
          done()
        })
    })
  })

  describe('GET /branches/current', () => {
    test('Should show current logged in branch', (done) => {
      request.get('/branches/current')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .then((res) => {
          const { data } = res.body
          expect(res.statusCode).toBe(200)
          expect(data).toHaveProperty('branch_name')
          expect(res.body.data).not.toHaveProperty('password_digest')
          done()
        })
    })
  })

  describe('PUT /branches/update', () => {
    test('Should update current bank', (done) => {
      request.put('/branches/update')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .send(JSON.stringify(update))
        .then((res) => {
          expect(res.statusCode).toBe(200)
          expect(res.body.status).toBe(true)
          expect(res.body).toHaveProperty('data')
          expect(res.body.data).not.toBe(null)
          done()
        })
    })
  })
})

describe('PUT /branches/update-password', () => {
  test('Should successfully update password', (done) => {
    request.put('/branches/update-password')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .send(JSON.stringify({
        old_password: branch.password,
        password: '1234567',
        password_confirmation: '1234567'
      }))
      .then((res) => {
        expect(res.statusCode).toBe(200)
        expect(res.body.status).toBe(true)
        expect(res.body.data).toBe('Successfully change password')
        done()
      })
  })
  test('Should successfully update password', (done) => {
    request.put('/branches/update-password')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .send(JSON.stringify(update))
      .then((res) => {
        expect(res.statusCode).toBe(400)
        expect(res.body.status).toBe(false)
        // expect(res.body.message).toBe('Illegal arguments: string, undefined')
        done()
      })
  })
})
