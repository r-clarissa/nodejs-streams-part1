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
    super({
      ...options,
      highWaterMark: 128, // binary - no. of bytes; object mode - no. of objects
    })

    this.data = data
  }

  _construct(cb) { // initialize any resources (eg. file descriptors)
    console.log('readable._construct()')
    cb()
  }

  _read(size) {
    let more = true
    console.log({ size })
    while (this.data.length && more) {
      const data = this.data.shift()
      more = this.push(data)
      console.log({ data, more })
    }

    if (this.data.length === 0) {
      this.push(null)
      return
    }
  }

  _destroy() { // stop any resources
    logger.info('readable._destroy()')
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
    const [first, last] = name.split('.')
    cb(null, {
      first: `${first.charAt(0).toUpperCase()}${first.slice(1)}`,
      last: `${last.charAt(0).toUpperCase()}${last.slice(1)}`,
      domain,
    })
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

  _final(cb) {
    this.logger.info('writable_final()')
    cb()
  }
}

const writable = new MyWritable(logger, { objectMode: true })

readable.on('end', () => {
  logger.info('readable: end event')
})

transform.on('end', () => {
  logger.info('transform: end event')
})

transform.on('finish', () => {
  logger.info('transform: finish event')
})

writable.on('finish', () => {
  logger.info('writable: finish event')
})

pipeline(readable, transform, writable, (error) => {
  if (error) {
    console.log(error.message)
  }

  console.log('Done!')
})
