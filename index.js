import { Readable, pipeline } from 'node:stream'

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
  'matthew.lucer@siteminder.com\n',
]

const readable = Readable.from(data)

pipeline(readable, process.stdout, (error) => {
  if (error) {
    console.log(error.message)
  }

  console.log('Done!')
})
