import { Readable, Transform, pipeline } from 'node:stream'

const data = [
  'angel.rodelas@siteminder.com\n',
  'ariel.magno@siteminder.com\n',
  'carl.angeles@siteminder.com\n',
  'christian.banez@siteminder.com\n',
  'clarissa.rodriguez@siteminder.com\n',
  'jan.estilo@siteminder.com\n',
  'dominic.malonjao@siteminder.com\n',
  'john.manalang@siteminder.com\n',
  'kyla.cruz@siteminder.com\n',
  'lara.pineda@siteminder.com\n',
  'lawrence.lardizabal@siteminder.com\n',
  'matthew.lucero@siteminder.com\n',
]

// const readable = Readable.from(data)
const readable = new Readable({
  read() {
    if (data.length === 0) {
      this.push(null)
      return
    }

    this.push(data.shift())
  },
})

const transform = new Transform({
  transform(chunk, enc, cb) {
    const [name] = chunk.toString('utf8').split('@')
    cb(null, `${name}\n`)
    // cb(null, chunk.toString('utf8').toUpperCase())
  },
})

pipeline(readable, transform, process.stdout, (error) => {
  if (error) {
    console.log(error.message)
  }

  console.log('Done!')
})
