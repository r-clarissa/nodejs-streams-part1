const mongoose = require('mongoose')
const fs = require('fs')
const csv = require('csvtojson')
const { Transform } = require('stream')
const { pipeline } = require('stream/promises')
const bufferingSObjectStream = require('buffering-object-stream')
const UserModel = require('./user')

const main = async () => {
  await mongoose.connect('mongodb://localhost:27017/myapp')

  const readStream = fs.createReadStream('./data/import.csv', {
    highWaterMark: 50,
  })

  const myTransform = new Transform({
    objectMode: true,
    transform(chunk, enc, cb) {
      const user = {
        name: chunk.name,
        email: chunk.email.toLowerCase(),
        age: Number(chunk.age),
        salary: Number(chunk.salary),
        isActive: chunk.isActive === 'true',
      }

      console.log('User: ', user)
      cb(null, user)
    }
  })

  const myFilter = new Transform({
    objectMode: true,
    transform(user, enc, cb) {
      if (!user.isActive || user.salary < 1000) {
        cb(null)
        return
      }

      console.log('User: ', user)
      cb(null, user)
    }
  })

  const convertToNdJson = new Transform({
    objectMode: true,
    transform(user, enc, cb) {
      const ndjson = JSON.stringify(user) + '\n'
      cb(null, ndjson)
    }
  })

  const saveUser = new Transform({
    objectMode: true,
    async transform(user, enc, cb) {
      await UserModel.create(user)
      cb(null)
    }
  })

  const saveUsers = new Transform({
    objectMode: true,
    async transform(users, enc, cb) {
      // const promises = user.map(user => UserModel.create(user))
      // await Promise.all(promises)
      await UserModel.bulkWrite(
        users.map(user => ({
          insertOne: {
            document: user
          }
        }))
      )
    
      cb(null)
    }
  })

  try {
    await pipeline(
      readStream,
      csv({ delimiter: ';' }, { objectMode: true }),
      myTransform,
      // myFilter,
      bufferingSObjectStream(100),
      // saveUser,
      saveUsers
    )
    console.log('Stream ended')
    process.exit(0)
  } catch (error) {
    console.error('Stream ended with error: ', error)
  }
}

main()
