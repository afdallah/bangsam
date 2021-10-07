const Nexmo = require('nexmo')

const nexmo = new Nexmo({
  apiKey: '0b3ba5f0',
  apiSecret: 'Wzj3No9ufE8w8WjK'
})

function send (data) {
  const from = data.from || 'Vonage APIs'
  const to = data.phone_number || '6287781826464'
  const text = data.text || 'Hello from Vonage SMS API'

  return nexmo.message.sendSms(from, to, text)
}

function verify (data) {
  return new Promise((resolve, reject) => {
    nexmo.verify.request({
      number: data.number || '6287781826464',
      brand: data.brand || 'Vonage',
      code_length: data.code_length || '4'
    }, (err, result) => {
      console.log(err || result)
      if (err) {
        return reject(err)
      }

      return resolve(result)
    })
  })
}

function check (data) {
  return new Promise((resolve, reject) => {
    nexmo.verify.check({
      request_id: data.request_id,
      code: data.code
    }, (err, result) => {
      console.log(err || result)
      if (err) {
        return reject(err)
      }

      return resolve(result)
    })
  })
}

module.exports = {
  send,
  verify,
  check
}
