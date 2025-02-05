const fs = require('fs')

const main = async () => {
  const readStream = fs.createReadStream('./data/import.csv', {
    highWaterMark: 100,
  }) 

  const writeStream = fs.createWriteStream('./data/export.csv')

  readStream.pipe(writeStream)

  readStream.on('end', () => console.log('Read stream ended'))

  writeStream.on('finish', () => console.log('Write stream finished'))
}

main()