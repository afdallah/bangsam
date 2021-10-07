const faker = require('faker')

const create = () => {
  return {

    item_details: [
      {
        name: 'Besi',
        weight: faker.random.number()
      }
    ],
    amount: 120000000,
    address: {
      province: faker.address.country(),
      district: faker.address.state(),
      regency: faker.address.streetName(),
      village: faker.address.streetSuffix()
    }
  }
}

module.exports = {
  create
}
