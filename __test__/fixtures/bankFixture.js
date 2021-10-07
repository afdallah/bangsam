const faker = require('faker')

const password = faker.internet.password()
const create = () => {
  return {
    branch_name: faker.company.companyName() + ' ' + faker.company.companySuffix(),
    password,
    password_confirmation: password,
    phone_number: faker.phone.phoneNumberFormat().split('-').join(''),
    address: faker.address.streetAddress()
  }
}

module.exports = {
  create,
  generate: faker
}
