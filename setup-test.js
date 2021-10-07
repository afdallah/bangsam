const mongoose = require('mongoose')

async function dropAllCollections () {
  const collections = Object.keys(mongoose.connection.collections)
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName]
    try {
      await collection.drop()
    } catch (error) {
      // Sometimes this error happens, but you can safely ignore it
      if (error.message === 'ns not found') return
      // This error occurs when you use it.todo. You can
      // safely ignore this error too
      if (error.message.includes('a background operation is currently running')) return
      console.log(error.message)
    }
  }
}

module.exports = {
  connectDB (connectionString) {
    beforeAll((done) => {
      mongoose.connect(connectionString, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true
      })
        .then(() => null)
        .catch(err => console.log(err))
      done()
    })

    afterAll(async (done) => {
      await dropAllCollections()
      await mongoose.connection.close()
      done()
    })
  }
}
