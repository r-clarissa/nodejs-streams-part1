import { Readable, Transform, Writable, pipeline } from 'node:stream'

import logger from './logger.js'

const data = [
  'angel.rodelas@siteminder.com',
  'ariel.magno@siteminder.com',
  'carl.angeles@siteminder.com',
  'christian.banez@siteminder.com',
  'clarissa.rodriguez@siteminder.com',
  'jan.estilo@siteminder.com',
  'dominic.malonjao@siteminder.com',
  'john.manalang@siteminder.com',
  'kyla.cruz@siteminder.com',
  'lara.pineda@siteminder.com',
  'lawrence.lardizabal@siteminder.com',
  'matthew.lucero@siteminder.com',
]

// const obj = {
//   firstName: 'Angel',
//   lastName: 'Rodelas',
//   domain: 'siteminder.com',
// }

// const readable = Readable.from(data)
// const readable = new Readable({
//   read() {
//     if (data.length === 0) {
//       this.push(null)
//       return
//     }

//     this.push(data.shift())
//   },
// })

class MyReadable extends Readable {
  constructor(data = [], options) {
    super(options)
    this.data = data
  }

  _read() {
    if (this.data.length === 0) {
      this.push(null)
      return
    }

    this.push(this.data.shift())
  }
}

const readable = new MyReadable(data)

// const transform = new Transform({
//   // encoding: 'hex',
//   transform(chunk, enc, cb) {
//     const [name] = chunk.toString('utf8').split('@')
//     cb(null, `${name}\n`)
//     // cb(null, chunk.toString('utf8').toUpperCase())
//   },
// })

class myTransform extends Transform {
  constructor(options = {}) {
    super({
      ...options,
      readableObjectMode: true,
    })
  }

  _transform(chunk, enc, cb) {
    const [name, domain] = chunk.toString('utf8').split('@')
    cb(null, { name, domain })
  }
}

const transform = new myTransform()

class MyWritable extends Writable {
  constructor(logger, options = {}) {
    super({
      ...options,
      objectMode: true,
    })
    this.logger = logger
  }

  _write(data, enc, cb) {
    this.logger.info(JSON.stringify(data))
    cb()
  }
}

const writable = new MyWritable(logger, { objectMode: true })

pipeline(readable, transform, writable, (error) => {
  if (error) {
    console.log(error.message)
  }

  console.log('Done!')
})
