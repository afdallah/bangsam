const supertest = require('supertest')
const app = require('../app.js')
const request = supertest(app)
const bankFixture = require('./fixtures/bankFixture')
const userFixture = require('./fixtures/userFixture')
const pickRequestFixture = require('./fixtures/pickRequestFixture')
const dotenv = require('dotenv')
dotenv.config()

const branch = bankFixture.create()
const user = userFixture.create()
const pickRequest = pickRequestFixture.create()

let token
let branchToken
let branchId
let requestId

const { connectDB } = require('../setup-test.js')
connectDB(process.env.DB_CONNECTION_TEST)

describe('/pick-ups/', () => {
  test('make user', (done) => {
    request.post('/users/register')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(user))
      .then((res) => {
        token = res.body.data.token
        done()
      })
  })
  test('Should create a new bank', (done) => {
    request.post('/branches/register')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(branch)).then((res) => {
        branchId = res.body.data._id
        branchToken = res.body.data.token
        done()
      })
  })
  test('should make a jemput sampah', (done) => {
    request.post(`/pick-ups/requests/${branchId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'Application/json')
      .send(JSON.stringify(pickRequest))
      .then((res) => {
        requestId = res.body.data._id
        expect(res.statusCode).toBe(201)
        expect(res.body.status).toBe(true)
        expect(res.body.data).not.toBe(null)
        expect(res.body.bankSampah).not.toBe(null)
        done()
      })
  })
  test('should failed make a request jemput because branch id is wrong', (done) => {
    request.post('/pick-ups/requests/123')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'Application/json')
      .send(JSON.stringify(pickRequest))
      .then((res) => {
        expect(res.statusCode).toBe(400)
        expect(res.body.status).toBe(false)
        expect(res.body.message).toBe('Pickup validation failed: branch: Cast to ObjectID failed for value "123" at path "branch"')
        done()
      })
  })
})

describe('GET /pick-ups/requests/', () => {
  test('should show request by request id', (done) => {
    request.get(`/pick-ups/requests/${requestId}`)
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.statusCode).toBe(200)
        expect(res.body.status).toBe(true)
        expect(res.body.data).not.toBe(null)
        done()
      })
  })
})

describe('GET pick-ups/requests/admin', () => {
  test('should show all request', (done) => {
    request.get('/pick-ups/requests/admin')
      .set('Authorization', `Bearer ${token}`)
      .then((res) => {
        expect(res.statusCode).toBe(200)
        expect(res.body.status).toBe(true)
        expect(res.body.data).not.toBe(null)
        done()
      })
  })

  test('should failed show all request because token false', (done) => {
    request.get('/pick-ups/requests/admin')
      .set('Authorization', 'Bearer ' + '123')
      .then((res) => {
        expect(res.statusCode).toBe(400)
        expect(res.body.status).toBe(false)
        done()
      })
  })
})

describe('PUT /pick-ups/requests/:request_id', () => {
  test('Should update the pick up', (done) => {
    request.put(`/pick-ups/requests/${requestId}`)
      .set('Authorization', `Bearer ${branchToken}`)
      .set('Content-Type', 'Application/json')
      .send(JSON.stringify({
        item_details: [{
          name: 'Besi',
          weight: 12039120931093
        }],
        amount: 11111
      }))
      .then((res) => {
        expect(res.statusCode).toBe(200)
        expect(res.body.status).toBe(true)
        expect(res.body.data).not.toBe(null)
        done()
      })
  })

  test('Should update the pick up', (done) => {
    request.put('/pick-ups/requests/1234')
      .set('Authorization', `Bearer ${branchToken}`)
      .set('Content-Type', 'Application/json')
      .send(JSON.stringify({
        item_details: [{
          name: 'Besi',
          weight: 12039120931093
        }]
      }))
      .then((res) => {
        expect(res.statusCode).toBe(400)
        expect(res.body.status).toBe(false)
        expect(res.body.message).toBe('Cast to ObjectId failed for value "1234" at path "_id" for model "Pickup"')
        done()
      })
  })
})

describe('/pick-ups/requests/:request_id/approve', () => {
  test('Should approve the pick up', (done) => {
    request.put(`/pick-ups/requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${branchToken}`)
      .set('Content-Type', 'Application/json')
      .send(JSON.stringify({
        estimated_time: 50
      }))
      .then((res) => {
        expect(res.statusCode).toBe(200)
        expect(res.body.status).toBe(true)
        expect(res.body.data).not.toBe(null)
        expect(res.body.data.estimated_time).toBe(50)
        done()
      })
  })

  test('Should failed approve the pick up', (done) => {
    request.put('/pick-ups/requests/123/approve')
      .set('Authorization', `Bearer ${branchToken}`)
      .set('Content-Type', 'Application/json')
      .send(JSON.stringify({
        estimated_time: 50
      }))
      .then((res) => {
        expect(res.statusCode).toBe(400)
        expect(res.body.status).toBe(false)
        expect(res.body.message).toBe('Cast to ObjectId failed for value "123" at path "_id" for model "Pickup"')
        done()
      })
  })
})

describe('/pick-ups/requests/:request/disapprove', () => {
  test('Should dissaprove the pick up', (done) => {
    request.put(`/pick-ups/requests/${requestId}/disapprove`)
      .set('Authorization', `Bearer ${branchToken}`)
      .set('Content-Type', 'Application/json')
      .send(JSON.stringify({
        reason: 'kamu Jelek'
      }))
      .then((res) => {
        expect(res.statusCode).toBe(200)
        expect(res.body.status).toBe(true)
        expect(res.body.data.reason).toBe('kamu Jelek')
        done()
      })
  })

  test('Should failed dissaprove the pick up', (done) => {
    request.put('/pick-ups/requests/123/disapprove')
      .set('Authorization', `Bearer ${branchToken}`)
      .set('Content-Type', 'Application/json')
      .send(JSON.stringify({
        reason: 'kamu Jelek'
      }))
      .then((res) => {
        expect(res.statusCode).toBe(400)
        expect(res.body.status).toBe(false)
        expect(res.body.message).toBe('Cast to ObjectId failed for value "123" at path "_id" for model "Pickup"')
        done()
      })
  })
})

// describe('/balances/sum-users', () => {
//   test('Should show the sum of the user funds', (done) => {
//     request.get('/balances/sum-users')
//       .set('Authorization', `Bearer ${token}`)
//       .then((res) => {
//         expect(res.statusCode).toBe(200)
//         expect(res.body.status).toBe(true)
//         expect(Array.isArray(res.body.data)).toBe(true)
//         done()
//       })
//   })
// })

// describe('/balances/sum-branches', () => {
//   test('Should show the show of the branches funds', (done) => {
//     request.get('/balances/sum-branches')
//       .set('Authorization', `Bearer ${branchToken}`)
//       .then((res) => {
//         expect(res.statusCode).toBe(200)
//         expect(res.body.status).toBe(true)
//         expect(Array.isArray(res.body.data)).toBe(true)
//         done()
//       })
//   })
// })

// describe('/balances/show-users', () => {
//   test('Should all the detail of the users balance', (done) => {
//     request.get('/balances/show-users')
//       .set('Authorization', `Bearer ${token}`)
//       .then((res) => {
//         expect(res.statusCode).toBe(200)
//         expect(res.body.status).toBe(true)
//         expect(Array.isArray(res.body.data)).toBe(true)
//         done()
//       })
//   })
// })

// describe('/balances/show-branches', () => {
//   test('Should all the detail of the branches balance', (done) => {
//     request.get('/balances/show-branches')
//       .set('Authorization', `Bearer ${branchToken}`)
//       .then((res) => {
//         expect(res.statusCode).toBe(200)
//         expect(res.body.status).toBe(true)
//         expect(Array.isArray(res.body.data)).toBe(true)
//         done()
//       })
//   })
// })
