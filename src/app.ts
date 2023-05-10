import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { transactionRoutes } from './routes/transactions'

export const app = fastify()
// colocar os cookies antes, ja que as outras rotas usaram ele
app.register(cookie)

app.register(transactionRoutes, {
  prefix: 'transactions',
})
