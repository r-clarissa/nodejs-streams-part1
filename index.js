const fs = require('fs')
const csv = require('csvtojson')
const { Transform } = require('stream')
const { pipeline } = require('stream/promises')


const main = async () => {
  const readStream = fs.createReadStream('./data/import.csv', {
    highWaterMark: 50,
  })

  const myTransform = new Transform({
    objectMode: true,
    transform(chunk, enc, callback) {
      const user = {
        name: chunk.name,
        email: chunk.email.toLowerCase(),
        age: Number(chunk.age),
        salary: Number(chunk.salary),
        isActive: chunk.isActive === 'true',
      }

      console.log('User: ', user)
      callback(null, user)
    }
  })

  const myFilter = new Transform({
    objectMode: true,
    transform(user, enc, callback) {
      if (!user.isActive || user.salary < 1000) {
        callback(null)
        return
      }

      console.log('User: ', user)
      callback(null, user)
    }
  })

  try {
    await pipeline(
      readStream,
      csv({ delimiter: ';' }, { objectMode: true }),
      myTransform,
      myFilter,
    )
    console.log('Stream ended')
  } catch (error) {
    console.error('Stream ended with error: ', error)
  }
}

main()
