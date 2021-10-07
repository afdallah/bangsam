const supertest = require('supertest')
const app = require('../app.js')
const request = supertest(app)
const dotenv = require('dotenv')
dotenv.config()

const userFixture = require('./fixtures/userFixture.js')
const newUser = userFixture.create()
const { connectDB } = require('../setup-test.js')
let token = null

connectDB(process.env.DB_CONNECTION_TEST)

describe('POST /users/register', () => {
  test('Should create user succesfully', (done) => {
    request.post('/users/register')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(newUser)).then((res) => {
        token = res.body.data.token
        expect(res.statusCode).toBe(201)
        expect(res.body.status).toBe(true)
        expect(res.body.data).toHaveProperty('token')
        expect(res.body.data).toHaveProperty('_id')
        expect(res.body.data).toHaveProperty('first_name')
        expect(res.body.data).toHaveProperty('email')
        expect(res.body.data).not.toHaveProperty('password_digest')
        done()
      })
  })

  test.skip('Should failed create user because email must be unique', (done) => {
    request.post('/users/register')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(newUser)).then((res) => {
        token = res.body.data.token
        expect(res.statusCode).toBe(400)
        expect(res.body.status).toBe(false)
        expect(res.body).toHaveProperty('message')
        done()
      })
  })

  test('Should failed create user because first_name is required', (done) => {
    request.post('/users/register')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({
        last_name: newUser.last_name,
        email: 'rickyganteng@gmail.com',
        password: '123456',
        password_confirmation: '123456',
        phone_number: '00871238572'
      })).then((res) => {
        expect(res.statusCode).toBe(400)
        expect(res.body.status).toBe(false)
        expect(res.body.message).toBe('User validation failed: first_name: Name field is required')
        done()
      })
  })

  test('Should failed create user because password is required', (done) => {
    request.post('/users/register')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({
        first_name: 'rickyGanteng',
        email: 'rickyganteng@gmail.com'
      })).then((res) => {
        expect(res.statusCode).toBe(400)
        expect(res.body.status).toBe(false)
        expect(res.body.message).toBe('Illegal arguments: undefined, string')
        done()
      })
  })

  test('Should failed create user because email format is wrong', (done) => {
    request.post('/users/register')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({
        ...newUser,
        email: 'mamaku'
      })).then((res) => {
        expect(res.statusCode).toBe(400)
        expect(res.body.status).toBe(false)
        done()
      })
  })
})

test('Should failed create user because phone number is required', (done) => {
  request.post('/users/register')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify({
      last_name: newUser.last_name,
      first_name: 'rickyMantap',
      email: 'rickyganteng@gmail.com',
      password: '123456',
      password_confirmation: '123456'
    }))
    .then((res) => {
      expect(res.statusCode).toBe(400)
      expect(res.body.status).toBe(false)
      expect(res.body.message).toBe('User validation failed: phone_number: Phone number is required')
      done()
    })
})

describe('POST /users/login', () => {
  test('should be login and generate token', (done) => [
    request.post('/users/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(newUser)).then((res) => {
        token = res.body.data.token
        expect(res.statusCode).toBe(200)
        expect(res.body.status).toBe(true)
        expect(res.body.data).not.toBe(null)
        done()
      })
  ])
  test('should not login because wrong password', (done) => [
    request.post('/users/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({
        ...newUser,
        password: '123456'
      })).then((res) => {
        expect(res.statusCode).toBe(422)
        expect(res.body.status).toBe(false)
        expect(res.body.message).toBe('Wrong Password')
        done()
      })
  ])

  test('cannot login beacuse email wasnt registered yet', (done) => [
    request.post('/users/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({
        ...newUser,
        email: 'rickygundulhijauoren@gmail.com',
        phone_number: '123131'
      })).then((res) => {
        expect(res.statusCode).toBe(404)
        expect(res.body.status).toBe(false)
        expect(res.body.message).toBe('Your phone number or email is not registered. Register now!')
        done()
      })
  ])
})

describe('/users/show', () => {
  test('Should show all users', (done) => {
    request.get('/users/show')
      .then((res) => {
        expect(res.statusCode).toBe(200)
        expect(res.body.status).toBe(true)
        done()
      })
  })
})

describe('/users/current', () => {
  test('should show the current user', (done) => {
    request.get('/users/current')
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        console.log('fullname', res.body)
        expect(res.statusCode).toBe(200)
        expect(res.body.status).toBe(true)
        done()
      })
  })
})

describe('PUT /users/update', () => {
  test('Should succesfully update the first_name', (done) => {
    request.put('/users/update')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'Application/json')
      .send(JSON.stringify({ first_name: 'gantengcom' }))
      .then((res) => {
        expect(res.statusCode).toBe(200)
        expect(res.body.status).toBe(true)
        done()
      })
  })

  test('Should succesfully update the email', (done) => {
    request.put('/users/update')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'Application/json')
      .send(JSON.stringify({ email: 'ganteng@gmail.com' }))
      .then((res) => {
        expect(res.statusCode).toBe(200)
        expect(res.body.status).toBe(true)
        done()
      })
  })
})

describe('PUT users/update-password', () => {
  test('Should Succesfully update password', (done) => {
    request.put('/users/update-password')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'Application/json')
      .send(JSON.stringify({
        old_password: newUser.password,
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
  test('Should not changed email', (done) => {
    request.put('/users/update-password')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'Application/json')
      .send(JSON.stringify({
        email: 'ricky.bangscrew@gmai.com'
      }))
      .then((res) => {
        expect(res.statusCode).toBe(400)
        expect(res.body.status).toBe(false)
        // expect(res.body.message).toBe('Illegal arguments: string, undefined')
        done()
      })
  })
})
