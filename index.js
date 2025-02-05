const fs = require('fs')
const csv = require('csvtojson')
const { Transform } = require('stream')

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

      callback(null, user) // callback('Some error')
    }
  })
  
  const myFilter = new Transform({
    objectMode: true,
    transform(user, enc, callback) {
      if(!user.isActive || user.salary < 1000) {
        callback(null)
        return
      }

      callback(null, user)
    }
  })

  readStream
    .pipe(csv(
      { delimiter: ';' },
      { objectMode: true },
    ))
    .pipe(myTransform)
    .pipe(myFilter)
    .on('data', data => console.log('>>> DATA:\n', data))
    .on('error', error => console.error('Stream error: ', error))
    .on('end', () => console.log('Read stream ended'))

  writeStream.on('finish', () => console.log('Write stream finished'))
}

main()
