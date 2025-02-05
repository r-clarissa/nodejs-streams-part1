const fs = require('fs')
const csv = require('csvtojson')
const { Transform, pipeline } = require('stream')
const { stringify } = require('csv-stringify')

const main = async () => {
  const readStream = fs.createReadStream('./data/import.csv', {
    highWaterMark: 50,
  })

  const writeStream = fs.createWriteStream('./data/export.csv')

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

      console.log('User passed filter: ', user)
      callback(null, user)
    }
  })

  // New transform to convert the user object back into a CSV string
  const toCSV = new Transform({
    objectMode: true,
    transform(user, enc, callback) {
      // Convert user object to a CSV row (this converts it to a string)
      stringify([user], (err, csvRow) => {
        if (err) {
          callback(err)
          return
        }
        callback(null, csvRow + '\n')  // Ensure a newline after each row
      })
    }
  })

  try {
    await pipeline(
      readStream,
      csv({ delimiter: ';' }, { objectMode: true }),  // Parse CSV into objects
      myTransform,
      myFilter,
      toCSV,  // Convert objects back to CSV format
      writeStream,  // Final writable stream
      (err) => {
        if (err) {
          console.error('Pipeline failed:', err)
        } else {
          console.log('Pipeline succeeded.')
        }
      }
    )
    console.log('Stream ended')
  } catch (error) {
    console.error('Stream ended with error: ', error)
  }
}

main()
