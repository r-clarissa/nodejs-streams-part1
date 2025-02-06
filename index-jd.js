import { Readable, Writable, pipeline, Transform } from 'node:stream'
import logger from './logger.js'
const data = ['Kyla 1', 'Eyds 2', 'Jason 3', 'UPLB 4', 'Coleen 5', 'Clarissa 6', 'JD 7', 'Angel 8', 'Lawrence 9', 'Christian 10', 'Last Guy']
// const data2 = ['Kyla', 'Eyds', 'Jason', 'UPLB', 'Coleen', 'Clarissa', 'JD', 'Angel', 'Lawrence', 'Christian', 'Last Guy']
// const readable = Readable.from(data)
// pipeline(readable, process.stdout,(error)=>{
//   if(error){
//     console.log(error.message)
//   }
//   console.log('Done')
// })               WHY error if this not
class MyReadable extends Readable {
  // constructor(opts){  THIS IS ACTUALLY EQUAL TO JUST ERASING THIS. SINCE YOU ARE NOT MODIFYING ANYTHING TO THE CONSTRUCTOR
  //   super(opts)
  // }
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

  _final(callback) {
    this.logger.info('readable._final()')
    callback()
  }
}
class MyTransform extends Transform {
  constructor(options = {}) {
    super({
      ...options,
      readableObjectMode: true,
    })
  }

  _transform(chunk, encoding, callback) {
    const [name, number] = chunk.toString('utf8').split(' ')
    // chunk.toString().toUpperCase()
    callback(null, JSON.stringify({ name, number }))
  }
}
class MyWritable extends Writable {
  constructor(logger, options = {}) { // we need an empty {} because we used ...options. We cannot spread null or undefined only on iterables (i.e. objects)
    super({
      ...options,
      objectMode: true,
    })
    this.logger = logger
  }

  _write(chunk, encoding, callback) {
    this.logger.info(JSON.stringify(chunk))
    callback()
  }
}
// const readable2 = new Readable({
//   read() {
//     if(data.length === 0){
//       this.push(null)
//       return
//     }
//     this.push(data.shift())
//   }
// })
const readable2 = new MyReadable(data)
const transform = new MyTransform()
const writable = new MyWritable(logger)
readable2.on('end', () => {
  logger.info('read event has fiinshed')
})
writable.on('finish', () => {
  logger.info('writable event has fiinshed')
})
// const transform = new Transform({
//   //encoding: 'base64',
//   transform(chunk, encoding, callback){
//     const [name] = chunk.toString('utf8').split(' ')
//     //chunk.toString().toUpperCase()
//     callback(null, `${name}\n`)
//   }
// })
pipeline(readable2, transform, process.stdout, (error) => {
  if (error) {
    console.log(error.message)
  }
  console.log('Done')
  // console.log('12312312')
})
// console.log("3123123")
// NOTES: pipelined streams needs to have same same mode: i.e. object
// but if you are not using pipeline, i.e. .on 'data' , .write
