import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'

export async function transactionRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req, reply) => {
    console.log(`${req.method} + ${req.url}`)
  }) // prehandler global -> vale para todas as rotas do contexto desse plugin

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists], // executar essa função antes e valida a sessionId
    },
    async (req, reply) => {
      const { sessionId } = req.cookies
      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()

      return { transactions } // mais fácil add ou remover infos no futuro
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists], // executar essa função antes e valida a sessionId
    },
    async (req) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id } = getTransactionParamsSchema.parse(req.params)
      const { sessionId } = req.cookies
      // método first -> pegar o primeiro resultado
      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id,
        })
        .first()

      return { transaction }
    },
  )
  // resumo da conta -> soma da coluna amount
  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists], // executar essa função antes e valida a sessionId
    },
    async (req) => {
      const { sessionId } = req.cookies
      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()
      return { summary }
    },
  )

  app.post('/', async (req, reply) => {
    const createdTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })
    const { title, amount, type } = createdTransactionBodySchema.parse(req.body)
    // validando os dados do request body para ver se batem com meu schema

    // procurando dentro dos cookies pra saber se ja existe uma sessionId
    let sessionId = req.cookies.sessionId
    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/', // todas as rotas podem acessar
        maxAge: 1000 * 60 * 60 * 24 * 7, // tempo de expiração de cookies - 7dias
      }) // salvar nos cookies usando o reply
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
