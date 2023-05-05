import { knex as setupKnex } from 'knex'

export const Knex = setupKnex({
  client: 'sqlite',
  connection: {
    filename: './tmp/app.db',
  },
})
