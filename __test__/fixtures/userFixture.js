const faker = require('faker')

const password = faker.internet.password()
function create () {
  return {
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    email: faker.internet.email().toLowerCase(),
    password,
    password_confirmation: password,
    phone_number: faker.phone.phoneNumberFormat(),
    address: faker.address.streetAddress()
  }
}

module.exports = {
  create
}
