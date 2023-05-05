import fastify from 'fastify'
import { Knex } from './database'

const app = fastify()

app.get('/hello', async () => {
  // tabela universal automatica
  const tables = await Knex('sqlite_schema').select('*')
  return tables
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP server running')
  })
